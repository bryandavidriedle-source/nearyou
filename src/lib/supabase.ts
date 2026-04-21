import { publicEnv, serverEnv } from "@/lib/env";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export function hasSupabaseEnv() {
  return Boolean(publicEnv.NEXT_PUBLIC_SUPABASE_URL && publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function hasSupabaseServiceRole() {
  return Boolean(serverEnv.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseClient() {
  return getSupabaseBrowserClient();
}

export { getSupabaseAdminClient, getSupabaseBrowserClient, getSupabaseServerClient };
