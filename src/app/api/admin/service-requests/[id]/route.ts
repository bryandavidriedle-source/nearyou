import { jsonError, jsonSuccess } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { sendEmail } from "@/lib/email/sender";
import { emailTemplates } from "@/lib/email/templates";
import { serviceRequestStatusSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const statusLabels: Record<string, string> = {
  new: "Nouvelle",
  reviewing: "En analyse",
  contacted: "Contact établi",
  closed: "Clôturée",
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAdminScopes(["super_admin", "admin_ops", "admin_support"]);
  if (!auth) {
    return jsonError("Accès réservé aux administrateurs.", 403);
  }

  const { id } = await context.params;
  const payload = await request.json().catch(() => null);
  const parsed = serviceRequestStatusSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError("Statut invalide.", 400, parsed.error.flatten().fieldErrors);
  }

  const supabase = getSupabaseAdminClient();

  const { data: current, error: currentError } = await supabase
    .from("service_requests")
    .select("id, status, email, category")
    .eq("id", id)
    .maybeSingle();

  if (currentError || !current) {
    return jsonError("Demande introuvable.", 404);
  }

  const { error: updateError } = await supabase
    .from("service_requests")
    .update({ status: parsed.data.status })
    .eq("id", id);

  if (updateError) {
    return jsonError("Impossible de mettre à jour la demande.", 500);
  }

  if (current.status !== parsed.data.status || parsed.data.note) {
    await supabase.from("service_request_status_history").insert({
      service_request_id: id,
      from_status: current.status,
      to_status: parsed.data.status,
      changed_by: auth.user.id,
      note: parsed.data.note || null,
    });

    const template = emailTemplates.serviceRequestStatusChanged(
      statusLabels[parsed.data.status] ?? parsed.data.status,
      current.category,
    );
    await sendEmail({
      to: current.email,
      subject: template.subject,
      html: template.html,
    });
  }

  await supabase.from("admin_audit_events").insert({
    actor_profile_id: auth.user.id,
    action: "service_request.patch",
    entity: "service_requests",
    entity_id: id,
    metadata: {
      fromStatus: current.status,
      toStatus: parsed.data.status,
      note: parsed.data.note || null,
      adminScope: auth.adminScope,
    },
  });

  return jsonSuccess("Statut mis à jour.");
}
