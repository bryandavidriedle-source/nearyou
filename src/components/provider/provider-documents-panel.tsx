"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { providerDocumentKindLabels, providerDocumentKinds, providerDocumentStatusLabels, type ProviderDocumentKind } from "@/lib/workflow";

type DocumentItem = {
  id: string;
  kind: ProviderDocumentKind;
  status: "uploaded" | "pending_review" | "approved" | "rejected" | "needs_resubmission";
  original_filename: string | null;
  file_size_bytes: number | null;
  admin_note: string | null;
  created_at: string;
};

export function ProviderDocumentsPanel() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [kind, setKind] = useState<ProviderDocumentKind>("identity");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/provider/documents");
      const payload = (await response.json()) as { success?: boolean; data?: DocumentItem[]; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Impossible de charger les documents.");
      }
      setDocuments(payload.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }

  async function upload() {
    if (!file) {
      setError("Selectionnez un document.");
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("kind", kind);
      formData.append("file", file);

      const response = await fetch("/api/provider/documents", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Upload impossible.");
      }

      setMessage(payload.message ?? "Document televerse.");
      setFile(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'upload.");
    } finally {
      setUploading(false);
    }
  }

  async function openDocument(id: string) {
    const response = await fetch(`/api/provider/documents/${id}/download`);
    const payload = (await response.json()) as { success?: boolean; url?: string; message?: string };
    if (!response.ok || !payload.success || !payload.url) {
      setError(payload.message ?? "Impossible d'ouvrir ce document.");
      return;
    }
    window.open(payload.url, "_blank", "noopener,noreferrer");
  }

  return (
    <Card className="premium-card p-5">
      <h2 className="text-lg font-semibold text-slate-900">Documents prives</h2>
      <p className="mt-1 text-sm text-slate-600">Vos documents sont visibles uniquement par les administrateurs autorises.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr_140px]">
        <Select value={kind} onValueChange={(value) => setKind(value as ProviderDocumentKind)}>
          <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {providerDocumentKinds.map((item) => (
              <SelectItem key={item} value={item}>
                {providerDocumentKindLabels[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        <Button onClick={upload} disabled={uploading}>{uploading ? "Upload..." : "Televerser"}</Button>
      </div>

      {error ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mt-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p> : null}

      <div className="mt-4 space-y-2">
        {loading ? <p className="text-sm text-slate-500">Chargement...</p> : null}
        {!loading && documents.length === 0 ? <p className="text-sm text-slate-500">Aucun document televerse pour le moment.</p> : null}
        {documents.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{providerDocumentKindLabels[item.kind]}</p>
                <p>{item.original_filename ?? "Document"}</p>
                <p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString("fr-CH")}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                  {providerDocumentStatusLabels[item.status]}
                </span>
                <Button size="sm" variant="outline" onClick={() => openDocument(item.id)}>
                  Ouvrir
                </Button>
              </div>
            </div>
            {item.admin_note ? <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800">{item.admin_note}</p> : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
