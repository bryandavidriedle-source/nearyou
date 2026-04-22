"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { providerWorkflowLabels, providerWorkflowStatuses, type ProviderWorkflowStatus } from "@/lib/workflow";

type ApplicationItem = {
  id: string;
  profile_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  business_name: string;
  category: string;
  city: string;
  canton: string | null;
  workflow_status: ProviderWorkflowStatus;
  updated_at: string;
  created_at: string;
  admin_note: string | null;
};

export function ProvidersApplicationsPanel() {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ApplicationItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const search = new URLSearchParams();
      if (statusFilter !== "all") search.set("workflowStatus", statusFilter);
      if (query.trim()) search.set("q", query.trim());

      const response = await fetch(`/api/admin/provider-applications?${search.toString()}`);
      const payload = (await response.json()) as { success?: boolean; data?: ApplicationItem[]; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Impossible de charger les dossiers.");
      }
      setItems(payload.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, [query, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateStatus(id: string, workflowStatus: ProviderWorkflowStatus) {
    setSavingId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/provider-applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowStatus }),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Mise a jour impossible.");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de mise a jour.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <Card className="premium-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Gestion des prestataires</h2>
        <div className="flex flex-wrap gap-2">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher nom, email, societe" className="w-72" />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
            <SelectTrigger className="h-10 w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {providerWorkflowStatuses.map((status) => (
                <SelectItem key={status} value={status}>{providerWorkflowLabels[status]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={load}>Filtrer</Button>
        </div>
      </div>

      {error ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="mt-3 text-sm text-slate-500">Chargement...</p> : null}

      <div className="mt-3 space-y-2">
        {!loading && items.length === 0 ? <p className="text-sm text-slate-500">Aucun dossier correspondant.</p> : null}
        {items.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{item.first_name ?? ""} {item.last_name ?? ""} - {item.business_name}</p>
                <p>{item.email} - {item.phone ?? "N/A"}</p>
                <p>{item.category} - {item.city}{item.canton ? ` (${item.canton})` : ""}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                {providerWorkflowLabels[item.workflow_status] ?? item.workflow_status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/admin/prestataires/${item.id}`} className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                Ouvrir dossier
              </Link>
              <Button size="sm" onClick={() => updateStatus(item.id, "approved")} disabled={savingId === item.id}>Approuver</Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "needs_info")} disabled={savingId === item.id}>Demander infos</Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "rejected")} disabled={savingId === item.id}>Refuser</Button>
              <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "suspended")} disabled={savingId === item.id}>Suspendre</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
