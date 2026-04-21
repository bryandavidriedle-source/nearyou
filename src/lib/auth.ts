import { redirect } from "next/navigation";

import { serverEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AppRole = "customer" | "provider" | "admin";
export type AdminScope = "super_admin" | "admin_ops" | "admin_support" | "admin_review";

export async function getAuthContext() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, role: null as AppRole | null, profile: null, adminScope: null as AdminScope | null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data: adminAccount } = await supabase
    .from("admin_accounts")
    .select("scope, is_active")
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  const isConfiguredSuperAdmin = user.email?.toLowerCase() === serverEnv.SUPER_ADMIN_EMAIL?.toLowerCase();

  const computedRole: AppRole =
    (profile?.role as AppRole | null) ?? (isConfiguredSuperAdmin ? "admin" : "customer");

  const computedScope =
    (adminAccount?.scope as AdminScope | null) ??
    (isConfiguredSuperAdmin ? "super_admin" : null);

  return {
    user,
    role: computedRole,
    profile,
    adminScope: computedScope,
  };
}

export async function requireAuth(redirectTo = "/connexion") {
  const context = await getAuthContext();
  if (!context.user) {
    redirect(`${redirectTo}?next=${encodeURIComponent("/espace-client")}`);
  }
  return context;
}

export async function requireRole(role: AppRole) {
  const context = await requireAuth();
  if (context.role !== role) {
    redirect("/");
  }
  return context;
}

export async function requireAdminScopes(scopes: AdminScope[]) {
  const context = await requireRole("admin");
  if (!context.adminScope || !scopes.includes(context.adminScope)) {
    redirect("/");
  }
  return context;
}

export async function requireApiRole(role: AppRole) {
  const context = await getAuthContext();
  if (!context.user || context.role !== role) {
    return null;
  }
  return context;
}

export async function requireApiAdminScopes(scopes: AdminScope[]) {
  const context = await requireApiRole("admin");
  if (!context || !context.adminScope || !scopes.includes(context.adminScope)) {
    return null;
  }
  return context;
}
