import type { Metadata } from "next";

import { AdminConsole } from "@/components/admin/admin-console";
import { Container } from "@/components/shared/container";
import { Card } from "@/components/ui/card";
import { requireAdminScopes } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/db";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "NearYou Admin dashboard",
  description: "Backoffice administrateur: KPI, demandes, prestataires et rôles.",
  path: "/admin",
});

export default async function AdminPage() {
  const auth = await requireAdminScopes(["super_admin", "admin_ops", "admin_support", "admin_review"]);
  const dashboard = await getAdminDashboardData();

  const canManageAdmins = auth.adminScope === "super_admin";
  const canReviewProviders = auth.adminScope === "super_admin" || auth.adminScope === "admin_review";

  return (
    <section className="py-12">
      <Container className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard administrateur</h1>
          <p className="text-sm text-slate-600">
            Rôle actif: <span className="font-semibold">{auth.adminScope}</span>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Demandes total</p>
            <p className="text-3xl font-bold">{dashboard.kpis.totalRequests}</p>
          </Card>
          <Card className="rounded-2xl border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Nouvelles</p>
            <p className="text-3xl font-bold">{dashboard.kpis.newRequests}</p>
          </Card>
          <Card className="rounded-2xl border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">En cours</p>
            <p className="text-3xl font-bold">{dashboard.kpis.inProgressRequests}</p>
          </Card>
          <Card className="rounded-2xl border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Terminées</p>
            <p className="text-3xl font-bold">{dashboard.kpis.completedRequests}</p>
          </Card>
          <Card className="rounded-2xl border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Clôturées</p>
            <p className="text-3xl font-bold">{dashboard.kpis.cancelledRequests}</p>
          </Card>
          <Card className="rounded-2xl border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Clients inscrits</p>
            <p className="text-3xl font-bold">{dashboard.kpis.users}</p>
          </Card>
          <Card className="rounded-2xl border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Prestataires</p>
            <p className="text-3xl font-bold">{dashboard.kpis.providers}</p>
          </Card>
          <Card className="rounded-2xl border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">En attente validation</p>
            <p className="text-3xl font-bold">{dashboard.kpis.providerPending}</p>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-2xl border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Volume demandes</p>
            <p className="mt-1 text-sm text-slate-600">7 jours: {dashboard.volume.last7Days}</p>
            <p className="text-sm text-slate-600">30 jours: {dashboard.volume.last30Days}</p>
          </Card>
          <Card className="rounded-2xl border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Top catégories</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {dashboard.byCategory.slice(0, 6).map((item) => (
                <li key={item.category}>{item.category}: {item.count}</li>
              ))}
            </ul>
          </Card>
        </div>

        <AdminConsole canManageAdmins={canManageAdmins} canReviewProviders={canReviewProviders} />
      </Container>
    </section>
  );
}
