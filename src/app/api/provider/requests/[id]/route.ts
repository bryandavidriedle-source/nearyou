import { z } from "zod";

import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { requireApiProviderAccess } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const updateSchema = z.object({
  action: z.enum(["accept", "decline", "start", "complete", "cancel", "dispute"]),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});

function resolveNextProviderStatus(action: z.infer<typeof updateSchema>["action"]) {
  if (action === "accept") return "accepted";
  if (action === "decline") return "declined";
  if (action === "start") return "in_progress";
  if (action === "complete") return "completed";
  if (action === "cancel") return "cancelled";
  return "disputed";
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await requireApiProviderAccess();
  if (!auth) {
    return jsonError("Acces non autorise.", 403);
  }

  if (auth.providerApplication?.workflow_status !== "approved" || auth.isSuspended) {
    return jsonError("Votre compte prestataire ne permet pas encore cette action.", 403);
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Donnees invalides.", 400, parsed.error.flatten().fieldErrors);
  }

  const supabase = getSupabaseAdminClient();

  const { data: requestItem, error } = await supabase
    .from("service_requests")
    .select("id, category, provider_status, assigned_provider_profile_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !requestItem) {
    return jsonError("Demande introuvable.", 404);
  }

  const nextProviderStatus = resolveNextProviderStatus(parsed.data.action);
  const patchPayload: Record<string, string | null> = {
    provider_status: nextProviderStatus,
    internal_note: parsed.data.note || null,
  };

  const isAssignedToCurrent = requestItem.assigned_provider_profile_id === auth.user.id;
  const isOpenRequest = !requestItem.assigned_provider_profile_id && (requestItem.provider_status === "new" || requestItem.provider_status === "pending_assignment");

  if (parsed.data.action === "accept") {
    if (!isAssignedToCurrent && !isOpenRequest) {
      return jsonError("Cette demande est deja attribuee a un autre prestataire.", 409);
    }

    patchPayload.assigned_provider_profile_id = auth.user.id;
    patchPayload.assigned_at = new Date().toISOString();
    if (requestItem.provider_status === "new" || requestItem.provider_status === "pending_assignment") {
      patchPayload.provider_status = "accepted";
    }
  } else if (!isAssignedToCurrent) {
    return jsonError("Cette mission ne vous est pas attribuee.", 403);
  }

  if (parsed.data.action === "start" && requestItem.provider_status !== "accepted") {
    return jsonError("La mission doit etre acceptee avant demarrage.", 409);
  }

  if (parsed.data.action === "complete") {
    patchPayload.completed_at = new Date().toISOString();
    patchPayload.status = "contacted";
  }

  if (parsed.data.action === "cancel") {
    patchPayload.status = "closed";
  }

  const { error: patchError } = await supabase
    .from("service_requests")
    .update(patchPayload)
    .eq("id", id);

  if (patchError) {
    return jsonError("Impossible de mettre a jour la mission.", 500);
  }

  await supabase.from("admin_audit_events").insert({
    actor_profile_id: auth.user.id,
    action: "provider_request.update_status",
    entity: "service_requests",
    entity_id: id,
    metadata: {
      action: parsed.data.action,
      providerStatus: patchPayload.provider_status,
      note: parsed.data.note || null,
    },
  });

  return jsonSuccess("Statut mission mis a jour.");
}
