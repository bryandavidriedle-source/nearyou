import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { requireApiRole } from "@/lib/auth";
import { serviceRequestTipSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await requireApiRole("customer");
  if (!auth) return jsonError("Acces non autorise.", 403);

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = serviceRequestTipSchema.safeParse(body);
  if (!parsed.success) return jsonError("Pourboire invalide.", 400, parsed.error.flatten().fieldErrors);

  const supabase = getSupabaseAdminClient();
  const { data: requestRow } = await supabase
    .from("service_requests")
    .select("id, profile_id, assigned_provider_profile_id, provider_status")
    .eq("id", id)
    .maybeSingle();

  if (!requestRow) return jsonError("Demande introuvable.", 404);
  if (requestRow.profile_id !== auth.user.id) return jsonError("Cette demande ne vous appartient pas.", 403);
  if (requestRow.provider_status !== "completed") return jsonError("Le pourboire est disponible apres mission terminee.", 409);
  if (!requestRow.assigned_provider_profile_id) return jsonError("Aucun prestataire attribue.", 409);

  const { error } = await supabase.from("service_request_tips").upsert(
    {
      service_request_id: id,
      client_profile_id: auth.user.id,
      provider_profile_id: requestRow.assigned_provider_profile_id,
      amount_chf: parsed.data.amountChf,
      message: parsed.data.message || null,
    },
    { onConflict: "service_request_id,client_profile_id" },
  );

  if (error) return jsonError("Impossible d'enregistrer le pourboire.", 500);

  await supabase.from("admin_audit_events").insert({
    actor_profile_id: auth.user.id,
    action: "service_request.tip_created",
    entity: "service_request_tips",
    entity_id: id,
    metadata: {
      amountChf: parsed.data.amountChf,
    },
  });

  return jsonSuccess("Pourboire enregistre.");
}
