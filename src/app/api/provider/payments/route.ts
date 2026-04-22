import { jsonError } from "@/lib/api";
import { requireApiProviderAccess } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireApiProviderAccess();
  if (!auth) return jsonError("Acces non autorise.", 403);

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("payment_records")
    .select("id, service_request_id, gross_amount_chf, commission_amount_chf, net_amount_chf, status, paid_at, created_at")
    .eq("profile_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return jsonError("Impossible de charger les paiements.", 500);
  }

  return Response.json({ success: true, data: data ?? [] });
}
