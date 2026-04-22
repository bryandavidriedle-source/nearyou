"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Props = {
  initialFirstName: string;
  initialLastName: string;
  initialPhone: string;
  initialCity: string;
};

export function CustomerOnboardingCard({
  initialFirstName,
  initialLastName,
  initialPhone,
  initialCity,
}: Props) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phone, setPhone] = useState(initialPhone);
  const [city, setCity] = useState(initialCity);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const completion = useMemo(() => {
    const required = [firstName, lastName, city].filter((value) => value.trim().length > 1).length;
    const phoneReady = phone.trim().length >= 8 ? 1 : 0;
    return Math.round(((required + phoneReady) / 4) * 100);
  }, [city, firstName, lastName, phone]);

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          city,
        }),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Mise a jour impossible.");
      }
      setMessage(payload.message ?? "Profil mis a jour.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setSaving(false);
    }
  }

  if (completion === 100) {
    return (
      <Card className="rounded-2xl border-green-200 bg-green-50 p-4 text-sm text-green-800">
        Profil client complet. Vos demandes seront traitees plus vite par notre equipe operation.
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-blue-200 bg-blue-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Onboarding client</h2>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">{completion}% complete</span>
      </div>
      <p className="mt-1 text-sm text-slate-700">
        Finalisez votre profil en 1 minute pour accelerer les rappels et confirmations.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Input value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Prenom" />
        <Input value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Nom" />
        <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Telephone (recommande)" />
        <Input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Ville" />
      </div>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-green-700">{message}</p> : null}

      <div className="mt-4">
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer mon profil"}
        </Button>
      </div>
    </Card>
  );
}
