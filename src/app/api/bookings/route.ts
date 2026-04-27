import { NextResponse } from "next/server";

import { applyRateLimit, enforcePublicFormSecurity, enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { computeSwissMarketplaceBreakdown } from "@/lib/payments/pricing";
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
    return jsonError("Champs de réservation invalides.", 400, parsed.error.flatten().fieldErrors);
  }

  const securityGuard = await enforcePublicFormSecurity(parsed.data);
  if (securityGuard) return securityGuard;

  const supabaseServer = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  if (!user) {
    const safeMissionId = parsed.data.missionId.replace(/[^a-zA-Z0-9-_]/g, "");
    return NextResponse.json(
      {
        success: false,
        message: "Connectez-vous pour confirmer votre réservation.",
        loginPath: `/connexion?next=${encodeURIComponent(`/reserve/${safeMissionId}`)}`,
      },
      { status: 401 },
    );
  }

  const supabase = getSupabaseAdminClient();
  const { data: provider } = await supabase
    .from("providers")
    .select("id, is_active, profile_id, hourly_from_chf")
    .eq("id", parsed.data.missionId)
    .maybeSingle();

  if (!provider || !provider.is_active || !provider.profile_id) {
    return jsonError("Ce prestataire n'est plus disponible.", 404);
  }

  const { data: providerApplication } = await supabase
    .from("provider_applications")
    .select("workflow_status")
    .eq("profile_id", provider.profile_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (providerApplication?.workflow_status !== "approved") {
    return jsonError("Ce prestataire n'est pas publiable actuellement.", 403);
  }

  const breakdown = computeSwissMarketplaceBreakdown(Number(provider.hourly_from_chf ?? 0));

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
      price_from_chf: breakdown.totalChf,
    })
    .select("id")
    .single();

  if (error || !booking) {
    return jsonError("Réservation impossible pour le moment.", 500);
  }

  await supabase.from("payments").insert({
    booking_id: booking.id,
    provider_id: provider.id,
    amount_chf: breakdown.totalChf,
    platform_fee_chf: breakdown.platformFeeChf,
    provider_payout_chf: breakdown.providerNetChf,
    status: "pending",
  });

  return jsonSuccess("Réservation enregistrée.", {
    bookingId: booking.id,
    paymentPreview: {
      totalChf: breakdown.totalChf,
      platformFeeChf: breakdown.platformFeeChf,
      providerNetChf: breakdown.providerNetChf,
    },
  });
}
