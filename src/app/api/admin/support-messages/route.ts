import { jsonError } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireApiAdminScopes(["super_admin", "admin_support", "admin_ops"]);
  if (!auth) {
    return jsonError("Accès non autorisé.", 403);
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("support_messages")
    .select("id, email, phone, subject, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return jsonError("Impossible de charger les messages support.", 500);
  }

  return Response.json({ success: true, data });
}
