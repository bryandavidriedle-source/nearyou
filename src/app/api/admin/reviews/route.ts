import { jsonError } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const auth = await requireApiAdminScopes(["super_admin", "admin_review", "admin_ops", "admin_support"]);
  if (!auth) {
    return jsonError("Acces non autorise.", 403);
  }

  const url = new URL(request.url);
  const visibility = url.searchParams.get("visibility");
  const q = url.searchParams.get("q");

  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("reviews")
    .select("id, rating, comment, is_public, is_moderated, created_at, providers(display_name)")
    .order("created_at", { ascending: false })
    .limit(150);

  if (visibility === "public") query = query.eq("is_public", true);
  if (visibility === "hidden") query = query.eq("is_public", false);
  if (q) query = query.ilike("comment", `%${q}%`);

  const { data, error } = await query;
  if (error) {
    return jsonError("Impossible de charger les avis.", 500);
  }

  return Response.json({ success: true, data });
}
