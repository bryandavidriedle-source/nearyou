import Link from "next/link";

import { Card } from "@/components/ui/card";
import { getAdminDashboardData } from "@/lib/db";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminDashboardPage() {
  const dashboard = await getAdminDashboardData();
  const supabase = getSupabaseAdminClient();

  const [auditRes, providerReviewRes, requestTodayRes] = await Promise.all([
    supabase
      .from("admin_audit_events")
      .select("id, action, entity, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("provider_applications")
      .select("id", { count: "exact", head: true })
      .in("workflow_status", ["submitted", "pending_review", "needs_info"]),
    supabase
      .from("service_requests")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ]);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Demandes totales</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{dashboard.kpis.totalRequests}</p>
        </Card>
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Demandes du jour</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{requestTodayRes.count ?? 0}</p>
        </Card>
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Prestataires en attente</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{providerReviewRes.count ?? dashboard.kpis.providerPending}</p>
        </Card>
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Prestataires actifs</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{dashboard.kpis.providers}</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="premium-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Actions prioritaires</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>1. Traiter les dossiers prestataires en attente de validation.</li>
            <li>2. Assigner rapidement les demandes urgentes aux prestataires verifies.</li>
            <li>3. Controler les avis signales et les documents a revalider.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/admin/prestataires" className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
              Ouvrir validation prestataires
            </Link>
            <Link href="/admin/demandes" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Ouvrir demandes
            </Link>
          </div>
        </Card>

        <Card className="premium-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Top categories</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            {dashboard.byCategory.slice(0, 8).map((item) => (
              <div key={item.category} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                <span>{item.category}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="premium-card p-5">
        <h2 className="text-lg font-semibold text-slate-900">Journal recent</h2>
        <div className="mt-3 space-y-2">
          {(auditRes.data ?? []).map((event) => (
            <div key={event.id} className="rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-700">
              <p className="font-medium">{event.action} - {event.entity}</p>
              <p className="text-xs text-slate-500">{new Date(event.created_at).toLocaleString("fr-CH")}</p>
            </div>
          ))}
          {(auditRes.data ?? []).length === 0 ? <p className="text-sm text-slate-500">Aucun evenement recent.</p> : null}
        </div>
      </Card>
    </div>
  );
}
