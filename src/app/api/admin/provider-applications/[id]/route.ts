import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { sendEmail } from "@/lib/email/sender";
import { emailTemplates } from "@/lib/email/templates";
import { getErrorMessage, logEvent } from "@/lib/monitoring";
import { providerApplicationStatusSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAdminScopes(["super_admin", "admin_review", "admin_ops"]);
  if (!auth) {
    return jsonError("Acces non autorise.", 403);
  }

  const { id } = await context.params;
  const supabase = getSupabaseAdminClient();

  const [applicationRes, documentsRes] = await Promise.all([
    supabase
      .from("provider_applications")
      .select("id, profile_id, created_at, updated_at, workflow_status, status, first_name, last_name, email, phone, business_name, address_line, postal_code, city, canton, country, category, intervention_radius_km, legal_status, company_name, ide_number, iban, vat_number, languages, accepts_urgency, services_description, years_experience, availability, website_or_instagram, id_document_type, id_document_path, residence_permit_type, residence_permit_path, admin_note, reviewed_at, reviewed_by")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("provider_documents")
      .select("id, kind, status, original_filename, file_size_bytes, admin_note, reviewed_at, created_at")
      .eq("application_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (applicationRes.error || !applicationRes.data) {
    return jsonError("Dossier introuvable.", 404);
  }

  return Response.json({
    success: true,
    data: {
      application: applicationRes.data,
      documents: documentsRes.data ?? [],
    },
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await requireApiAdminScopes(["super_admin", "admin_review"]);
  if (!auth) {
    return jsonError("Acces non autorise.", 403);
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = providerApplicationStatusSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Donnees invalides.", 400, parsed.error.flatten().fieldErrors);
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
          : parsed.data.workflowStatus === "rejected" || parsed.data.workflowStatus === "suspended"
            ? "closed"
            : "reviewing",
    })
    .eq("id", id);

  if (error) {
    return jsonError("Impossible de mettre a jour ce dossier.", 500);
  }

  if (parsed.data.workflowStatus === "approved" && current.profile_id) {
    await supabase.from("profiles").update({ role: "provider", account_status: "active" }).eq("id", current.profile_id);

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

  if (parsed.data.workflowStatus === "suspended" && current.profile_id) {
    await Promise.all([
      supabase.from("profiles").update({ account_status: "suspended" }).eq("id", current.profile_id),
      supabase.from("providers").update({ is_active: false }).eq("profile_id", current.profile_id),
    ]);
  }

  if (parsed.data.workflowStatus === "rejected" && current.profile_id) {
    await Promise.all([
      supabase.from("profiles").update({ account_status: "active", role: "customer" }).eq("id", current.profile_id),
      supabase.from("providers").update({ is_active: false }).eq("profile_id", current.profile_id),
    ]);
  }

  const name = `${current.first_name ?? ""} ${current.last_name ?? ""}`.trim() || "prestataire";
  const template =
    parsed.data.workflowStatus === "approved"
      ? emailTemplates.providerApplicationApproved(name)
      : parsed.data.workflowStatus === "rejected"
        ? emailTemplates.providerApplicationRejected(name)
        : parsed.data.workflowStatus === "suspended"
          ? emailTemplates.providerApplicationNeedsInfo(name, "Votre compte prestataire est temporairement suspendu. Contactez le support PrèsDeToi.")
        : parsed.data.workflowStatus === "needs_info"
          ? emailTemplates.providerApplicationNeedsInfo(name, parsed.data.adminNote || undefined)
          : emailTemplates.providerApplicationPendingReview(name);

  try {
    await sendEmail({ to: current.email, subject: template.subject, html: template.html });
  } catch (error) {
    logEvent("error", {
      event: "admin.provider_status_email_failed",
      message: "Provider workflow updated but notification email failed.",
      context: { applicationId: id, reason: getErrorMessage(error) },
    });
  }

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

  return jsonSuccess("Dossier mis a jour.");
}

