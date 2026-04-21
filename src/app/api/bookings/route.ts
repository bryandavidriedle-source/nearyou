import { applyRateLimit, jsonError, jsonSuccess } from "@/lib/api";
import { bookingIntentSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const limited = applyRateLimit(request, "contact");
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const parsed = bookingIntentSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Champs de réservation invalides.", 400, parsed.error.flatten().fieldErrors);
  }

  const supabaseServer = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  const supabase = getSupabaseAdminClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: user?.id ?? null,
      provider_id: parsed.data.missionId,
      reservation_source: parsed.data.reservationSource,
      status: parsed.data.isGuest ? "pending" : "confirmed",
      starts_at: parsed.data.startAt,
      ends_at: parsed.data.endAt,
      notes: parsed.data.details || null,
      price_from_chf: 0,
    })
    .select("id")
    .single();

  if (error || !booking) {
    return jsonError("Réservation impossible pour le moment.", 500);
  }

  await supabase.from("payments").insert({
    booking_id: booking.id,
    amount_chf: 0,
    status: "pending",
  });

  return jsonSuccess("Réservation enregistrée.", { bookingId: booking.id });
}
