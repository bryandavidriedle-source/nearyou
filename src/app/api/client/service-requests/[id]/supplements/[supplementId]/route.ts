import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { requireApiRole } from "@/lib/auth";
import { serviceRequestSupplementDecisionSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; supplementId: string }> },
) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await requireApiRole("customer");
  if (!auth) return jsonError("Acces non autorise.", 403);

  const { id, supplementId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = serviceRequestSupplementDecisionSchema.safeParse(body);
  if (!parsed.success) return jsonError("Decision supplement invalide.", 400, parsed.error.flatten().fieldErrors);

  const supabase = getSupabaseAdminClient();
  const { data: requestRow } = await supabase
    .from("service_requests")
    .select("id, profile_id")
    .eq("id", id)
    .maybeSingle();

  if (!requestRow) return jsonError("Demande introuvable.", 404);
  if (requestRow.profile_id !== auth.user.id) return jsonError("Cette demande ne vous appartient pas.", 403);

  const nextStatus = parsed.data.decision === "approved" ? "approved" : "rejected";
  const { error } = await supabase
    .from("service_request_supplements")
    .update({
      status: nextStatus,
      client_decision_note: parsed.data.note || null,
      decided_at: new Date().toISOString(),
      decided_by_profile_id: auth.user.id,
    })
    .eq("id", supplementId)
    .eq("service_request_id", id)
    .eq("status", "pending");

  if (error) return jsonError("Impossible de traiter votre decision.", 500);

  await supabase.from("admin_audit_events").insert({
    actor_profile_id: auth.user.id,
    action: "service_request.supplement_decision",
    entity: "service_request_supplements",
    entity_id: supplementId,
    metadata: {
      serviceRequestId: id,
      decision: nextStatus,
    },
  });

  return jsonSuccess(nextStatus === "approved" ? "Supplement approuve." : "Supplement refuse.");
}
