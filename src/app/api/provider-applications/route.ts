import { applyRateLimit, jsonError, jsonSuccess } from "@/lib/api";
import { sendEmail } from "@/lib/email/sender";
import { emailTemplates } from "@/lib/email/templates";
import { providerApplicationSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const limited = applyRateLimit(request, "contact");
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const parsed = providerApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Certains champs sont invalides. Merci de vérifier le formulaire.", 400, parsed.error.flatten().fieldErrors);
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("provider_applications").insert({
    status: "new",
    business_name: parsed.data.businessName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    city: parsed.data.city,
    category: parsed.data.category,
    services_description: parsed.data.servicesDescription,
    years_experience: parsed.data.yearsExperience,
    availability: parsed.data.availability,
    website_or_instagram: parsed.data.websiteOrInstagram || null,
    consent: parsed.data.consent,
  });

  if (error) {
    return jsonError("Enregistrement impossible pour le moment. Merci de réessayer.", 500);
  }

  const template = emailTemplates.providerApplicationReceived(parsed.data.businessName);
  await sendEmail({ to: parsed.data.email, subject: template.subject, html: template.html });

  return jsonSuccess("Votre candidature a bien été enregistrée.");
}
