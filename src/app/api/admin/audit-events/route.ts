import { jsonError } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const auth = await requireApiAdminScopes(["super_admin", "admin_ops", "admin_support", "admin_review"]);
  if (!auth) {
    return jsonError("Acces non autorise.", 403);
  }

  const limit = Math.min(100, Math.max(10, Number(new URL(request.url).searchParams.get("limit") ?? "30")));

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_audit_events")
    .select("id, action, entity, entity_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return jsonError("Impossible de charger le journal d'actions.", 500);
  }

  return Response.json({ success: true, data });
}
