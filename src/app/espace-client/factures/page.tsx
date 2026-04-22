import { Container } from "@/components/shared/container";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function ClientInvoicesPage() {
  const auth = await requireRole("customer");
  const supabase = getSupabaseAdminClient();

  const { data: invoices } = await supabase
    .from("booking_invoices")
    .select("id, booking_id, invoice_number, total_amount_chf, currency, issued_at, status")
    .eq("customer_profile_id", auth.user.id)
    .order("issued_at", { ascending: false })
    .limit(100);

  return (
    <section className="py-8">
      <Container className="max-w-4xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Mes factures</h1>
        <div className="space-y-3">
          {(invoices ?? []).map((invoice) => (
            <Card key={invoice.id} className="premium-card p-4 text-sm">
              <p className="font-semibold text-slate-900">Facture {invoice.invoice_number}</p>
              <p className="text-slate-600">
                Mission #{invoice.booking_id.slice(0, 8)} - {Number(invoice.total_amount_chf).toFixed(2)} {invoice.currency}
              </p>
              <p className="text-xs text-slate-500">{new Date(invoice.issued_at).toLocaleDateString("fr-CH")} - {invoice.status}</p>
            </Card>
          ))}
          {(invoices ?? []).length === 0 ? (
            <Card className="rounded-2xl border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
              Aucune facture disponible pour le moment.
            </Card>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
