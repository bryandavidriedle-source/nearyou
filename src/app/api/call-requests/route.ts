import { applyRateLimit, enforcePublicFormSecurity, enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { callRequestSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const limited = applyRateLimit(request, "contact");
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const parsed = callRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Certains champs sont invalides. Merci de verifier le formulaire.", 400, parsed.error.flatten().fieldErrors);
  }

  const securityGuard = await enforcePublicFormSecurity(parsed.data);
  if (securityGuard) return securityGuard;

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("call_requests").insert({
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    phone: parsed.data.phone,
    city: parsed.data.city,
    category: parsed.data.category,
    preferred_slot: parsed.data.preferredSlot,
    contact_mode: parsed.data.contactMode,
    note: parsed.data.note || null,
    consent: parsed.data.consent,
    source: parsed.data.source,
    status: "new",
  });

  if (error) {
    return jsonError("Impossible d'enregistrer la demande de rappel.", 500);
  }

  return jsonSuccess("Votre demande de rappel a bien ete enregistree.");
}
