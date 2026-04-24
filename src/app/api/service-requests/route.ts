import { applyRateLimit, enforcePublicFormSecurity, enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { sendEmail } from "@/lib/email/sender";
import { emailTemplates } from "@/lib/email/templates";
import { getErrorMessage, logEvent } from "@/lib/monitoring";
import { serviceRequestSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const limited = applyRateLimit(request, "contact");
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const parsed = serviceRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Certains champs sont invalides. Merci de vérifier le formulaire.", 400, parsed.error.flatten().fieldErrors);
  }

  const securityGuard = await enforcePublicFormSecurity(parsed.data);
  if (securityGuard) return securityGuard;

  const requestedForIso = parsed.data.requestedFor
    ? new Date(parsed.data.requestedFor).toISOString()
    : null;

  const supabase = getSupabaseAdminClient();
  const authClient = await getSupabaseServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const { error } = await supabase.from("service_requests").insert({
    status: "new",
    profile_id: user?.id ?? null,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    city: parsed.data.city,
    category: parsed.data.category,
    requested_service_id: parsed.data.serviceId || null,
    intervention_address: parsed.data.interventionAddress,
    access_instructions: parsed.data.accessInstructions || null,
    door_code: parsed.data.doorCode || null,
    floor: parsed.data.floor || null,
    parking_instructions: parsed.data.parkingInstructions || null,
    garden_access_instructions: parsed.data.gardenAccessInstructions || null,
    materials_available: parsed.data.materialsAvailable,
    requested_for: requestedForIso,
    description: parsed.data.description,
    urgency: parsed.data.urgency,
    budget: parsed.data.budget,
    consent: parsed.data.consent,
  });

  if (error) {
    return jsonError("Enregistrement impossible pour le moment. Merci de réessayer.", 500);
  }

  const template = emailTemplates.bookingConfirmation(parsed.data.category, "à confirmer");
  try {
    await sendEmail({ to: parsed.data.email, subject: template.subject, html: template.html });
  } catch (error) {
    logEvent("error", {
      event: "service_request.email_failed",
      message: "Service request saved but confirmation email failed.",
      context: { reason: getErrorMessage(error), email: parsed.data.email },
    });
  }

  return jsonSuccess("Votre demande a bien été enregistrée.");
}
