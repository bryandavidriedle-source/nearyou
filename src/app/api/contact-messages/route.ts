import { applyRateLimit, enforcePublicFormSecurity, enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { contactMessageSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const limited = applyRateLimit(request, "contact");
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const parsed = contactMessageSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Certains champs sont invalides. Merci de verifier le formulaire.", 400, parsed.error.flatten().fieldErrors);
  }

  const securityGuard = await enforcePublicFormSecurity(parsed.data);
  if (securityGuard) return securityGuard;

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("support_messages").insert({
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    subject: parsed.data.subject,
    message: parsed.data.message,
    status: "new",
    source: "contact",
  });

  if (error) {
    return jsonError("Enregistrement impossible pour le moment. Merci de reessayer.", 500);
  }

  return jsonSuccess("Votre message a bien ete envoye.");
}
