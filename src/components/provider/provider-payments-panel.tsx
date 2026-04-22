"use client";

import { useEffect, useMemo, useState } from "react";

import { Card } from "@/components/ui/card";
import { providerPaymentStatusLabels, type ProviderPaymentStatus } from "@/lib/workflow";

type PaymentItem = {
  id: string;
  service_request_id: string | null;
  gross_amount_chf: number;
  commission_amount_chf: number;
  net_amount_chf: number;
  status: ProviderPaymentStatus;
  paid_at: string | null;
  created_at: string;
};

export function ProviderPaymentsPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<PaymentItem[]>([]);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/provider/payments");
      const payload = (await response.json()) as { success?: boolean; data?: PaymentItem[]; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Impossible de charger les paiements.");
      }
      setItems(payload.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.gross += Number(item.gross_amount_chf ?? 0);
        acc.net += Number(item.net_amount_chf ?? 0);
        acc.commission += Number(item.commission_amount_chf ?? 0);
        if (item.status === "pending" || item.status === "scheduled") acc.pending += Number(item.net_amount_chf ?? 0);
        return acc;
      },
      { gross: 0, net: 0, commission: 0, pending: 0 },
    );
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Brut cumule</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totals.gross.toFixed(2)} CHF</p>
        </Card>
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Commission plateforme</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totals.commission.toFixed(2)} CHF</p>
        </Card>
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Net cumule</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totals.net.toFixed(2)} CHF</p>
        </Card>
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">A payer</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totals.pending.toFixed(2)} CHF</p>
        </Card>
      </div>

      <Card className="premium-card p-5">
        <h2 className="text-lg font-semibold text-slate-900">Historique paiements & commissions</h2>
        {loading ? <p className="mt-3 text-sm text-slate-500">Chargement...</p> : null}
        {error ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <div className="mt-3 space-y-2">
          {!loading && items.length === 0 ? (
            <p className="text-sm text-slate-500">
              Aucun paiement enregistre pour le moment. La structure est prete pour l'integration Stripe Connect.
            </p>
          ) : null}

          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">Mission #{item.service_request_id?.slice(0, 8) ?? "N/A"}</p>
                  <p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString("fr-CH")}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                  {providerPaymentStatusLabels[item.status] ?? item.status}
                </span>
              </div>
              <p className="mt-1">Brut: {Number(item.gross_amount_chf).toFixed(2)} CHF</p>
              <p>Commission: {Number(item.commission_amount_chf).toFixed(2)} CHF</p>
              <p>Net: {Number(item.net_amount_chf).toFixed(2)} CHF</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
