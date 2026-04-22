import { Container } from "@/components/shared/container";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function ClientPaymentsPage() {
  const auth = await requireRole("customer");
  const supabase = getSupabaseAdminClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id")
    .eq("customer_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  const bookingIds = (bookings ?? []).map((item) => item.id);
  const paymentsRes =
    bookingIds.length > 0
      ? await supabase
          .from("payments")
          .select("id, booking_id, amount_chf, platform_fee_chf, provider_payout_chf, status, created_at")
          .in("booking_id", bookingIds)
          .order("created_at", { ascending: false })
      : { data: [] as Array<{ id: string; booking_id: string; amount_chf: number; platform_fee_chf: number; provider_payout_chf: number; status: string; created_at: string }> };

  const payments = paymentsRes.data ?? [];
  const totalPaid = payments.reduce((acc, item) => acc + Number(item.amount_chf ?? 0), 0);

  return (
    <section className="py-8">
      <Container className="max-w-4xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Mes paiements</h1>
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Total facture</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalPaid.toFixed(2)} CHF</p>
        </Card>
        <div className="space-y-3">
          {payments.map((payment) => (
            <Card key={payment.id} className="premium-card p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Paiement mission #{payment.booking_id.slice(0, 8)}</p>
              <p>Montant: {Number(payment.amount_chf).toFixed(2)} CHF</p>
              <p>Statut: {payment.status}</p>
              <p className="text-xs text-slate-500">{new Date(payment.created_at).toLocaleString("fr-CH")}</p>
            </Card>
          ))}
          {payments.length === 0 ? (
            <Card className="rounded-2xl border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
              Aucun paiement enregistre.
            </Card>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
