import { jsonError } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const auth = await requireApiAdminScopes(["super_admin", "admin_ops", "admin_review"]);
  if (!auth) return jsonError("Acces non autorise.", 403);

  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const city = url.searchParams.get("city");
  const active = url.searchParams.get("active");

  const supabase = getSupabaseAdminClient();

  let query = supabase
    .from("providers")
    .select("id, profile_id, display_name, hourly_from_chf, is_active, rating, completed_missions")
    .order("completed_missions", { ascending: false })
    .limit(300);

  if (active === "true") query = query.eq("is_active", true);
  if (active === "false") query = query.eq("is_active", false);

  const { data: providers, error } = await query;
  if (error) return jsonError("Impossible de charger les prestataires.", 500);

  const profileIds = (providers ?? []).map((item) => item.profile_id);
  const [profilesRes, applicationsRes] = await Promise.all([
    profileIds.length > 0
      ? supabase
          .from("profiles")
          .select("id, first_name, last_name, phone, city, account_status")
          .in("id", profileIds)
      : Promise.resolve({ data: [], error: null }),
    profileIds.length > 0
      ? supabase
          .from("provider_applications")
          .select("id, profile_id, workflow_status, category, intervention_radius_km, city, canton, updated_at")
          .in("profile_id", profileIds)
          .order("updated_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (profilesRes.error || applicationsRes.error) {
    return jsonError("Impossible de charger les details prestataires.", 500);
  }

  const profileMap = new Map((profilesRes.data ?? []).map((item) => [item.id, item]));
  const applicationMap = new Map<string, (typeof applicationsRes.data)[number]>();
  for (const application of applicationsRes.data ?? []) {
    if (!applicationMap.has(application.profile_id)) {
      applicationMap.set(application.profile_id, application);
    }
  }

  let merged = (providers ?? []).map((provider) => ({
    ...provider,
    profile: profileMap.get(provider.profile_id) ?? null,
    application: applicationMap.get(provider.profile_id) ?? null,
  }));

  if (category) {
    merged = merged.filter((item) => item.application?.category?.toLowerCase() === category.toLowerCase());
  }

  if (city) {
    merged = merged.filter((item) => (item.application?.city ?? item.profile?.city ?? "").toLowerCase() === city.toLowerCase());
  }

  return Response.json({ success: true, data: merged });
}
