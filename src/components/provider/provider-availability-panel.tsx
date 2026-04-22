"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AvailabilityRule = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

type UnavailabilityBlock = {
  startsAt: string;
  endsAt: string;
  reason: string;
};

const dayLabels = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export function ProviderAvailabilityPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [blocks, setBlocks] = useState<UnavailabilityBlock[]>([]);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/provider/availability");
      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: {
          rules: Array<{ day_of_week: number; start_time: string; end_time: string; is_active: boolean }>;
          blocks: Array<{ starts_at: string; ends_at: string; reason: string | null }>;
        };
      };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Impossible de charger les disponibilites.");
      }

      setRules((payload.data.rules ?? []).map((item) => ({
        dayOfWeek: item.day_of_week,
        startTime: item.start_time.slice(0, 5),
        endTime: item.end_time.slice(0, 5),
        isActive: item.is_active,
      })));
      setBlocks((payload.data.blocks ?? []).map((item) => ({
        startsAt: item.starts_at,
        endsAt: item.ends_at,
        reason: item.reason ?? "",
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }

  function addRule() {
    setRules((prev) => [...prev, { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isActive: true }]);
  }

  function removeRule(index: number) {
    setRules((prev) => prev.filter((_, idx) => idx !== index));
  }

  function updateRule(index: number, patch: Partial<AvailabilityRule>) {
    setRules((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  }

  function addBlock() {
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    setBlocks((prev) => [
      ...prev,
      {
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        reason: "",
      },
    ]);
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, idx) => idx !== index));
  }

  function updateBlock(index: number, patch: Partial<UnavailabilityBlock>) {
    setBlocks((prev) => prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)));
  }

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/provider/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rules,
          blocks,
        }),
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Impossible d'enregistrer les disponibilites.");
      }
      setMessage(payload.message ?? "Disponibilites mises a jour.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="premium-card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Disponibilites hebdomadaires</h2>
          <Button size="sm" variant="outline" onClick={addRule}>Ajouter une plage</Button>
        </div>
        {loading ? <p className="text-sm text-slate-500">Chargement...</p> : null}
        <div className="space-y-2">
          {rules.map((rule, index) => (
            <div key={`${rule.dayOfWeek}-${index}`} className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_140px_140px_120px]">
              <select
                value={rule.dayOfWeek}
                onChange={(event) => updateRule(index, { dayOfWeek: Number(event.target.value) })}
                className="h-10 rounded-md border border-slate-200 px-3 text-sm"
              >
                {dayLabels.map((label, day) => (
                  <option key={label} value={day}>{label}</option>
                ))}
              </select>
              <Input type="time" value={rule.startTime} onChange={(event) => updateRule(index, { startTime: event.target.value })} />
              <Input type="time" value={rule.endTime} onChange={(event) => updateRule(index, { endTime: event.target.value })} />
              <Button size="sm" variant="outline" onClick={() => removeRule(index)}>Supprimer</Button>
            </div>
          ))}
          {!loading && rules.length === 0 ? <p className="text-sm text-slate-500">Aucune plage horaire definie.</p> : null}
        </div>
      </Card>

      <Card className="premium-card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Indisponibilites planifiees</h2>
          <Button size="sm" variant="outline" onClick={addBlock}>Ajouter une indisponibilite</Button>
        </div>
        <div className="space-y-2">
          {blocks.map((block, index) => (
            <div key={index} className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-3">
              <Input
                type="datetime-local"
                value={new Date(block.startsAt).toISOString().slice(0, 16)}
                onChange={(event) => updateBlock(index, { startsAt: new Date(event.target.value).toISOString() })}
              />
              <Input
                type="datetime-local"
                value={new Date(block.endsAt).toISOString().slice(0, 16)}
                onChange={(event) => updateBlock(index, { endsAt: new Date(event.target.value).toISOString() })}
              />
              <div className="flex gap-2">
                <Input
                  value={block.reason}
                  onChange={(event) => updateBlock(index, { reason: event.target.value })}
                  placeholder="Raison (facultatif)"
                />
                <Button size="sm" variant="outline" onClick={() => removeBlock(index)}>X</Button>
              </div>
            </div>
          ))}
          {blocks.length === 0 ? <p className="text-sm text-slate-500">Aucune indisponibilite enregistree.</p> : null}
        </div>
      </Card>

      {error ? <Card className="rounded-xl border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</Card> : null}
      {message ? <Card className="rounded-xl border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</Card> : null}

      <Button onClick={save} disabled={saving}>{saving ? "Sauvegarde..." : "Enregistrer mes disponibilites"}</Button>
    </div>
  );
}
