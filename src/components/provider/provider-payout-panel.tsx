"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type PayoutAccount = {
  account_holder_name: string;
  iban: string;
  bank_name: string | null;
  currency: "CHF" | "EUR";
  is_verified: boolean;
  verification_note: string | null;
};

export function ProviderPayoutPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [accountHolderName, setAccountHolderName] = useState("");
  const [iban, setIban] = useState("");
  const [bankName, setBankName] = useState("");
  const [currency, setCurrency] = useState<"CHF" | "EUR">("CHF");
  const [isVerified, setIsVerified] = useState(false);
  const [verificationNote, setVerificationNote] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/provider/payout-account");
      const payload = (await response.json()) as { success?: boolean; data?: PayoutAccount | null; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Impossible de charger les informations bancaires.");
      }
      if (payload.data) {
        setAccountHolderName(payload.data.account_holder_name ?? "");
        setIban(payload.data.iban ?? "");
        setBankName(payload.data.bank_name ?? "");
        setCurrency(payload.data.currency ?? "CHF");
        setIsVerified(payload.data.is_verified ?? false);
        setVerificationNote(payload.data.verification_note ?? null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/provider/payout-account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountHolderName,
          iban,
          bankName,
          currency,
        }),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Enregistrement impossible.");
      }
      setMessage(payload.message ?? "Informations bancaires enregistrees.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="premium-card p-5">
      <h2 className="text-lg font-semibold text-slate-900">Compte bancaire / payout</h2>
      <p className="mt-1 text-sm text-slate-600">
        Vos informations sont privees et utilisees uniquement pour les versements prestataire.
      </p>

      {loading ? <p className="mt-3 text-sm text-slate-500">Chargement...</p> : null}
      {verificationNote ? <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{verificationNote}</p> : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Input value={accountHolderName} onChange={(event) => setAccountHolderName(event.target.value)} placeholder="Titulaire du compte" />
        <Input value={bankName} onChange={(event) => setBankName(event.target.value)} placeholder="Nom de la banque (optionnel)" />
        <Input value={iban} onChange={(event) => setIban(event.target.value)} placeholder="IBAN" className="sm:col-span-2" />
        <select
          value={currency}
          onChange={(event) => setCurrency(event.target.value === "EUR" ? "EUR" : "CHF")}
          className="h-10 rounded-md border border-slate-200 px-3 text-sm"
        >
          <option value="CHF">CHF</option>
          <option value="EUR">EUR</option>
        </select>
        <div className="flex items-center text-sm">
          <span className={`rounded-full px-3 py-1 font-semibold ${isVerified ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
            {isVerified ? "Compte verifie" : "En attente de verification"}
          </span>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-green-700">{message}</p> : null}

      <div className="mt-4">
        <Button onClick={() => void save()} disabled={saving || loading}>
          {saving ? "Sauvegarde..." : "Sauvegarder mes coordonnees"}
        </Button>
      </div>
    </Card>
  );
}
