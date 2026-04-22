"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type AdminScope = "super_admin" | "admin_ops" | "admin_support" | "admin_review";
type AdminAccount = {
  profile_id: string;
  scope: AdminScope;
  is_active: boolean;
  created_at: string;
  profiles: { first_name: string | null; last_name: string | null } | null;
};

export function AdminsPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AdminAccount[]>([]);
  const [email, setEmail] = useState("");
  const [scope, setScope] = useState<AdminScope>("admin_support");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/admin-accounts");
      const payload = (await response.json()) as { success?: boolean; data?: AdminAccount[]; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Impossible de charger les administrateurs.");
      }
      setItems(payload.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }

  async function createAdmin() {
    if (!email.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/admin-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), scope, isActive: true }),
      });
      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Creation impossible.");
      }
      setEmail("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de creation.");
    } finally {
      setCreating(false);
    }
  }

  async function updateAdmin(profileId: string, patch: { scope?: AdminScope; isActive?: boolean }) {
    const response = await fetch(`/api/admin/admin-accounts/${profileId}`, {
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
      <h2 className="text-lg font-semibold text-slate-900">Gestion des admins</h2>
      <p className="mt-1 text-sm text-slate-600">Seul le super admin peut creer, suspendre ou modifier les scopes.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_120px]">
        <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email admin a promouvoir" />
        <Select value={scope} onValueChange={(value) => setScope(value as AdminScope)}>
          <SelectTrigger className="h-10 w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="super_admin">super_admin</SelectItem>
            <SelectItem value="admin_ops">admin_ops</SelectItem>
            <SelectItem value="admin_support">admin_support</SelectItem>
            <SelectItem value="admin_review">admin_review</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={createAdmin} disabled={creating}>{creating ? "..." : "Ajouter"}</Button>
      </div>

      {error ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="mt-3 text-sm text-slate-500">Chargement...</p> : null}

      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.profile_id} className="rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{item.profiles?.first_name ?? ""} {item.profiles?.last_name ?? ""}</p>
                <p>Scope: {item.scope} - {item.is_active ? "actif" : "inactif"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={item.scope} onValueChange={(value) => updateAdmin(item.profile_id, { scope: value as AdminScope })}>
                  <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">super_admin</SelectItem>
                    <SelectItem value="admin_ops">admin_ops</SelectItem>
                    <SelectItem value="admin_support">admin_support</SelectItem>
                    <SelectItem value="admin_review">admin_review</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={() => updateAdmin(item.profile_id, { isActive: !item.is_active })}>
                  {item.is_active ? "Desactiver" : "Reactiver"}
                </Button>
              </div>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 ? <p className="text-sm text-slate-500">Aucun admin configure.</p> : null}
      </div>
    </Card>
  );
}
