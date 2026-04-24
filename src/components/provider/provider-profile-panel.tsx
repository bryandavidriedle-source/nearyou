"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { serviceCategories } from "@/lib/constants";
import { providerWorkflowLabels } from "@/lib/workflow";

type ProviderProfileResponse = {
  profile: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    city: string | null;
  } | null;
  application: {
    workflow_status: keyof typeof providerWorkflowLabels;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    birth_date: string | null;
    address_line: string | null;
    postal_code: string | null;
    city: string | null;
    canton: string | null;
    country: string | null;
    category: string | null;
    intervention_radius_km: number | null;
    services_description: string | null;
    years_experience: string | null;
    availability: string | null;
    legal_status: "independant" | "entreprise" | null;
    company_name: string | null;
    ide_number: string | null;
    iban: string | null;
    vat_number: string | null;
    languages: string[] | null;
    accepts_urgency: boolean | null;
    admin_note: string | null;
  } | null;
  documents: {
    total: number;
    approved: number;
    pending: number;
    needsResubmission: number;
  };
  isSuspended: boolean;
};

type FormState = {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  addressLine: string;
  postalCode: string;
  city: string;
  canton: string;
  category: string;
  interventionRadiusKm: number;
  country: string;
  servicesDescription: string;
  yearsExperience: string;
  availability: string;
  legalStatus: "independant" | "entreprise";
  companyName: string;
  ideNumber: string;
  iban: string;
  vatNumber: string;
  languages: string;
  acceptsUrgency: boolean;
};

type OnboardingStep = 1 | 2 | 3 | 4;

const emptyState: FormState = {
  firstName: "",
  lastName: "",
  phone: "",
  birthDate: "",
  addressLine: "",
  postalCode: "",
  city: "",
  canton: "VD",
  category: "",
  interventionRadiusKm: 20,
  country: "Suisse",
  servicesDescription: "",
  yearsExperience: "",
  availability: "",
  legalStatus: "independant",
  companyName: "",
  ideNumber: "",
  iban: "",
  vatNumber: "",
  languages: "fr",
  acceptsUrgency: false,
};

const steps: Array<{ id: OnboardingStep; title: string; summary: string }> = [
  { id: 1, title: "Identite", summary: "Coordonnees + categorie" },
  { id: 2, title: "Expertise", summary: "Description + langues" },
  { id: 3, title: "Conformite", summary: "Documents + IBAN" },
  { id: 4, title: "Validation", summary: "Soumission du dossier" },
];

