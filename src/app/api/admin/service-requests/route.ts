import { jsonError } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const auth = await requireApiAdminScopes(["super_admin", "admin_ops", "admin_support"]);
  if (!auth) {
    return jsonError("Accès non autorisé.", 403);
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const category = url.searchParams.get("category");
  const q = url.searchParams.get("q");

  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("service_requests")
    .select("id, first_name, last_name, email, city, category, status, description, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (status) query = query.eq("status", status);
  if (category) query = query.eq("category", category);
  if (q) query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return jsonError("Impossible de charger les demandes.", 500);

  return Response.json({ success: true, data });
}

