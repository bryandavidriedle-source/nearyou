"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type CategoryItem = {
  id: string;
  slug: string;
  name_fr: string;
  description: string | null;
  from_price_chf: number;
  active: boolean;
  display_order: number;
};

export function CategoriesPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CategoryItem[]>([]);
  const [newSlug, setNewSlug] = useState("");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/categories");
      const payload = (await response.json()) as { success?: boolean; data?: CategoryItem[]; message?: string };
      if (!response.ok || !payload.success) throw new Error(payload.message ?? "Impossible de charger les categories.");
      setItems(payload.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }

  async function createCategory() {
    if (!newSlug.trim() || !newName.trim()) return;
    const response = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: newSlug.trim(),
        nameFr: newName.trim(),
      }),
    });
    const payload = (await response.json()) as { success?: boolean; message?: string };
    if (!response.ok || !payload.success) {
      setError(payload.message ?? "Creation impossible.");
      return;
    }
    setNewSlug("");
    setNewName("");
    await load();
  }

  async function patchCategory(id: string, patch: Record<string, string | number | boolean>) {
    const response = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const payload = (await response.json()) as { success?: boolean; message?: string };
    if (!response.ok || !payload.success) {
      setError(payload.message ?? "Mise a jour impossible.");
      return;
    }
    await load();
  }

  return (
    <Card className="premium-card p-5">
      <h2 className="text-lg font-semibold text-slate-900">Categories & services</h2>
      <p className="mt-1 text-sm text-slate-600">Activez, ordonnez et mettez a jour les categories visibles publiquement.</p>

      <div className="mt-4 grid gap-2 md:grid-cols-[220px_1fr_120px]">
        <Input value={newSlug} onChange={(event) => setNewSlug(event.target.value)} placeholder="slug" />
        <Input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Nom categorie (FR)" />
        <Button onClick={createCategory}>Ajouter</Button>
      </div>

      {error ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="mt-3 text-sm text-slate-500">Chargement...</p> : null}

      <div className="mt-3 space-y-2">
        {!loading && items.length === 0 ? <p className="text-sm text-slate-500">Aucune categorie.</p> : null}
        {items.map((item) => (
          <div key={item.id} className="grid gap-2 rounded-xl border border-slate-200 p-3 text-sm text-slate-700 lg:grid-cols-[1fr_120px_120px_130px]">
            <div>
              <p className="font-semibold text-slate-900">{item.name_fr}</p>
              <p className="text-xs text-slate-500">{item.slug}</p>
            </div>
            <Input
              type="number"
              value={item.display_order}
              onChange={(event) => patchCategory(item.id, { displayOrder: Number(event.target.value) || 0 })}
              placeholder="Ordre"
            />
            <Input
              type="number"
              value={item.from_price_chf}
              onChange={(event) => patchCategory(item.id, { fromPriceChf: Number(event.target.value) || 0 })}
              placeholder="Prix CHF"
            />
            <Button size="sm" variant="outline" onClick={() => patchCategory(item.id, { active: !item.active })}>
              {item.active ? "Desactiver" : "Activer"}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
