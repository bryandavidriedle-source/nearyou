import { redirect } from "next/navigation";

import { serverEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ProviderWorkflowStatus } from "@/lib/workflow";

export type AppRole = "customer" | "provider" | "admin";
export type AdminScope = "super_admin" | "admin_ops" | "admin_support" | "admin_review";

type ProviderAccess = {
  providerAccessLevel: "provider" | "candidate";
  providerApplication: {
    id: string;
    workflow_status: ProviderWorkflowStatus;
    category: string | null;
    city: string | null;
    reviewed_at: string | null;
    admin_note: string | null;
  } | null;
  isSuspended: boolean;
};

type AuthContext = Awaited<ReturnType<typeof getAuthContext>>;
type AuthenticatedContext = Omit<AuthContext, "user"> & {
  user: NonNullable<AuthContext["user"]>;
};

function safeNextPath(path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  return path;
}

export async function getAuthContext() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      role: null as AppRole | null,
      profile: null,
      adminScope: null as AdminScope | null,
      providerWorkflowStatus: null as ProviderWorkflowStatus | null,
    };
  }

  const [{ data: profile }, { data: adminAccount }, { data: providerApplication }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, role, first_name, last_name, phone, city, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("admin_accounts")
      .select("scope, is_active")
      .eq("profile_id", user.id)
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("provider_applications")
      .select("workflow_status")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const isConfiguredSuperAdmin = user.email?.toLowerCase() === serverEnv.SUPER_ADMIN_EMAIL?.toLowerCase();

  const computedRole: AppRole = isConfiguredSuperAdmin
    ? "admin"
    : ((profile?.role as AppRole | null) ?? "customer");

  const computedScope =
    (adminAccount?.scope as AdminScope | null) ??
    (isConfiguredSuperAdmin ? "super_admin" : null);

  return {
    user,
    role: computedRole,
    profile,
    adminScope: computedScope,
    providerWorkflowStatus: (providerApplication?.workflow_status as ProviderWorkflowStatus | null) ?? null,
  };
}

export async function resolveAuthenticatedHomePath() {
  const context = await getAuthContext();
  if (!context.user) return "/connexion";

  if (context.role === "admin") {
    return "/backoffice";
  }

  if (context.role === "provider") {
    return "/espace-prestataire";
  }

  if (context.providerWorkflowStatus) {
    return "/espace-prestataire";
  }

  return "/espace-client";
}

function fallbackPathForRole(role: AppRole | null) {
  if (role === "admin") return "/backoffice";
  if (role === "provider") return "/espace-prestataire";
  return "/espace-client";
}

export function isSuperAdmin(context: { adminScope: AdminScope | null }) {
  return context.adminScope === "super_admin";
}

export function hasAdminScope(context: { adminScope: AdminScope | null }, scopes: AdminScope[]) {
  return Boolean(context.adminScope && scopes.includes(context.adminScope));
}

export async function requireAuthenticatedUser(redirectTo = "/connexion", nextPath = "/"): Promise<AuthenticatedContext> {
  const context = await getAuthContext();
  if (!context.user) {
    redirect(`${redirectTo}?next=${encodeURIComponent(safeNextPath(nextPath))}`);
  }
  return context as AuthenticatedContext;
}

export async function requireAuth(redirectTo = "/connexion") {
  const context = await requireAuthenticatedUser(redirectTo);
  return context;
}

export async function requireRole(role: AppRole) {
  const context = await requireAuth();
  if (context.role !== role) {
    redirect(fallbackPathForRole(context.role));
  }
  return context;
}

export async function requireAdminScope(scope: AdminScope | AdminScope[]) {
  const scopes = Array.isArray(scope) ? scope : [scope];
  const context = await requireRole("admin");
  if (!hasAdminScope(context, scopes)) {
    redirect("/acces-refuse");
  }
  return context;
}

export async function requireAdminScopes(scopes: AdminScope[]) {
  return requireAdminScope(scopes);
}

async function getLatestProviderApplication(profileId: string) {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("provider_applications")
    .select("id, workflow_status, category, city, reviewed_at, admin_note")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id,
    workflow_status: data.workflow_status as ProviderWorkflowStatus,
    category: data.category,
    city: data.city,
    reviewed_at: data.reviewed_at,
    admin_note: data.admin_note,
  };
}

export async function requireProviderAccess() {
  const context = await requireAuthenticatedUser();

  if (context.role === "provider") {
    const providerApplication = await getLatestProviderApplication(context.user.id);
    return {
      ...context,
      providerAccessLevel: "provider" as const,
      providerApplication,
      isSuspended: providerApplication?.workflow_status === "suspended",
    };
  }

  const providerApplication = await getLatestProviderApplication(context.user.id);
  if (!providerApplication) {
    redirect("/devenir-prestataire?next=/espace-prestataire");
  }

  return {
    ...context,
    providerAccessLevel: "candidate" as const,
    providerApplication,
    isSuspended: providerApplication.workflow_status === "suspended",
  };
}

export async function requireApiRole(role: AppRole) {
  const context = await getAuthContext();
  if (!context.user || context.role !== role) {
    return null;
  }
  return context as AuthenticatedContext;
}

export async function requireApiAdminScopes(scopes: AdminScope[]) {
  const context = await requireApiRole("admin");
  if (!context || !hasAdminScope(context, scopes)) {
    return null;
  }
  return context;
}

export async function requireApiProviderAccess(): Promise<(AuthenticatedContext & ProviderAccess) | null> {
  const context = await getAuthContext();
  if (!context.user) return null;

  if (context.role === "provider") {
    const providerApplication = await getLatestProviderApplication(context.user.id);
    return {
      ...context,
      providerAccessLevel: "provider",
      providerApplication,
      isSuspended: providerApplication?.workflow_status === "suspended",
    };
  }

  const providerApplication = await getLatestProviderApplication(context.user.id);
  if (!providerApplication) {
    return null;
  }

  return {
    ...context,
    providerAccessLevel: "candidate",
    providerApplication,
    isSuspended: providerApplication.workflow_status === "suspended",
  };
}
