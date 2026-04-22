import Link from "next/link";

import { Card } from "@/components/ui/card";
import { requireAdminScopes } from "@/lib/auth";

export default async function BackofficeSettingsPage() {
  await requireAdminScopes(["super_admin", "admin_ops"]);

  return (
    <div className="space-y-4">
      <Card className="premium-card p-5">
        <h2 className="text-lg font-semibold text-slate-900">Parametres backoffice</h2>
        <p className="mt-2 text-sm text-slate-600">
          Cette section centralise les points sensibles: gestion des admins, categories de service, et parametres operationnels.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/admins" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Gerer les admins
          </Link>
          <Link href="/admin/categories" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Gerer les services
          </Link>
          <Link href="/admin/avis" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Moderation avis
          </Link>
        </div>
      </Card>
    </div>
  );
}
