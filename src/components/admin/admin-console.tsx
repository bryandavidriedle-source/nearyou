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
  workflow_status: "draft" | "submitted" | "pending_review" | "approved" | "rejected" | "needs_info";
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

type Props = {
  canManageAdmins: boolean;
  canReviewProviders: boolean;
};

const requestStatusOptions = ["new", "reviewing", "contacted", "closed"] as const;
const providerWorkflowOptions = ["draft", "submitted", "pending_review", "approved", "rejected", "needs_info"] as const;

export function AdminConsole({ canManageAdmins, canReviewProviders }: Props) {
  const [requests, setRequests] = useState<ServiceRequestItem[]>([]);
  const [providers, setProviders] = useState<ProviderApplicationItem[]>([]);
  const [admins, setAdmins] = useState<AdminAccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [requestFilter, setRequestFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [requestSearch, setRequestSearch] = useState("");

  const [adminEmail, setAdminEmail] = useState("");
  const [adminScope, setAdminScope] = useState<AdminAccountItem["scope"]>("admin_support");
  const [adminActionLoading, setAdminActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [requestsRes, providersRes, adminsRes] = await Promise.all([
        fetch("/api/admin/service-requests"),
        fetch("/api/admin/provider-applications"),
        canManageAdmins ? fetch("/api/admin/admin-accounts") : Promise.resolve(null),
      ]);

      const requestsJson = await requestsRes.json();
      const providersJson = await providersRes.json();
      const adminsJson = adminsRes ? await adminsRes.json() : { data: [] };

      if (!requestsRes.ok) throw new Error(requestsJson.message ?? "Impossible de charger les demandes.");
      if (!providersRes.ok) throw new Error(providersJson.message ?? "Impossible de charger les dossiers prestataires.");

      setRequests(requestsJson.data ?? []);
      setProviders(providersJson.data ?? []);
      setAdmins(adminsJson.data ?? []);
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

  async function updateRequestStatus(id: string, status: ServiceRequestItem["status"]) {
    await fetch(`/api/admin/service-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function updateProviderStatus(id: string, workflowStatus: ProviderApplicationItem["workflow_status"], adminNote = "") {
    await fetch(`/api/admin/provider-applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflowStatus, adminNote }),
    });
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

  if (loading) {
    return <Card className="rounded-2xl border-slate-200 bg-white p-5">Chargement du backoffice...</Card>;
  }

  return (
    <div className="space-y-6">
      {error ? <Card className="rounded-2xl border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</Card> : null}

      <Card className="rounded-2xl border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Demandes clients</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input value={requestSearch} onChange={(e) => setRequestSearch(e.target.value)} placeholder="Rechercher client / email / catégorie" />
          <Select value={requestFilter} onValueChange={(value) => value && setRequestFilter(value)}>
            <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              {requestStatusOptions.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4 space-y-3">
          {filteredRequests.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.first_name} {item.last_name} · {item.category}</p>
                  <p className="text-sm text-slate-600">{item.email} · {item.city} · {new Date(item.created_at).toLocaleString("fr-CH")}</p>
                  <p className="mt-1 text-sm text-slate-700">{item.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {requestStatusOptions.map((status) => (
                    <Button key={status} size="sm" variant={item.status === status ? "default" : "outline"} onClick={() => updateRequestStatus(item.id, status)}>
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-2xl border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Dossiers prestataires</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Select value={providerFilter} onValueChange={(value) => value && setProviderFilter(value)}>
            <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous workflows</SelectItem>
              {providerWorkflowOptions.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 space-y-3">
          {filteredProviders.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 p-3">
              <p className="font-semibold text-slate-900">
                {(item.first_name ?? "")} {(item.last_name ?? "")} · {item.business_name}
              </p>
              <p className="text-sm text-slate-600">
                {item.city}{item.canton ? ` (${item.canton})` : ""} · {item.category} · statut: {item.workflow_status}
              </p>
              {canReviewProviders ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.id_document_path ? (
                    <Button size="sm" variant="outline" onClick={() => openProviderDoc(item.id, "identity")}>
                      Voir pièce d'identité
                    </Button>
                  ) : null}
                  {item.residence_permit_path ? (
                    <Button size="sm" variant="outline" onClick={() => openProviderDoc(item.id, "residence")}>
                      Voir titre de séjour
                    </Button>
                  ) : null}
                </div>
              ) : null}
              {canReviewProviders ? (
                <div className="mt-3 space-y-2">
                  <Textarea
                    defaultValue={item.admin_note ?? ""}
                    placeholder="Note admin interne"
                    onBlur={(event) => updateProviderStatus(item.id, item.workflow_status, event.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    {providerWorkflowOptions.map((status) => (
                      <Button key={status} size="sm" variant={item.workflow_status === status ? "default" : "outline"} onClick={() => updateProviderStatus(item.id, status)}>
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      {canManageAdmins ? (
        <Card className="rounded-2xl border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Gestion des administrateurs</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_220px_120px]">
            <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="email admin à promouvoir" />
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
                  {(item.profiles?.first_name ?? "")} {(item.profiles?.last_name ?? "")} · {item.scope}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => patchAdmin(item.profile_id, { isActive: !item.is_active })}>
                    {item.is_active ? "Désactiver" : "Réactiver"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
