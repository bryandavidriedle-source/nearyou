import { z } from "zod";

import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { sendEmail } from "@/lib/email/sender";
import { emailTemplates } from "@/lib/email/templates";
import { getErrorMessage, logEvent } from "@/lib/monitoring";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { providerRequestLabels } from "@/lib/workflow";

const requestStatusSchema = z.enum(["new", "reviewing", "contacted", "closed"]);
const providerStatusSchema = z.enum(["new", "pending_assignment", "assigned", "accepted", "declined", "in_progress", "completed", "cancelled", "disputed"]);

const updateSchema = z.object({
  status: requestStatusSchema.optional(),
  providerStatus: providerStatusSchema.optional(),
  assignedProviderProfileId: z.string().uuid().optional().or(z.literal("")),
  scheduledFor: z.string().datetime().optional().or(z.literal("")),
  note: z.string().trim().max(300).optional().or(z.literal("")),
  internalNote: z.string().trim().max(500).optional().or(z.literal("")),
});

const statusLabels: Record<z.infer<typeof requestStatusSchema>, string> = {
  new: "Nouvelle",
  reviewing: "En analyse",
  contacted: "Contact etabli",
  closed: "Cloturee",
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await requireApiAdminScopes(["super_admin", "admin_ops", "admin_support", "admin_review"]);
  if (!auth) {
    return jsonError("Acces reserve aux administrateurs.", 403);
  }

  const { id } = await context.params;
  const payload = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError("Donnees invalides.", 400, parsed.error.flatten().fieldErrors);
  }

  if (!parsed.data.status && !parsed.data.providerStatus && !parsed.data.assignedProviderProfileId && !parsed.data.scheduledFor && !parsed.data.internalNote && !parsed.data.note) {
    return jsonError("Aucune modification demandee.", 400);
  }

  const supabase = getSupabaseAdminClient();

  const { data: current, error: currentError } = await supabase
    .from("service_requests")
    .select("id, status, provider_status, email, category, assigned_provider_profile_id")
    .eq("id", id)
    .maybeSingle();

  if (currentError || !current) {
    return jsonError("Demande introuvable.", 404);
  }

  const nextStatus = parsed.data.status ?? current.status;
  const nextProviderStatus = parsed.data.providerStatus ?? current.provider_status;
  const nextAssignedProvider = parsed.data.assignedProviderProfileId || current.assigned_provider_profile_id;

  const updatePayload: Record<string, string | null> = {
    status: nextStatus,
    provider_status: nextProviderStatus,
    assigned_provider_profile_id: nextAssignedProvider,
  };

  if (parsed.data.scheduledFor) {
    updatePayload.scheduled_for = parsed.data.scheduledFor;
  }

  if (parsed.data.internalNote) {
    updatePayload.internal_note = parsed.data.internalNote;
  }

  if (nextAssignedProvider && nextProviderStatus === "new") {
    updatePayload.provider_status = "assigned";
  }

  if (nextAssignedProvider !== current.assigned_provider_profile_id) {
    updatePayload.assigned_at = new Date().toISOString();
  }

  if (updatePayload.provider_status === "completed") {
    updatePayload.completed_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from("service_requests")
    .update(updatePayload)
    .eq("id", id);

  if (updateError) {
    return jsonError("Impossible de mettre a jour la demande.", 500);
  }

  if (current.status !== nextStatus || parsed.data.note) {
    await supabase.from("service_request_status_history").insert({
      service_request_id: id,
      from_status: current.status,
      to_status: nextStatus,
      changed_by: auth.user.id,
      note: parsed.data.note || null,
    });

    const template = emailTemplates.serviceRequestStatusChanged(
      statusLabels[nextStatus as z.infer<typeof requestStatusSchema>] ?? nextStatus,
      current.category,
    );
    try {
      await sendEmail({
        to: current.email,
        subject: template.subject,
        html: template.html,
      });
    } catch (error) {
      logEvent("error", {
        event: "admin.service_request_status_email_failed",
        message: "Status updated but notification email failed.",
        context: { requestId: id, reason: getErrorMessage(error) },
      });
    }
  }

  if (nextAssignedProvider && nextAssignedProvider !== current.assigned_provider_profile_id) {
    await supabase.from("provider_notifications").insert({
      profile_id: nextAssignedProvider,
      notification_type: "request_assigned",
      title: "Nouvelle demande attribuee",
      body: `Une nouvelle demande ${current.category} vous a ete attribuee.`,
      data: { requestId: id, providerStatus: updatePayload.provider_status },
    });
  }

  await supabase.from("admin_audit_events").insert({
    actor_profile_id: auth.user.id,
    action: "service_request.patch",
    entity: "service_requests",
    entity_id: id,
    metadata: {
      fromStatus: current.status,
      toStatus: nextStatus,
      fromProviderStatus: current.provider_status,
      toProviderStatus: updatePayload.provider_status,
      assignedProviderProfileId: nextAssignedProvider,
      note: parsed.data.note || null,
      internalNote: parsed.data.internalNote || null,
      adminScope: auth.adminScope,
    },
  });

  return jsonSuccess("Demande mise a jour.", {
    providerStatusLabel: providerRequestLabels[(updatePayload.provider_status ?? nextProviderStatus) as keyof typeof providerRequestLabels],
  });
}
