"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  is_public: boolean;
  is_moderated: boolean;
  created_at: string;
  providers: { display_name: string | null } | null;
};

export function ReviewsPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState<ReviewItem[]>([]);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/reviews");
      const payload = (await response.json()) as { success?: boolean; data?: ReviewItem[]; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Impossible de charger les avis.");
      }
      setItems(payload.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }

  async function patchReview(id: string, patch: { isPublic?: boolean; isModerated?: boolean }) {
    const response = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const payload = (await response.json()) as { success?: boolean; message?: string };
    if (!response.ok || !payload.success) {
      setError(payload.message ?? "Impossible de moderer cet avis.");
      return;
    }
    await load();
  }

  const filtered = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "public") return item.is_public;
    if (filter === "hidden") return !item.is_public;
    if (filter === "unmoderated") return !item.is_moderated;
    return true;
  });

  return (
    <Card className="premium-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Moderation des avis</h2>
        <Select value={filter} onValueChange={(value) => setFilter(value ?? "all")}>
          <SelectTrigger className="h-10 w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="public">Publics</SelectItem>
            <SelectItem value="hidden">Masques</SelectItem>
            <SelectItem value="unmoderated">A moderer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="mt-3 text-sm text-slate-500">Chargement...</p> : null}

      <div className="mt-3 space-y-2">
        {!loading && filtered.length === 0 ? <p className="text-sm text-slate-500">Aucun avis.</p> : null}
        {filtered.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">{item.providers?.display_name ?? "Prestataire"} - {item.rating}/5</p>
            <p className="mt-1">{item.comment ?? "Sans commentaire"}</p>
            <p className="mt-1 text-xs text-slate-500">{new Date(item.created_at).toLocaleString("fr-CH")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => patchReview(item.id, { isPublic: !item.is_public, isModerated: true })}>
                {item.is_public ? "Masquer" : "Rendre public"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => patchReview(item.id, { isModerated: true })}>
                Marquer modere
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
