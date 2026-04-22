import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { requireApiProviderAccess } from "@/lib/auth";
import { providerPayoutSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireApiProviderAccess();
  if (!auth) return jsonError("Acces non autorise.", 403);

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("provider_payout_accounts")
    .select("id, account_holder_name, iban, bank_name, currency, is_verified, verification_note, created_at, updated_at")
    .eq("profile_id", auth.user.id)
    .maybeSingle();

  if (error) return jsonError("Impossible de charger les informations bancaires.", 500);
  return Response.json({ success: true, data });
}

export async function PATCH(request: Request) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await requireApiProviderAccess();
  if (!auth) return jsonError("Acces non autorise.", 403);

  const body = await request.json().catch(() => null);
  const parsed = providerPayoutSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Coordonnees bancaires invalides.", 400, parsed.error.flatten().fieldErrors);
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("provider_payout_accounts").upsert(
    {
      profile_id: auth.user.id,
      account_holder_name: parsed.data.accountHolderName,
      iban: parsed.data.iban,
      bank_name: parsed.data.bankName || null,
      currency: parsed.data.currency,
      is_verified: false,
      verification_note: null,
    },
    { onConflict: "profile_id" },
  );

  if (error) return jsonError("Impossible de sauvegarder les informations bancaires.", 500);
  return jsonSuccess("Coordonnees bancaires enregistrees.");
}
