import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AppRole = "customer" | "provider" | "admin";

export async function getAuthContext() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, role: null as AppRole | null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    role: (profile?.role as AppRole | null) ?? "customer",
    profile,
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

export async function requireApiRole(role: AppRole) {
  const context = await getAuthContext();
  if (!context.user || context.role !== role) {
    return null;
  }
  return context;
}
