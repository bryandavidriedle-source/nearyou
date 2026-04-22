import { jsonError } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const auth = await requireApiAdminScopes(["super_admin", "admin_review", "admin_ops"]);
  if (!auth) {
    return jsonError("Accès non autorisé.", 403);
  }

  const url = new URL(request.url);
  const workflowStatus = url.searchParams.get("workflowStatus");
  const category = url.searchParams.get("category");
  const q = url.searchParams.get("q");

  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("provider_applications")
    .select(
      "id, profile_id, created_at, updated_at, workflow_status, status, first_name, last_name, email, phone, business_name, city, canton, country, category, legal_status, intervention_radius_km, languages, accepts_urgency, id_document_type, id_document_path, residence_permit_type, residence_permit_path, admin_note, reviewed_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (workflowStatus) query = query.eq("workflow_status", workflowStatus);
  if (category) query = query.eq("category", category);
  if (q) query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,business_name.ilike.%${q}%`);

  const { data, error } = await query;

  if (error) {
    return jsonError("Impossible de charger les dossiers prestataires.", 500);
  }

  return Response.json({ success: true, data });
}
