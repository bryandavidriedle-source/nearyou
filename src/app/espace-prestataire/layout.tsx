import Link from "next/link";
import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Container } from "@/components/shared/container";
import { Card } from "@/components/ui/card";
import { requireProviderAccess } from "@/lib/auth";
import { providerWorkflowLabels } from "@/lib/workflow";

const providerNav = [
  { href: "/espace-prestataire", label: "Dashboard" },
  { href: "/espace-prestataire/missions", label: "Missions" },
  { href: "/espace-prestataire/revenus", label: "Revenus" },
  { href: "/espace-prestataire/avis", label: "Avis" },
  { href: "/espace-prestataire/competences", label: "Compétences" },
  { href: "/espace-prestataire/banque", label: "Banque" },
  { href: "/espace-prestataire/verifications", label: "Vérifications" },
  { href: "/espace-prestataire/profil", label: "Profil" },
  { href: "/espace-prestataire/disponibilites", label: "Disponibilités" },
  { href: "/espace-prestataire/documents", label: "Documents" },
];

export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireProviderAccess();

  if (!auth.providerApplication && auth.role !== "provider") {
    redirect("/devenir-prestataire");
  }

  const workflowStatus = auth.providerApplication?.workflow_status;

  return (
    <section className="py-8 sm:py-10">
      <Container className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Espace prestataire</h1>
            <p className="text-sm text-slate-600">
              {auth.profile?.first_name ?? "Prestataire"} {auth.profile?.last_name ?? ""}
            </p>
          </div>
          <SignOutButton />
        </div>

        {workflowStatus ? (
          <Card className="rounded-2xl border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
            Statut dossier: <span className="font-semibold">{providerWorkflowLabels[workflowStatus] ?? workflowStatus}</span>
            {auth.isSuspended ? " - Votre compte est temporairement suspendu. Contactez le support PrèsDeToi." : ""}
          </Card>
        ) : (
          <Card className="rounded-2xl border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
            Votre dossier n'est pas encore complet. Finalisez votre profil et vos documents pour lancer la validation.
          </Card>
        )}

        <nav className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2">
          {providerNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {children}
      </Container>
    </section>
  );
}
