import { jsonError, jsonSuccess } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { sendEmail } from "@/lib/email/sender";
import { emailTemplates } from "@/lib/email/templates";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const payloadSchema = z.object({
  workflowStatus: z.enum(["draft", "submitted", "pending_review", "approved", "rejected", "needs_info"]),
  adminNote: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAdminScopes(["super_admin", "admin_review"]);
  if (!auth) {
    return jsonError("Accès non autorisé.", 403);
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Données invalides.", 400, parsed.error.flatten().fieldErrors);
  }

  const supabase = getSupabaseAdminClient();

  const { data: current, error: currentError } = await supabase
    .from("provider_applications")
    .select("id, first_name, last_name, email, profile_id, business_name, city")
    .eq("id", id)
    .maybeSingle();

  if (currentError || !current) {
    return jsonError("Dossier introuvable.", 404);
  }

  const { error } = await supabase
    .from("provider_applications")
    .update({
      workflow_status: parsed.data.workflowStatus,
      admin_note: parsed.data.adminNote || null,
      reviewed_by: auth.user.id,
      reviewed_at: new Date().toISOString(),
      status:
        parsed.data.workflowStatus === "approved"
          ? "contacted"
          : parsed.data.workflowStatus === "rejected"
            ? "closed"
            : "reviewing",
    })
    .eq("id", id);

  if (error) {
    return jsonError("Impossible de mettre à jour ce dossier.", 500);
  }

  if (parsed.data.workflowStatus === "approved" && current.profile_id) {
    await supabase.from("profiles").update({ role: "provider" }).eq("id", current.profile_id);

    const { data: existingProvider } = await supabase
      .from("providers")
      .select("id")
      .eq("profile_id", current.profile_id)
      .maybeSingle();

    if (!existingProvider) {
      await supabase.from("providers").insert({
        profile_id: current.profile_id,
        display_name: current.business_name || `${current.first_name ?? ""} ${current.last_name ?? ""}`.trim() || "Prestataire",
        hourly_from_chf: 30,
        is_active: true,
        latitude: 46.5197,
        longitude: 6.6323,
      });
    }
  }

  const name = `${current.first_name ?? ""} ${current.last_name ?? ""}`.trim() || "prestataire";
  const template =
    parsed.data.workflowStatus === "approved"
      ? emailTemplates.providerApplicationApproved(name)
      : parsed.data.workflowStatus === "rejected"
        ? emailTemplates.providerApplicationRejected(name)
        : parsed.data.workflowStatus === "needs_info"
          ? emailTemplates.providerApplicationNeedsInfo(name, parsed.data.adminNote || undefined)
          : emailTemplates.providerApplicationPendingReview(name);

  await sendEmail({ to: current.email, subject: template.subject, html: template.html });

  await supabase.from("admin_audit_events").insert({
    actor_profile_id: auth.user.id,
    action: "provider_application.update_status",
    entity: "provider_applications",
    entity_id: id,
    metadata: {
      workflowStatus: parsed.data.workflowStatus,
      adminNote: parsed.data.adminNote || null,
      adminScope: auth.adminScope,
    },
  });

  return jsonSuccess("Dossier mis à jour.");
}
