import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";

export default async function ClientSecurityPage() {
  await requireRole("customer");

  return (
    <section className="py-8">
      <Container className="max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Securite du compte</h1>

        <Card className="premium-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Mot de passe</h2>
          <p className="mt-2 text-sm text-slate-700">
            Utilisez un mot de passe unique et long. En cas de doute, reinitialisez-le immediatement.
          </p>
          <Link href="/reinitialiser-mot-de-passe" className="mt-3 inline-flex text-sm font-semibold text-blue-700 hover:underline">
            Reinitialiser mon mot de passe
          </Link>
        </Card>

        <Card className="premium-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Protection renforcee</h2>
          <p className="mt-2 text-sm text-slate-700">
            PrèsDeToi est structure pour accueillir une verification multi-facteur (2FA) lors du renforcement de securite.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Conseil: verifiez regulierement vos informations de contact pour recuperer facilement votre compte.
          </p>
        </Card>
      </Container>
    </section>
  );
}

