import { applyRateLimit, enforcePublicFormSecurity, enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { bookingIntentSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const limited = applyRateLimit(request, "booking");
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const parsed = bookingIntentSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Champs de reservation invalides.", 400, parsed.error.flatten().fieldErrors);
  }

  const securityGuard = await enforcePublicFormSecurity(parsed.data);
  if (securityGuard) return securityGuard;

  const supabaseServer = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();
  if (!user) {
    return jsonError("Connexion requise pour confirmer une reservation.", 401);
  }

  const supabase = getSupabaseAdminClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: user.id,
      provider_id: parsed.data.missionId,
      reservation_source: parsed.data.reservationSource,
      status: "pending",
      starts_at: parsed.data.startAt,
      ends_at: parsed.data.endAt,
      notes: parsed.data.details || null,
      price_from_chf: 0,
    })
    .select("id")
    .single();

  if (error || !booking) {
    return jsonError("Reservation impossible pour le moment.", 500);
  }

  await supabase.from("payments").insert({
    booking_id: booking.id,
    amount_chf: 0,
    status: "pending",
  });

  return jsonSuccess("Reservation enregistree.", { bookingId: booking.id });
}
