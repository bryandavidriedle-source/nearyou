import { jsonError } from "@/lib/api";
import { requireApiProviderAccess } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireApiProviderAccess();
  if (!auth) return jsonError("Acces non autorise.", 403);

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("provider_notifications")
    .select("id, notification_type, title, body, is_read, data, created_at")
    .eq("profile_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return jsonError("Impossible de charger les notifications.", 500);

  return Response.json({ success: true, data: data ?? [] });
}
