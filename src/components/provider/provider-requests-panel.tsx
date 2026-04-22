"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { providerRequestLabels, type ProviderRequestStatus } from "@/lib/workflow";

type RequestItem = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  category: string;
  city: string;
  client_address: string | null;
  description: string;
  urgency: string | null;
  budget: string | null;
  budget_amount_chf: number | null;
  provider_status: ProviderRequestStatus;
  created_at: string;
  scheduled_for: string | null;
};

type GroupedRequests = {
  available: RequestItem[];
  assigned: RequestItem[];
  accepted: RequestItem[];
  inProgress: RequestItem[];
  completed: RequestItem[];
  cancelled: RequestItem[];
  declined: RequestItem[];
  disputed: RequestItem[];
  allAssigned: RequestItem[];
};

type SupplementItem = {
  id: string;
  amount_chf: number;
  reason: string;
  status: string;
  requested_at: string;
};

const emptyData: GroupedRequests = {
  available: [],
  assigned: [],
  accepted: [],
  inProgress: [],
  completed: [],
  cancelled: [],
  declined: [],
  disputed: [],
  allAssigned: [],
};

export function ProviderRequestsPanel() {
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [data, setData] = useState<GroupedRequests>(emptyData);
  const [providerStatus, setProviderStatus] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [supplementsByRequest, setSupplementsByRequest] = useState<Record<string, SupplementItem[]>>({});
  const [supplementAmount, setSupplementAmount] = useState<Record<string, string>>({});
  const [supplementReason, setSupplementReason] = useState<Record<string, string>>({});

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/provider/requests");
      const payload = (await response.json()) as {
        success?: boolean;
        data?: GroupedRequests;
        message?: string;
        providerStatus?: string;
        supplementsByRequest?: Record<string, SupplementItem[]>;
      };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Impossible de charger les demandes.");
      }
      setData(payload.data);
      setProviderStatus(payload.providerStatus ?? null);
      setSupplementsByRequest(payload.supplementsByRequest ?? {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, action: "accept" | "decline" | "start" | "complete" | "cancel" | "dispute") {
    setActingId(id);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/provider/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Action impossible.");
      }
      setMessage(payload.message ?? "Statut mission mis a jour.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de mise a jour.");
    } finally {
      setActingId(null);
    }
  }

  async function requestSupplement(requestId: string) {
    const amount = Number(supplementAmount[requestId] ?? 0);
    const reason = (supplementReason[requestId] ?? "").trim();
    if (!amount || reason.length < 8) {
      setError("Indiquez un montant et une raison detaillee (8 caracteres minimum).");
      return;
    }

    setActingId(requestId);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/provider/requests/${requestId}/supplements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountChf: amount, reason }),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Impossible de demander ce supplement.");
      }
      setMessage(payload.message ?? "Supplement envoye.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur supplement.");
    } finally {
      setActingId(null);
    }
  }

  const filteredAssigned = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.allAssigned;
    return data.allAssigned.filter((item) => `${item.category} ${item.city} ${item.first_name} ${item.last_name}`.toLowerCase().includes(q));
  }, [data.allAssigned, query]);

  function renderRequestRow(item: RequestItem, mode: "available" | "assigned") {
    return (
      <div key={item.id} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-900">{item.category} - {item.city}</p>
            <p>Client: {item.first_name} {item.last_name}</p>
            <p>{item.client_address ?? "Adresse communiquee apres acceptation"}</p>
            <p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString("fr-CH")}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            {providerRequestLabels[item.provider_status] ?? item.provider_status}
          </span>
        </div>
        <p className="mt-2">{item.description}</p>
        <p className="mt-1 text-xs text-slate-500">
          Urgence: {item.urgency ?? "-"} | Budget: {item.budget_amount_chf ? `${item.budget_amount_chf} CHF` : item.budget ?? "-"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {mode === "available" ? (
            <>
              <Button size="sm" onClick={() => updateStatus(item.id, "accept")} disabled={actingId === item.id}>Accepter</Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "decline")} disabled={actingId === item.id}>Refuser</Button>
            </>
          ) : null}
          {mode === "assigned" && item.provider_status === "assigned" ? (
            <>
              <Button size="sm" onClick={() => updateStatus(item.id, "accept")} disabled={actingId === item.id}>Accepter</Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "decline")} disabled={actingId === item.id}>Refuser</Button>
            </>
          ) : null}
          {mode === "assigned" && item.provider_status === "accepted" ? (
            <Button size="sm" onClick={() => updateStatus(item.id, "start")} disabled={actingId === item.id}>Demarrer</Button>
          ) : null}
          {mode === "assigned" && item.provider_status === "in_progress" ? (
            <Button size="sm" onClick={() => updateStatus(item.id, "complete")} disabled={actingId === item.id}>Terminer</Button>
          ) : null}
          {mode === "assigned" && (item.provider_status === "accepted" || item.provider_status === "in_progress") ? (
            <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "dispute")} disabled={actingId === item.id}>Signaler litige</Button>
          ) : null}
        </div>

        {mode === "assigned" && (item.provider_status === "accepted" || item.provider_status === "in_progress") ? (
          <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Supplement sur place (client doit approuver)</p>
            <div className="mt-2 grid gap-2 md:grid-cols-[120px_1fr_120px]">
              <Input
                type="number"
                min={1}
                value={supplementAmount[item.id] ?? ""}
                onChange={(event) => setSupplementAmount((prev) => ({ ...prev, [item.id]: event.target.value }))}
                placeholder="Montant CHF"
              />
              <Input
                value={supplementReason[item.id] ?? ""}
                onChange={(event) => setSupplementReason((prev) => ({ ...prev, [item.id]: event.target.value }))}
                placeholder="Raison du supplement"
              />
              <Button size="sm" onClick={() => void requestSupplement(item.id)} disabled={actingId === item.id}>
                Envoyer
              </Button>
            </div>
          </div>
        ) : null}

        {(supplementsByRequest[item.id] ?? []).length > 0 ? (
          <div className="mt-3 space-y-1">
            {(supplementsByRequest[item.id] ?? []).map((supplement) => (
              <div key={supplement.id} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600">
                Supplement {supplement.amount_chf.toFixed(2)} CHF - {supplement.status} - {supplement.reason}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? <Card className="rounded-xl border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</Card> : null}
      {message ? <Card className="rounded-xl border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</Card> : null}
      {providerStatus && providerStatus !== "approved" ? (
        <Card className="rounded-xl border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Votre dossier est actuellement au statut "{providerStatus}". Les demandes seront disponibles apres validation complete.
        </Card>
      ) : null}

      <Card className="premium-card p-5">
        <h2 className="text-lg font-semibold text-slate-900">Nouvelles demandes disponibles</h2>
        <div className="mt-3 space-y-2">
          {loading ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : null}
          {!loading && data.available.length === 0 ? <p className="text-sm text-slate-500">Aucune demande disponible pour votre categorie actuellement.</p> : null}
          {data.available.map((item) => renderRequestRow(item, "available"))}
        </div>
      </Card>

      <Card className="premium-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Demandes assignees et historique</h2>
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher categorie, ville, client" className="max-w-sm" />
        </div>
        <div className="mt-3 space-y-2">
          {loading ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : null}
          {!loading && filteredAssigned.length === 0 ? <p className="text-sm text-slate-500">Aucune mission trouvee.</p> : null}
          {filteredAssigned.map((item) => renderRequestRow(item, "assigned"))}
        </div>
      </Card>
    </div>
  );
}
