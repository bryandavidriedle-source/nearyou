import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Container } from "@/components/shared/container";
import { requireRole } from "@/lib/auth";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  await requireRole("customer");

  return (
    <>
      <div className="border-b border-slate-100 bg-white">
        <Container className="flex flex-wrap items-center justify-between gap-2 py-4">
          <div className="flex flex-wrap gap-2">
            <Link href="/espace-client" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Tableau de bord
            </Link>
            <Link href="/espace-client/prestations" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Prestations
            </Link>
            <Link href="/espace-client/factures" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Factures
            </Link>
            <Link href="/espace-client/paiements" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Paiements
            </Link>
            <Link href="/espace-client/profil" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Profil
            </Link>
            <Link href="/espace-client/securite" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Securite
            </Link>
            <Link href="/trouver-un-prestataire" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Nouvelle demande
            </Link>
          </div>
          <SignOutButton />
        </Container>
      </div>
      {children}
    </>
  );
}
