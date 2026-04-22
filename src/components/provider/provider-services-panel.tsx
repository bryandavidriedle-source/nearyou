"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ServiceCapability = {
  id: string;
  slug: string;
  title: string;
  categoryName: string;
  suggestedBasePriceChf: number;
  minPriceChf: number;
  isActive: boolean;
};

export function ProviderServicesPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ServiceCapability[]>([]);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/provider/services");
      const payload = (await response.json()) as { success?: boolean; data?: ServiceCapability[]; message?: string };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Impossible de charger les competences.");
      }
      setItems(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }

  function update(id: string, patch: Partial<ServiceCapability>) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/provider/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          services: items.map((item) => ({
            serviceId: item.id,
            minPriceChf: Number(item.minPriceChf),
            isActive: item.isActive,
          })),
        }),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Sauvegarde impossible.");
      }
      setMessage(payload.message ?? "Competences sauvegardees.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => `${item.title} ${item.categoryName}`.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <Card className="premium-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Competences et prix minimum</h2>
          <p className="text-sm text-slate-600">
            Activez les services que vous realisez et fixez votre prix minimum. Le client voit "des XX CHF".
          </p>
        </div>
        <Button onClick={() => void save()} disabled={saving || loading}>
          {saving ? "Sauvegarde..." : "Enregistrer"}
        </Button>
      </div>

      <div className="mt-3">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une competence..." />
      </div>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-green-700">{message}</p> : null}

      <div className="mt-4 space-y-2">
        {loading ? <p className="text-sm text-slate-500">Chargement...</p> : null}
        {!loading && filtered.length === 0 ? <p className="text-sm text-slate-500">Aucune competence pour ce filtre.</p> : null}
        {filtered.map((item) => (
          <div key={item.id} className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_140px_100px]">
            <div>
              <p className="font-medium text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-500">
                {item.categoryName} - base suggeree {item.suggestedBasePriceChf} CHF
              </p>
            </div>
            <Input
              type="number"
              min={0}
              value={item.minPriceChf}
              onChange={(event) => update(item.id, { minPriceChf: Number(event.target.value) || 0 })}
            />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={item.isActive}
                onChange={(event) => update(item.id, { isActive: event.target.checked })}
              />
              Actif
            </label>
          </div>
        ))}
      </div>
    </Card>
  );
}
