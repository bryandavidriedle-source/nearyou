import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Container } from "@/components/shared/container";
import { Card } from "@/components/ui/card";
import { type AdminScope, requireAdminScopes } from "@/lib/auth";

const adminNav = [
  { href: "/admin", label: "Dashboard", scopes: ["super_admin", "admin_ops", "admin_support", "admin_review"] as AdminScope[] },
  { href: "/admin/prestataires", label: "Prestataires", scopes: ["super_admin", "admin_ops", "admin_review"] as AdminScope[] },
  { href: "/admin/clients", label: "Clients", scopes: ["super_admin", "admin_ops", "admin_support"] as AdminScope[] },
  { href: "/admin/demandes", label: "Demandes", scopes: ["super_admin", "admin_ops", "admin_support", "admin_review"] as AdminScope[] },
  { href: "/admin/admins", label: "Admins", scopes: ["super_admin"] as AdminScope[] },
  { href: "/admin/categories", label: "Categories", scopes: ["super_admin", "admin_ops"] as AdminScope[] },
  { href: "/admin/avis", label: "Avis", scopes: ["super_admin", "admin_review", "admin_support"] as AdminScope[] },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireAdminScopes(["super_admin", "admin_ops", "admin_support", "admin_review"]);
  const visibleNav = adminNav.filter((item) => auth.adminScope && item.scopes.includes(auth.adminScope));

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

