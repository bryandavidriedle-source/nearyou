import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Container } from "@/components/shared/container";
import { Card } from "@/components/ui/card";
import { type AdminScope, requireAdminScopes } from "@/lib/auth";

const backofficeNav = [
  { href: "/backoffice", label: "Dashboard", scopes: ["super_admin", "admin_ops", "admin_support", "admin_review"] as AdminScope[] },
  { href: "/backoffice/kpi", label: "KPI", scopes: ["super_admin", "admin_ops", "admin_support", "admin_review"] as AdminScope[] },
  { href: "/backoffice/prestataires", label: "Prestataires", scopes: ["super_admin", "admin_ops", "admin_review"] as AdminScope[] },
  { href: "/backoffice/utilisateurs", label: "Utilisateurs", scopes: ["super_admin", "admin_ops", "admin_support"] as AdminScope[] },
  { href: "/backoffice/demandes", label: "Demandes", scopes: ["super_admin", "admin_ops", "admin_support", "admin_review"] as AdminScope[] },
  { href: "/backoffice/paiements", label: "Paiements", scopes: ["super_admin", "admin_ops"] as AdminScope[] },
  { href: "/backoffice/avis", label: "Avis", scopes: ["super_admin", "admin_review", "admin_support"] as AdminScope[] },
  { href: "/backoffice/settings", label: "Settings", scopes: ["super_admin", "admin_ops"] as AdminScope[] },
];

export default async function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAdminScopes(["super_admin", "admin_ops", "admin_support", "admin_review"]);
  const visibleNav = backofficeNav.filter((item) => auth.adminScope && item.scopes.includes(auth.adminScope));

  return (
    <section className="py-8 sm:py-10">
      <Container className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Backoffice PrèsDeToi</h1>
            <p className="text-sm text-slate-600">
              Role actif: <span className="font-semibold">{auth.adminScope}</span>
            </p>
          </div>
          <SignOutButton />
        </div>

        <Card className="rounded-2xl border-slate-200 bg-white p-2">
          <nav className="flex flex-wrap gap-2">
            {visibleNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </Card>

        {children}
      </Container>
    </section>
  );
}

