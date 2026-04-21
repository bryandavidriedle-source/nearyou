import { applyRateLimit, jsonError, jsonSuccess } from "@/lib/api";
import { sendEmail } from "@/lib/email/sender";
import { emailTemplates } from "@/lib/email/templates";
import { serviceRequestSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const limited = applyRateLimit(request, "contact");
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const parsed = serviceRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Certains champs sont invalides. Merci de vérifier le formulaire.", 400, parsed.error.flatten().fieldErrors);
  }

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
    description: parsed.data.description,
    urgency: parsed.data.urgency,
    budget: parsed.data.budget,
    consent: parsed.data.consent,
  });

  if (error) {
    return jsonError("Enregistrement impossible pour le moment. Merci de réessayer.", 500);
  }

  const template = emailTemplates.bookingConfirmation(parsed.data.category, "à confirmer");
  await sendEmail({ to: parsed.data.email, subject: template.subject, html: template.html });

  return jsonSuccess("Votre demande a bien été enregistrée.");
}
