import { applyRateLimit, jsonError, jsonSuccess } from "@/lib/api";
import { callRequestSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const limited = applyRateLimit(request, "contact");
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const parsed = callRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Certains champs sont invalides.", 400, parsed.error.flatten().fieldErrors);
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("hotline_requests").insert({
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    phone: parsed.data.phone,
    city: parsed.data.city,
    service_type: parsed.data.category,
    preferred_time: parsed.data.preferredSlot,
    notes: parsed.data.note || null,
    source: parsed.data.source,
    status: "new",
  });

  if (error) {
    return jsonError("Envoi impossible pour le moment.", 500);
  }

  return jsonSuccess("Merci, nous vous rappelons rapidement.");
}
