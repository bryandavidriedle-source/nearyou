"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { providerDocumentKindLabels, providerDocumentStatusLabels, providerDocumentStatuses, providerWorkflowLabels, providerWorkflowStatuses, type ProviderWorkflowStatus } from "@/lib/workflow";

type ProviderDocumentItem = {
  id: string;
  kind: keyof typeof providerDocumentKindLabels;
  status: keyof typeof providerDocumentStatusLabels;
  original_filename: string | null;
  file_size_bytes: number | null;
  admin_note: string | null;
  reviewed_at: string | null;
  created_at: string;
};

type ApplicationData = {
  id: string;
  profile_id: string | null;
  workflow_status: ProviderWorkflowStatus;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  business_name: string;
  birth_date: string | null;
  address_line: string | null;
  postal_code: string | null;
  city: string;
  canton: string | null;
  country: string | null;
  category: string;
  intervention_radius_km: number | null;
  legal_status: string | null;
  company_name: string | null;
  ide_number: string | null;
  iban: string | null;
  id_document_type: string | null;
  services_description: string | null;
  years_experience: string | null;
  availability: string | null;
  languages: string[] | null;
  accepts_urgency: boolean | null;
  admin_note: string | null;
};

export function ProviderApplicationDetailPanel({ applicationId }: { applicationId: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [documents, setDocuments] = useState<ProviderDocumentItem[]>([]);
  const [adminNote, setAdminNote] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/provider-applications/${applicationId}`);
      const payload = (await response.json()) as {
        success?: boolean;
        data?: { application: ApplicationData; documents: ProviderDocumentItem[] };
        message?: string;
      };
      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Impossible de charger ce dossier.");
      }
      setApplication(payload.data.application);
      setDocuments(payload.data.documents ?? []);
      setAdminNote(payload.data.application.admin_note ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateWorkflow(workflowStatus: ProviderWorkflowStatus) {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/provider-applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowStatus, adminNote }),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Mise a jour impossible.");
      }
      setMessage(payload.message ?? "Dossier mis a jour.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de mise a jour.");
    } finally {
      setSaving(false);
    }
  }

  async function openDocument(id: string) {
    const response = await fetch(`/api/admin/provider-documents/${id}/download`);
    const payload = (await response.json()) as { success?: boolean; url?: string; message?: string };
    if (!response.ok || !payload.success || !payload.url) {
      setError(payload.message ?? "Impossible d'ouvrir le document.");
      return;
    }
    window.open(payload.url, "_blank", "noopener,noreferrer");
  }

  async function updateDocumentStatus(id: string, status: (typeof providerDocumentStatuses)[number]) {
    const response = await fetch(`/api/admin/provider-documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote }),
    });
    const payload = (await response.json()) as { success?: boolean; message?: string };
    if (!response.ok || !payload.success) {
      setError(payload.message ?? "Impossible de mettre a jour le document.");
      return;
    }
    setMessage(payload.message ?? "Document mis a jour.");
    await load();
  }

  if (loading) {
    return <Card className="premium-card p-5">Chargement du dossier prestataire...</Card>;
  }

  if (!application) {
    return <Card className="premium-card p-5">Dossier introuvable.</Card>;
  }

  const maskedIban = application.iban ? `${application.iban.slice(0, 4)}••••${application.iban.slice(-4)}` : "-";

  return (
    <div className="space-y-4">
      {error ? <Card className="rounded-xl border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</Card> : null}
      {message ? <Card className="rounded-xl border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</Card> : null}

      <Card className="premium-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{application.first_name ?? ""} {application.last_name ?? ""}</h2>
            <p className="text-sm text-slate-600">{application.email} - {application.phone ?? "N/A"}</p>
            <p className="text-sm text-slate-600">{application.category} - {application.city}{application.canton ? ` (${application.canton})` : ""}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
            {providerWorkflowLabels[application.workflow_status] ?? application.workflow_status}
          </span>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          <p><span className="font-semibold text-slate-900">Societe:</span> {application.company_name ?? "-"}</p>
          <p><span className="font-semibold text-slate-900">IDE:</span> {application.ide_number ?? "-"}</p>
          <p><span className="font-semibold text-slate-900">Naissance:</span> {application.birth_date ?? "-"}</p>
          <p><span className="font-semibold text-slate-900">IBAN:</span> {maskedIban}</p>
          <p><span className="font-semibold text-slate-900">Statut juridique:</span> {application.legal_status ?? "-"}</p>
          <p><span className="font-semibold text-slate-900">Document:</span> {application.id_document_type ?? "-"}</p>
          <p><span className="font-semibold text-slate-900">Rayon:</span> {application.intervention_radius_km ?? "-"} km</p>
          <p className="md:col-span-2"><span className="font-semibold text-slate-900">Adresse:</span> {application.address_line ?? "-"}, {application.postal_code ?? "-"} {application.city} {application.country ?? ""}</p>
          <p><span className="font-semibold text-slate-900">Langues:</span> {(application.languages ?? []).join(", ") || "-"}</p>
          <p><span className="font-semibold text-slate-900">Urgence:</span> {application.accepts_urgency ? "oui" : "non"}</p>
          <p className="md:col-span-2"><span className="font-semibold text-slate-900">Description:</span> {application.services_description ?? "-"}</p>
          <p className="md:col-span-2"><span className="font-semibold text-slate-900">Disponibilite:</span> {application.availability ?? "-"}</p>
        </div>

        <div className="mt-4 space-y-2">
          <Textarea value={adminNote} onChange={(event) => setAdminNote(event.target.value)} placeholder="Note admin interne ou message de correction" />
          <div className="flex flex-wrap gap-2">
            {providerWorkflowStatuses.map((status) => (
              <Button key={status} size="sm" variant={application.workflow_status === status ? "default" : "outline"} onClick={() => updateWorkflow(status)} disabled={saving}>
                {providerWorkflowLabels[status]}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="premium-card p-5">
        <h3 className="text-base font-semibold text-slate-900">Documents prives</h3>
        <div className="mt-3 space-y-2">
          {documents.length === 0 ? <p className="text-sm text-slate-500">Aucun document associe.</p> : null}
          {documents.map((document) => (
            <div key={document.id} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{providerDocumentKindLabels[document.kind] ?? document.kind}</p>
                  <p>{document.original_filename ?? "Document"}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                  {providerDocumentStatusLabels[document.status] ?? document.status}
                </span>
              </div>
              {document.admin_note ? <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800">{document.admin_note}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => openDocument(document.id)}>Ouvrir</Button>
                <Button size="sm" variant="outline" onClick={() => updateDocumentStatus(document.id, "approved")}>Valider</Button>
                <Button size="sm" variant="outline" onClick={() => updateDocumentStatus(document.id, "needs_resubmission")}>Demander renvoi</Button>
                <Button size="sm" variant="outline" onClick={() => updateDocumentStatus(document.id, "rejected")}>Refuser</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
