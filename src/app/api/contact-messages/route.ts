import { applyRateLimit, jsonError, jsonSuccess } from "@/lib/api";
import { contactMessageSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const limited = applyRateLimit(request, "contact");
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const parsed = contactMessageSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Certains champs sont invalides. Merci de vérifier le formulaire.", 400, parsed.error.flatten().fieldErrors);
  }

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
    return jsonError("Enregistrement impossible pour le moment. Merci de réessayer.", 500);
  }

  return jsonSuccess("Votre message a bien été envoyé.");
}
