"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Supplement = {
  id: string;
  amount_chf: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  requested_at: string;
};

type Props = {
  serviceRequestId: string;
  providerStatus: string;
  supplements: Supplement[];
};

export function ServiceRequestActions({ serviceRequestId, providerStatus, supplements }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState("");
  const [tipMessage, setTipMessage] = useState("");

  const pendingSupplements = supplements.filter((item) => item.status === "pending");

  async function decideSupplement(supplementId: string, decision: "approved" | "rejected") {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/client/service-requests/${serviceRequestId}/supplements/${supplementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Decision supplement impossible.");
      }
      setMessage(payload.message ?? "Decision enregistree.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur supplement.");
    } finally {
      setLoading(false);
    }
  }

  async function sendTip() {
    const amount = Number(tipAmount);
    if (!amount || amount < 1) {
      setError("Indiquez un pourboire valide.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/client/service-requests/${serviceRequestId}/tip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountChf: amount, message: tipMessage }),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Pourboire impossible.");
      }
      setMessage(payload.message ?? "Pourboire enregistre.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur pourboire.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 space-y-3">
      {pendingSupplements.length > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Supplements en attente</p>
          <div className="mt-2 space-y-2">
            {pendingSupplements.map((item) => (
              <div key={item.id} className="rounded-md border border-amber-200 bg-white px-2 py-2 text-sm text-slate-700">
                <p className="font-medium text-slate-900">{item.amount_chf.toFixed(2)} CHF</p>
                <p>{item.reason}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={() => void decideSupplement(item.id, "approved")} disabled={loading}>
                    Approuver
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => void decideSupplement(item.id, "rejected")} disabled={loading}>
                    Refuser
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {providerStatus === "completed" ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Pourboire (optionnel)</p>
          <div className="mt-2 grid gap-2 md:grid-cols-[120px_1fr_100px]">
            <Input
              type="number"
              min={1}
              value={tipAmount}
              onChange={(event) => setTipAmount(event.target.value)}
              placeholder="Montant"
            />
            <Textarea value={tipMessage} onChange={(event) => setTipMessage(event.target.value)} placeholder="Message (optionnel)" />
            <Button size="sm" onClick={() => void sendTip()} disabled={loading}>
              Envoyer
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {message ? <p className="text-sm text-green-700">{message}</p> : null}
    </div>
  );
}
