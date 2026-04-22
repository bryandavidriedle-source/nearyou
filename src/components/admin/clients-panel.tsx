"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ClientItem = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  city: string | null;
  account_status: "active" | "suspended";
  created_at: string;
  request_count: number;
};

export function ClientsPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ClientItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      const response = await fetch(`/api/admin/clients?${params.toString()}`);
      const payload = (await response.json()) as { success?: boolean; data?: ClientItem[]; message?: string };
      if (!response.ok || !payload.success) throw new Error(payload.message ?? "Impossible de charger les clients.");
      setItems(payload.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleStatus(id: string, currentStatus: "active" | "suspended") {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    const response = await fetch(`/api/admin/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountStatus: nextStatus }),
    });
    const payload = (await response.json()) as { success?: boolean; message?: string };
    if (!response.ok || !payload.success) {
      setError(payload.message ?? "Impossible de mettre a jour ce client.");
      return;
    }
    await load();
  }

  return (
    <Card className="premium-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Gestion clients</h2>
        <div className="flex gap-2">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher nom, telephone" className="w-72" />
          <Button variant="outline" onClick={load}>Filtrer</Button>
        </div>
      </div>

      {error ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="mt-3 text-sm text-slate-500">Chargement...</p> : null}

      <div className="mt-3 space-y-2">
        {!loading && items.length === 0 ? <p className="text-sm text-slate-500">Aucun client trouve.</p> : null}
        {items.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
            <div>
              <p className="font-semibold text-slate-900">{item.first_name ?? ""} {item.last_name ?? ""}</p>
              <p>{item.phone ?? "N/A"} - {item.city ?? "-"}</p>
              <p className="text-xs text-slate-500">
                Demandes: {item.request_count} - Inscription: {new Date(item.created_at).toLocaleDateString("fr-CH")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.account_status === "active" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                {item.account_status}
              </span>
              <Button size="sm" variant="outline" onClick={() => toggleStatus(item.id, item.account_status)}>
                {item.account_status === "active" ? "Suspendre" : "Reactiver"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
