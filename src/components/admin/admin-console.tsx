"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ServiceRequestItem = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  city: string;
  category: string;
  status: "new" | "reviewing" | "contacted" | "closed";
  description: string;
  created_at: string;
};

type ProviderApplicationItem = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string;
  city: string;
  canton: string | null;
  category: string;
  workflow_status: "draft" | "submitted" | "pending_review" | "approved" | "rejected" | "needs_info" | "suspended";
  id_document_path: string | null;
  residence_permit_path: string | null;
  admin_note: string | null;
  created_at: string;
};

type AdminAccountItem = {
  profile_id: string;
  scope: "super_admin" | "admin_ops" | "admin_support" | "admin_review";
  is_active: boolean;
  created_at: string;
  profiles: { first_name: string | null; last_name: string | null } | null;
};

type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  is_public: boolean;
  is_moderated: boolean;
  created_at: string;
  providers: { display_name: string | null } | null;
};

type AuditEventItem = {
  id: string;
  action: string;
  entity: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type Props = {
  canManageAdmins: boolean;
  canReviewProviders: boolean;
};

const requestStatusOptions = ["new", "reviewing", "contacted", "closed"] as const;
const providerWorkflowOptions = ["draft", "submitted", "pending_review", "approved", "rejected", "needs_info", "suspended"] as const;

const requestStatusLabels: Record<(typeof requestStatusOptions)[number], string> = {
  new: "Nouvelle",
  reviewing: "En analyse",
  contacted: "Contactee",
  closed: "Cloturee",
};

const providerStatusLabels: Record<(typeof providerWorkflowOptions)[number], string> = {
  draft: "Brouillon",
  submitted: "Soumis",
  pending_review: "En attente",
  approved: "Approuve",
  rejected: "Refuse",
  needs_info: "Infos complementaires",
  suspended: "Suspendu",
};

export function AdminConsole({ canManageAdmins, canReviewProviders }: Props) {
  const [requests, setRequests] = useState<ServiceRequestItem[]>([]);
  const [providers, setProviders] = useState<ProviderApplicationItem[]>([]);
  const [admins, setAdmins] = useState<AdminAccountItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEventItem[]>([]);
  const [providerNotes, setProviderNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [requestFilter, setRequestFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [requestSearch, setRequestSearch] = useState("");

  const [adminEmail, setAdminEmail] = useState("");
  const [adminScope, setAdminScope] = useState<AdminAccountItem["scope"]>("admin_support");
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [savingProviderId, setSavingProviderId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [requestsRes, providersRes, adminsRes, reviewsRes, auditRes] = await Promise.all([
        fetch("/api/admin/service-requests"),
        fetch("/api/admin/provider-applications"),
        canManageAdmins ? fetch("/api/admin/admin-accounts") : Promise.resolve(null),
        fetch("/api/admin/reviews"),
        fetch("/api/admin/audit-events?limit=40"),
      ]);

      const requestsJson = await requestsRes.json();
      const providersJson = await providersRes.json();
      const adminsJson = adminsRes ? await adminsRes.json() : { data: [] };
      const reviewsJson = await reviewsRes.json();
      const auditJson = await auditRes.json();

      if (!requestsRes.ok) throw new Error(requestsJson.message ?? "Impossible de charger les demandes.");
      if (!providersRes.ok) throw new Error(providersJson.message ?? "Impossible de charger les dossiers prestataires.");
      if (!reviewsRes.ok) throw new Error(reviewsJson.message ?? "Impossible de charger les avis.");

      setRequests(requestsJson.data ?? []);
      setProviders(providersJson.data ?? []);
      setAdmins(adminsJson.data ?? []);
      setReviews(reviewsJson.data ?? []);
      setAuditEvents(auditJson.data ?? []);
      setProviderNotes(
        Object.fromEntries((providersJson.data ?? []).map((item: ProviderApplicationItem) => [item.id, item.admin_note ?? ""])),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, [canManageAdmins]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const statusOk = requestFilter === "all" ? true : item.status === requestFilter;
      const q = requestSearch.trim().toLowerCase();
      const searchOk =
        q.length === 0
          ? true
          : `${item.first_name} ${item.last_name} ${item.email} ${item.category}`.toLowerCase().includes(q);
      return statusOk && searchOk;
    });
  }, [requests, requestFilter, requestSearch]);

  const filteredProviders = useMemo(() => {
    return providers.filter((item) => (providerFilter === "all" ? true : item.workflow_status === providerFilter));
  }, [providers, providerFilter]);

  const filteredReviews = useMemo(() => {
    if (reviewFilter === "all") return reviews;
    if (reviewFilter === "public") return reviews.filter((item) => item.is_public);
    if (reviewFilter === "hidden") return reviews.filter((item) => !item.is_public);
    if (reviewFilter === "unmoderated") return reviews.filter((item) => !item.is_moderated);
    return reviews;
  }, [reviews, reviewFilter]);

  const metrics = useMemo(() => {
    return {
      newRequests: requests.filter((item) => item.status === "new").length,
      providerPending: providers.filter((item) => item.workflow_status === "pending_review").length,
      reviewsToModerate: reviews.filter((item) => !item.is_moderated).length,
      adminsActive: admins.filter((item) => item.is_active).length,
    };
  }, [requests, providers, reviews, admins]);

  async function updateRequestStatus(id: string, status: ServiceRequestItem["status"]) {
    await fetch(`/api/admin/service-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function updateProviderStatus(id: string, workflowStatus: ProviderApplicationItem["workflow_status"], adminNote?: string) {
    setSavingProviderId(id);
    await fetch(`/api/admin/provider-applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflowStatus, adminNote }),
    });
    setSavingProviderId(null);
    await load();
  }

  async function openProviderDoc(id: string, kind: "identity" | "residence") {
    const response = await fetch(`/api/admin/provider-applications/${id}/document?kind=${kind}`);
    const data = await response.json();
    if (response.ok && data.url) {
      window.open(data.url, "_blank", "noopener,noreferrer");
    }
  }

  async function createAdmin() {
    if (!adminEmail) return;
    setAdminActionLoading(true);
    const response = await fetch("/api/admin/admin-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, scope: adminScope, isActive: true }),
    });
    setAdminActionLoading(false);
    if (response.ok) {
      setAdminEmail("");
      await load();
    }
  }

  async function patchAdmin(profileId: string, payload: { scope?: AdminAccountItem["scope"]; isActive?: boolean }) {
    await fetch(`/api/admin/admin-accounts/${profileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await load();
  }

  async function moderateReview(id: string, payload: { isPublic?: boolean; isModerated?: boolean }) {
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await load();
  }

  if (loading) {
    return <Card className="rounded-2xl border-slate-200 bg-white p-5">Chargement du backoffice...</Card>;
  }

  return (
    <div className="space-y-6">
      {error ? <Card className="rounded-2xl border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</Card> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Demandes nouvelles</p>
          <p className="text-3xl font-bold text-slate-900">{metrics.newRequests}</p>
        </Card>
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Prestataires en attente</p>
          <p className="text-3xl font-bold text-slate-900">{metrics.providerPending}</p>
        </Card>
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Avis a moderer</p>
          <p className="text-3xl font-bold text-slate-900">{metrics.reviewsToModerate}</p>
        </Card>
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Admins actifs</p>
          <p className="text-3xl font-bold text-slate-900">{metrics.adminsActive}</p>
        </Card>
      </div>

      <Card className="premium-card p-5">
        <h2 className="text-lg font-semibold text-slate-900">Demandes clients</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input value={requestSearch} onChange={(e) => setRequestSearch(e.target.value)} placeholder="Rechercher client / email / categorie" />
          <Select value={requestFilter} onValueChange={(value) => value && setRequestFilter(value)}>
            <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              {requestStatusOptions.map((status) => (
                <SelectItem key={status} value={status}>{requestStatusLabels[status]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4 space-y-3">
          {filteredRequests.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.first_name} {item.last_name} - {item.category}</p>
                  <p className="text-sm text-slate-600">{item.email} - {item.city} - {new Date(item.created_at).toLocaleString("fr-CH")}</p>
                  <p className="mt-1 text-sm text-slate-700">{item.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {requestStatusOptions.map((status) => (
                    <Button key={status} size="sm" variant={item.status === status ? "default" : "outline"} onClick={() => updateRequestStatus(item.id, status)}>
                      {requestStatusLabels[status]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {filteredRequests.length === 0 ? <p className="text-sm text-slate-500">Aucune demande pour ce filtre.</p> : null}
        </div>
      </Card>

      <Card className="premium-card p-5">
        <h2 className="text-lg font-semibold text-slate-900">Dossiers prestataires</h2>
        <div className="mt-3">
          <Select value={providerFilter} onValueChange={(value) => value && setProviderFilter(value)}>
            <SelectTrigger className="h-10 w-full max-w-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous workflows</SelectItem>
              {providerWorkflowOptions.map((status) => (
                <SelectItem key={status} value={status}>{providerStatusLabels[status]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 space-y-3">
          {filteredProviders.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 p-3">
              <p className="font-semibold text-slate-900">{(item.first_name ?? "")} {(item.last_name ?? "")} - {item.business_name}</p>
              <p className="text-sm text-slate-600">{item.city}{item.canton ? ` (${item.canton})` : ""} - {item.category} - statut: {providerStatusLabels[item.workflow_status]}</p>
              {canReviewProviders ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.id_document_path ? (
                    <Button size="sm" variant="outline" onClick={() => openProviderDoc(item.id, "identity")}>Voir piece identite</Button>
                  ) : null}
                  {item.residence_permit_path ? (
                    <Button size="sm" variant="outline" onClick={() => openProviderDoc(item.id, "residence")}>Voir titre sejour</Button>
                  ) : null}
                </div>
              ) : null}
              {canReviewProviders ? (
                <div className="mt-3 space-y-2">
                  <Textarea
                    value={providerNotes[item.id] ?? ""}
                    placeholder="Note admin interne"
                    onChange={(event) => setProviderNotes((prev) => ({ ...prev, [item.id]: event.target.value }))}
                  />
                  <div className="flex flex-wrap gap-2">
                    {providerWorkflowOptions.map((status) => (
                      <Button key={status} size="sm" variant={item.workflow_status === status ? "default" : "outline"} onClick={() => updateProviderStatus(item.id, status, providerNotes[item.id] ?? "")}>
                        {providerStatusLabels[status]}
                      </Button>
                    ))}
                    <Button size="sm" variant="secondary" disabled={savingProviderId === item.id} onClick={() => updateProviderStatus(item.id, item.workflow_status, providerNotes[item.id] ?? "")}>
                      {savingProviderId === item.id ? "Sauvegarde..." : "Sauvegarder note"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
          {filteredProviders.length === 0 ? <p className="text-sm text-slate-500">Aucun dossier pour ce filtre.</p> : null}
        </div>
      </Card>

      <Card className="premium-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Moderation des avis</h2>
          <Select value={reviewFilter} onValueChange={(value) => value && setReviewFilter(value)}>
            <SelectTrigger className="h-10 w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les avis</SelectItem>
              <SelectItem value="public">Publics</SelectItem>
              <SelectItem value="hidden">Masques</SelectItem>
              <SelectItem value="unmoderated">Non moderes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {!canReviewProviders ? (
          <p className="mt-2 text-sm text-slate-500">Votre role permet la lecture des avis, pas la moderation.</p>
        ) : null}
        <div className="mt-4 space-y-3">
          {filteredReviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-slate-200 p-3">
              <p className="font-semibold text-slate-900">{review.providers?.display_name ?? "Prestataire"} - {review.rating}/5</p>
              <p className="mt-1 text-sm text-slate-700">{review.comment || "Sans commentaire"}</p>
              <p className="mt-1 text-xs text-slate-500">{new Date(review.created_at).toLocaleString("fr-CH")} - {review.is_public ? "Public" : "Masque"} - {review.is_moderated ? "Modere" : "A moderer"}</p>
              {canReviewProviders ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => moderateReview(review.id, { isPublic: !review.is_public, isModerated: true })}>
                    {review.is_public ? "Masquer" : "Rendre public"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => moderateReview(review.id, { isModerated: true })}>
                    Marquer comme modere
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
          {filteredReviews.length === 0 ? <p className="text-sm text-slate-500">Aucun avis a afficher.</p> : null}
        </div>
      </Card>

      {canManageAdmins ? (
        <Card className="premium-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Gestion des administrateurs</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_220px_120px]">
            <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="email admin a promouvoir" />
            <Select value={adminScope} onValueChange={(value) => setAdminScope(value as AdminAccountItem["scope"])}>
              <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">super_admin</SelectItem>
                <SelectItem value="admin_ops">admin_ops</SelectItem>
                <SelectItem value="admin_support">admin_support</SelectItem>
                <SelectItem value="admin_review">admin_review</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={createAdmin} disabled={adminActionLoading}>{adminActionLoading ? "..." : "Ajouter"}</Button>
          </div>
          <div className="mt-4 space-y-2">
            {admins.map((item) => (
              <div key={item.profile_id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3">
                <p className="text-sm text-slate-700">
                  {(item.profiles?.first_name ?? "")} {(item.profiles?.last_name ?? "")} - {item.scope}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => patchAdmin(item.profile_id, { isActive: !item.is_active })}>
                    {item.is_active ? "Desactiver" : "Reactiver"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="premium-card p-5">
        <h2 className="text-lg font-semibold text-slate-900">Journal d'actions admin</h2>
        <div className="mt-3 space-y-2">
          {auditEvents.map((event) => (
            <div key={event.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <p className="font-medium">{event.action} - {event.entity}</p>
              <p className="text-xs text-slate-500">{new Date(event.created_at).toLocaleString("fr-CH")} {event.entity_id ? `- #${event.entity_id.slice(0, 8)}` : ""}</p>
            </div>
          ))}
          {auditEvents.length === 0 ? <p className="text-sm text-slate-500">Aucun evenement recent.</p> : null}
        </div>
      </Card>
    </div>
  );
}
