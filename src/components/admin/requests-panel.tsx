"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminScope } from "@/lib/auth";
import { providerRequestLabels, providerRequestStatuses, type ProviderRequestStatus } from "@/lib/workflow";

type ServiceRequestItem = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  category: string;
  status: "new" | "reviewing" | "contacted" | "closed";
  provider_status: ProviderRequestStatus;
  assigned_provider_profile_id: string | null;
  description: string;
  urgency: string | null;
  budget: string | null;
  budget_amount_chf: number | null;
  created_at: string;
};

type ProviderItem = {
  profile_id: string;
  display_name: string;
  is_active: boolean;
  application: { category: string | null } | null;
};

const supportStatuses = ["new", "reviewing", "contacted", "closed"] as const;

export function RequestsPanel({ adminScope }: { adminScope: AdminScope }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ServiceRequestItem[]>([]);
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [providerStatusFilter, setProviderStatusFilter] = useState<string>("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const search = new URLSearchParams();
      if (statusFilter !== "all") search.set("status", statusFilter);
      if (providerStatusFilter !== "all") search.set("providerStatus", providerStatusFilter);
      if (query.trim()) search.set("q", query.trim());

      const [requestsRes, providersRes] = await Promise.all([
        fetch(`/api/admin/service-requests?${search.toString()}`),
        fetch("/api/admin/providers?active=true"),
      ]);

      const requestsPayload = (await requestsRes.json()) as { success?: boolean; data?: ServiceRequestItem[]; message?: string };
      const providersPayload = (await providersRes.json()) as { success?: boolean; data?: ProviderItem[]; message?: string };

      if (!requestsRes.ok || !requestsPayload.success) throw new Error(requestsPayload.message ?? "Impossible de charger les demandes.");
      if (!providersRes.ok || !providersPayload.success) throw new Error(providersPayload.message ?? "Impossible de charger les prestataires.");

      setItems(requestsPayload.data ?? []);
      setProviders(providersPayload.data ?? []);
      setAssignment(Object.fromEntries((requestsPayload.data ?? []).map((item) => [item.id, item.assigned_provider_profile_id ?? ""])));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, [providerStatusFilter, query, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patchRequest(id: string, patch: Record<string, string>) {
    setSavingId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/service-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
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

  const providersByCategory = useMemo(() => {
    const map = new Map<string, ProviderItem[]>();
    for (const provider of providers) {
      const category = (provider.application?.category ?? "").toLowerCase();
      if (!category) continue;
      const existing = map.get(category) ?? [];
      existing.push(provider);
      map.set(category, existing);
    }
    return map;
  }, [providers]);

  function matchingProvidersForRequest(request: ServiceRequestItem) {
    return providersByCategory.get(request.category.toLowerCase()) ?? providers;
  }

  const canAssignProvider = adminScope === "super_admin" || adminScope === "admin_ops" || adminScope === "admin_review";
  const canChangeProviderStatus = adminScope === "super_admin" || adminScope === "admin_ops" || adminScope === "admin_review";

  return (
    <Card className="premium-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Gestion des demandes</h2>
        <div className="flex flex-wrap gap-2">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher client/email/telephone" className="w-72" />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "all")}>
            <SelectTrigger className="h-10 w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Statut client</SelectItem>
              {supportStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={providerStatusFilter} onValueChange={(value) => setProviderStatusFilter(value ?? "all")}>
            <SelectTrigger className="h-10 w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Statut mission</SelectItem>
              {providerRequestStatuses.map((status) => (
                <SelectItem key={status} value={status}>{providerRequestLabels[status]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={load}>Filtrer</Button>
        </div>
      </div>

      {error ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {!canAssignProvider ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Votre scope autorise la consultation et le suivi client, mais pas l'attribution prestataire.
        </p>
      ) : null}
      {loading ? <p className="mt-3 text-sm text-slate-500">Chargement...</p> : null}

      <div className="mt-3 space-y-3">
        {!loading && items.length === 0 ? <p className="text-sm text-slate-500">Aucune demande.</p> : null}
        {items.map((item) => {
          const matches = matchingProvidersForRequest(item);
          return (
            <div key={item.id} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.first_name} {item.last_name} - {item.category}</p>
                  <p>{item.email} - {item.phone}</p>
                  <p>{item.city} - {new Date(item.created_at).toLocaleString("fr-CH")}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-xs text-slate-500">Statut client: {item.status}</p>
                  <p className="text-xs text-slate-500">Statut mission: {providerRequestLabels[item.provider_status] ?? item.provider_status}</p>
                </div>
              </div>
              <p className="mt-2">{item.description}</p>
              <p className="mt-1 text-xs text-slate-500">Urgence: {item.urgency ?? "-"} | Budget: {item.budget_amount_chf ? `${item.budget_amount_chf} CHF` : item.budget ?? "-"}</p>

              <div className="mt-3 grid gap-2 lg:grid-cols-[200px_220px_1fr]">
                <select
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                  value={item.status}
                  onChange={(event) => patchRequest(item.id, { status: event.target.value })}
                  disabled={savingId === item.id}
                >
                  {supportStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <select
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                  value={item.provider_status}
                  onChange={(event) => patchRequest(item.id, { providerStatus: event.target.value })}
                  disabled={savingId === item.id || !canChangeProviderStatus}
                >
                  {providerRequestStatuses.map((status) => <option key={status} value={status}>{providerRequestLabels[status]}</option>)}
                </select>
                <div className="flex gap-2">
                  <select
                    className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm"
                    value={assignment[item.id] ?? ""}
                    onChange={(event) => setAssignment((prev) => ({ ...prev, [item.id]: event.target.value }))}
                    disabled={!canAssignProvider}
                  >
                    <option value="">Aucun prestataire</option>
                    {matches.map((provider) => (
                      <option key={provider.profile_id} value={provider.profile_id}>
                        {provider.display_name}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={savingId === item.id || !canAssignProvider}
                    onClick={() => patchRequest(item.id, { assignedProviderProfileId: assignment[item.id] ?? "", providerStatus: "assigned" })}
                  >
                    Attribuer
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
