import { jsonError } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const auth = await requireApiAdminScopes(["super_admin", "admin_ops", "admin_support"]);
  if (!auth) return jsonError("Acces non autorise.", 403);

  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const accountStatus = url.searchParams.get("accountStatus");

  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("profiles")
    .select("id, first_name, last_name, phone, city, role, account_status, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false })
    .limit(300);

  if (accountStatus) query = query.eq("account_status", accountStatus);
  if (q) query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,phone.ilike.%${q}%`);

  const { data: profiles, error } = await query;
  if (error) return jsonError("Impossible de charger les clients.", 500);

  const profileIds = (profiles ?? []).map((item) => item.id);
  let requestCountsByProfile = new Map<string, number>();

  if (profileIds.length > 0) {
    const { data: requests } = await supabase
      .from("service_requests")
      .select("profile_id")
      .in("profile_id", profileIds);

    requestCountsByProfile = new Map<string, number>();
    for (const item of requests ?? []) {
      if (!item.profile_id) continue;
      requestCountsByProfile.set(item.profile_id, (requestCountsByProfile.get(item.profile_id) ?? 0) + 1);
    }
  }

  return Response.json({
    success: true,
    data: (profiles ?? []).map((profile) => ({
      ...profile,
      request_count: requestCountsByProfile.get(profile.id) ?? 0,
    })),
  });
}