export function ProviderProfilePanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<keyof typeof providerWorkflowLabels | null>(null);
  const [adminNote, setAdminNote] = useState<string | null>(null);
  const [documents, setDocuments] = useState<ProviderProfileResponse["documents"]>({
    total: 0,
    approved: 0,
    pending: 0,
    needsResubmission: 0,
  });
  const [step, setStep] = useState<OnboardingStep>(1);
  const [form, setForm] = useState<FormState>(emptyState);

  useEffect(() => {
    void load();
  }, []);

  const completion = useMemo(() => {
    const step1 =
      form.firstName.trim().length >= 2 &&
      form.lastName.trim().length >= 2 &&
      form.phone.trim().length >= 8 &&
      form.birthDate.trim().length > 0 &&
      form.city.trim().length >= 2 &&
      form.category.trim().length >= 2;
    const step2 =
      form.servicesDescription.trim().length >= 20 &&
      form.languages.split(",").map((item) => item.trim()).filter(Boolean).length >= 1;
    const step3 = form.iban.trim().length >= 12 && documents.total > 0 && documents.needsResubmission === 0;
    const step4 = workflowStatus === "pending_review" || workflowStatus === "approved";

    return { step1, step2, step3, step4 };
  }, [documents.needsResubmission, documents.total, form, workflowStatus]);

  const isMinorProvider = useMemo(() => {
    if (!form.birthDate) return false;
    const birth = new Date(form.birthDate);
    if (Number.isNaN(birth.getTime())) return false;
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      years -= 1;
    }
    return years >= 15 && years < 18;
  }, [form.birthDate]);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/provider/profile");
      const payload = (await response.json()) as { success?: boolean; data?: ProviderProfileResponse; message?: string };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Impossible de charger votre profil.");
      }

      const data = payload.data;
      const source = data.application ?? data.profile;
      setWorkflowStatus(data.application?.workflow_status ?? null);
      setAdminNote(data.application?.admin_note ?? null);
      setDocuments(
        data.documents ?? {
          total: 0,
          approved: 0,
          pending: 0,
          needsResubmission: 0,
        },
      );
      setForm({
        firstName: (source?.first_name ?? "").trim(),
        lastName: (source?.last_name ?? "").trim(),
        phone: (source?.phone ?? "").trim(),
        birthDate: data.application?.birth_date ?? "",
        addressLine: (data.application?.address_line ?? "").trim(),
        postalCode: (data.application?.postal_code ?? "").trim(),
        city: (source?.city ?? "").trim(),
        canton: (data.application?.canton ?? "VD").trim(),
        category: (data.application?.category ?? "").trim(),
        interventionRadiusKm: data.application?.intervention_radius_km ?? 20,
        country: (data.application?.country ?? "Suisse").trim(),
        servicesDescription: (data.application?.services_description ?? "").trim(),
        yearsExperience: (data.application?.years_experience ?? "").trim(),
        availability: (data.application?.availability ?? "").trim(),
        legalStatus: data.application?.legal_status === "entreprise" ? "entreprise" : "independant",
        companyName: (data.application?.company_name ?? "").trim(),
        ideNumber: (data.application?.ide_number ?? "").trim(),
        iban: (data.application?.iban ?? "").trim(),
        vatNumber: (data.application?.vat_number ?? "").trim(),
        languages: (data.application?.languages ?? ["fr"]).join(", "),
        acceptsUrgency: Boolean(data.application?.accepts_urgency),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save(submitForReview: boolean) {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/provider/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          languages: form.languages
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          submitForReview,
        }),
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Impossible de sauvegarder.");
      }

      setMessage(payload.message ?? "Modifications enregistrees.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  function nextStep() {
    if (step === 1 && !completion.step1) {
      setError("Completez les informations obligatoires de l'etape 1.");
      return;
    }
    if (step === 2 && !completion.step2) {
      setError("Completez la description de service et les langues.");
      return;
    }
    if (step === 3 && !completion.step3) {
      setError("Ajoutez un IBAN valide et au moins un document conforme.");
      return;
    }
    setError(null);
    setStep((prev) => (prev < 4 ? ((prev + 1) as OnboardingStep) : prev));
  }

  function previousStep() {
    setError(null);
    setStep((prev) => (prev > 1 ? ((prev - 1) as OnboardingStep) : prev));
  }

  if (loading) {
    return <Card className="premium-card p-5">Chargement du profil prestataire...</Card>;
  }

  return (
    <Card className="premium-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Onboarding prestataire</h2>
          <p className="text-sm text-slate-600">
            Statut: {workflowStatus ? providerWorkflowLabels[workflowStatus] : "Dossier non soumis"}
          </p>
        </div>
        <Button variant="outline" onClick={() => void save(false)} disabled={saving}>
          {saving ? "Enregistrement..." : "Sauvegarder"}
        </Button>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-4">
        {steps.map((item) => {
          const isActive = step === item.id;
          const isCompleted =
            item.id === 1 ? completion.step1 : item.id === 2 ? completion.step2 : item.id === 3 ? completion.step3 : completion.step4;

          return (
            <button
              type="button"
              key={item.id}
              onClick={() => setStep(item.id)}
              className={`rounded-xl border px-3 py-2 text-left transition ${
                isActive
                  ? "border-blue-300 bg-blue-50"
                  : isCompleted
                    ? "border-green-200 bg-green-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Etape {item.id}</p>
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-600">{item.summary}</p>
            </button>
          );
        })}
      </div>

      {adminNote ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Note admin: {adminNote}
        </p>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} placeholder="Prenom" />
          <Input value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} placeholder="Nom" />
          <Input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="Telephone" />
          <Input type="date" value={form.birthDate} onChange={(event) => updateField("birthDate", event.target.value)} placeholder="Date de naissance" />
          <select
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Catégorie principale</option>
            {serviceCategories.map((category) => (
              <option key={category.slug} value={category.label}>
                {category.label}
              </option>
            ))}
          </select>
          <Input value={form.city} onChange={(event) => updateField("city", event.target.value)} placeholder="Ville" />
          <Input value={form.canton} onChange={(event) => updateField("canton", event.target.value)} placeholder="Canton" />
          <Input value={form.addressLine} onChange={(event) => updateField("addressLine", event.target.value)} placeholder="Adresse" />
          <Input value={form.postalCode} onChange={(event) => updateField("postalCode", event.target.value)} placeholder="NPA" />
          <Input
            type="number"
            min={1}
            max={100}
            value={form.interventionRadiusKm}
            onChange={(event) => updateField("interventionRadiusKm", Number(event.target.value) || 1)}
            placeholder="Rayon (km)"
          />
          <Input value={form.country} onChange={(event) => updateField("country", event.target.value)} placeholder="Pays" />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            value={form.yearsExperience}
            onChange={(event) => updateField("yearsExperience", event.target.value)}
            placeholder="Annees d'experience"
          />
          <Input value={form.availability} onChange={(event) => updateField("availability", event.target.value)} placeholder="Disponibilite generale" />
          <Input
            value={form.languages}
            onChange={(event) => updateField("languages", event.target.value)}
            placeholder="Langues (ex: fr, en, de)"
            className="sm:col-span-2"
          />
          <label className="sm:col-span-2 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.acceptsUrgency}
              onChange={(event) => updateField("acceptsUrgency", event.target.checked)}
            />
            Accepte les interventions urgentes
          </label>
          <Textarea
            value={form.servicesDescription}
            onChange={(event) => updateField("servicesDescription", event.target.value)}
            className="min-h-28 sm:col-span-2"
            placeholder="Description de vos services, competences et zone d'intervention"
          />
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              value={form.legalStatus}
              onChange={(event) =>
                updateField("legalStatus", event.target.value === "entreprise" ? "entreprise" : "independant")
              }
              placeholder="Statut juridique"
            />
            <Input value={form.companyName} onChange={(event) => updateField("companyName", event.target.value)} placeholder="Societe (facultatif)" />
            <Input value={form.ideNumber} onChange={(event) => updateField("ideNumber", event.target.value)} placeholder="Numero IDE (facultatif)" />
            <Input value={form.iban} onChange={(event) => updateField("iban", event.target.value)} placeholder="IBAN" />
            <Input value={form.vatNumber} onChange={(event) => updateField("vatNumber", event.target.value)} placeholder="TVA (facultatif)" />
          </div>

          <Card className="rounded-xl border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Documents prives</p>
            <p className="mt-1">
              {documents.total} document(s) - {documents.approved} valide(s) - {documents.pending} en verification
              {documents.needsResubmission > 0 ? ` - ${documents.needsResubmission} a renvoyer` : ""}
            </p>
            <div className="mt-3">
              <Link href="/espace-prestataire/documents" className="text-sm font-semibold text-blue-700 hover:underline">
                Ouvrir la gestion des documents
              </Link>
            </div>
          </Card>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <Card className="rounded-xl border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <p className="font-semibold">Avant soumission</p>
            <ul className="mt-2 space-y-1">
              <li>1. Identite complete: {completion.step1 ? "Oui" : "Non"}</li>
              <li>2. Expertise complete: {completion.step2 ? "Oui" : "Non"}</li>
              <li>3. Documents + IBAN valides: {completion.step3 ? "Oui" : "Non"}</li>
            </ul>
          </Card>
          {isMinorProvider ? (
            <Card className="rounded-xl border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Prestataire mineur (15-17 ans): accès limité aux missions simples après validation admin renforcée.
            </Card>
          ) : null}
          <p className="text-sm text-slate-600">
            Une fois soumis, le dossier passe en revue manuelle. Vous verrez les retours admin ici en cas de besoin
            d'informations complementaires.
          </p>
          <Button
            onClick={() => void save(true)}
            disabled={saving || !completion.step1 || !completion.step2 || !completion.step3}
          >
            {saving ? "Soumission..." : "Envoyer pour validation"}
          </Button>
        </div>
      ) : null}

      {error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p> : null}

      <div className="mt-4 flex flex-wrap justify-between gap-2">
        <Button variant="outline" onClick={previousStep} disabled={step === 1}>
          Etape precedente
        </Button>
        <Button onClick={nextStep} disabled={step === 4}>
          Etape suivante
        </Button>
      </div>
    </Card>
  );
}
