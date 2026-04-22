import { Card } from "@/components/ui/card";
import { requireAdminScopes } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function BackofficePaymentsPage() {
  await requireAdminScopes(["super_admin", "admin_ops"]);
  const supabase = getSupabaseAdminClient();

  const [recordsRes, payoutsRes] = await Promise.all([
    supabase
      .from("payment_records")
      .select("id, gross_amount_chf, commission_amount_chf, net_amount_chf, status, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("provider_payout_accounts")
      .select("id", { head: true, count: "exact" })
      .eq("is_verified", true),
  ]);

  const records = recordsRes.data ?? [];
  const totals = records.reduce(
    (acc, item) => {
      acc.gross += Number(item.gross_amount_chf ?? 0);
      acc.commission += Number(item.commission_amount_chf ?? 0);
      acc.net += Number(item.net_amount_chf ?? 0);
      return acc;
    },
    { gross: 0, commission: 0, net: 0 },
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Volume brut</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{totals.gross.toFixed(2)} CHF</p>
        </Card>
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Commission plateforme</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{totals.commission.toFixed(2)} CHF</p>
        </Card>
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Net prestataires</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{totals.net.toFixed(2)} CHF</p>
        </Card>
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Comptes payout verifies</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{payoutsRes.count ?? 0}</p>
        </Card>
      </div>

      <Card className="premium-card p-5">
        <h2 className="text-lg font-semibold text-slate-900">Historique paiement (50 derniers)</h2>
        <div className="mt-3 space-y-2">
          {records.map((record) => (
            <div key={record.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <p className="font-medium">
                Brut {Number(record.gross_amount_chf).toFixed(2)} CHF | Commission {Number(record.commission_amount_chf).toFixed(2)} CHF | Net {Number(record.net_amount_chf).toFixed(2)} CHF
              </p>
              <p className="text-xs text-slate-500">
                {new Date(record.created_at).toLocaleString("fr-CH")} - {record.status}
              </p>
            </div>
          ))}
          {records.length === 0 ? <p className="text-sm text-slate-500">Aucune donnee de paiement disponible.</p> : null}
        </div>
      </Card>
    </div>
  );
}
