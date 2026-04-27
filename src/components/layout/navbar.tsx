import Link from "next/link";

import { getAuthContext, resolveAuthenticatedHomePath } from "@/lib/auth";
import { getCurrentLanguage } from "@/lib/i18n-server";
import { getDesktopPrimaryNav, resolveNavigationRole } from "@/lib/navigation";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LanguageTabs } from "@/components/layout/language-tabs";
import { UserMenu } from "@/components/auth/user-menu";

export async function Navbar() {
  const lang = await getCurrentLanguage();
  const auth = await getAuthContext();
  const dashboardHref = auth.user ? await resolveAuthenticatedHomePath() : null;
  const navRole = resolveNavigationRole({
    isAuthenticated: Boolean(auth.user),
    dashboardPath: dashboardHref,
  });

  const navItems = getDesktopPrimaryNav(navRole);
  const statusLabel = auth.user
    ? navRole === "admin"
      ? "Admin"
      : navRole === "provider"
        ? auth.role === "provider" || auth.providerWorkflowStatus === "approved"
          ? "Prestataire validé"
          : "Prestataire en attente"
        : "Client"
    : null;

  const userMenuItems =
    navRole === "admin"
      ? [
          { href: "/admin", label: "Dashboard admin" },
          { href: "/admin/prestataires", label: "Validation prestataires" },
          { href: "/admin/admins", label: "Paramètres" },
        ]
      : navRole === "provider"
        ? [
            { href: "/espace-prestataire", label: "Dashboard prestataire" },
            { href: "/espace-prestataire/missions", label: "Mes missions" },
            { href: "/espace-prestataire/profil", label: "Mon profil" },
          ]
        : [
            { href: "/espace-client", label: "Mon compte" },
            { href: "/espace-client/prestations", label: "Mes réservations" },
            { href: "/espace-client/securite", label: "Sécurité" },
          ];

  return (
    <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 backdrop-blur">
      <Container className="flex h-18 items-center justify-between gap-4 py-2">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
          <span className="grid h-9 w-9 place-content-center rounded-xl bg-blue-700 text-white">P</span>
          PrèsDeToi
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-slate-600 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-slate-900">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden xl:block">
          <LanguageTabs current={lang} />
        </div>
        <div className="flex items-center gap-2">
          {statusLabel ? (
            <Badge className="hidden bg-blue-100 text-blue-700 hover:bg-blue-100 md:inline-flex">{statusLabel}</Badge>
          ) : null}
          {auth.user ? (
            <>
              <Button asChild className="rounded-xl bg-green-600 hover:bg-green-700">
                <Link href="/demande">Décrire mon besoin</Link>
              </Button>
              <UserMenu
                firstName={auth.profile?.first_name ?? null}
                lastName={auth.profile?.last_name ?? null}
                email={auth.user.email ?? null}
                avatarUrl={auth.profile?.avatar_url ?? null}
                statusLabel={statusLabel ?? "Compte"}
                items={userMenuItems}
              />
            </>
          ) : (
            <>
              <Button asChild variant="outline" className="hidden rounded-xl border-blue-200 sm:inline-flex">
                <Link href="/connexion">Connexion</Link>
              </Button>
              <Button asChild className="rounded-xl bg-green-600 hover:bg-green-700">
                <Link href="/demande">Décrire mon besoin</Link>
              </Button>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}

