import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { requireApiProviderAccess } from "@/lib/auth";
import { serviceRequestSupplementCreateSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await requireApiProviderAccess();
  if (!auth) return jsonError("Acces non autorise.", 403);
  if (auth.providerApplication?.workflow_status !== "approved" || auth.isSuspended) {
    return jsonError("Compte prestataire non autorise pour demander un supplement.", 403);
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = serviceRequestSupplementCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError("Supplement invalide.", 400, parsed.error.flatten().fieldErrors);

  const supabase = getSupabaseAdminClient();
  const { data: requestRow } = await supabase
    .from("service_requests")
    .select("id, assigned_provider_profile_id, profile_id, provider_status")
    .eq("id", id)
    .maybeSingle();

  if (!requestRow) return jsonError("Mission introuvable.", 404);
  if (requestRow.assigned_provider_profile_id !== auth.user.id) return jsonError("Mission non attribuee a votre profil.", 403);
  if (!["accepted", "in_progress"].includes(requestRow.provider_status)) {
    return jsonError("Le supplement est disponible sur mission acceptee ou en cours.", 409);
  }

  const { data: supplement, error } = await supabase
    .from("service_request_supplements")
    .insert({
      service_request_id: id,
      provider_profile_id: auth.user.id,
      amount_chf: parsed.data.amountChf,
      reason: parsed.data.reason,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !supplement) return jsonError("Impossible de creer le supplement.", 500);

  await supabase.from("admin_audit_events").insert({
    actor_profile_id: auth.user.id,
    action: "service_request.supplement_created",
    entity: "service_request_supplements",
    entity_id: supplement.id,
    metadata: {
      serviceRequestId: id,
      amountChf: parsed.data.amountChf,
    },
  });

  return jsonSuccess("Supplement envoye au client pour approbation.", { supplementId: supplement.id });
}
