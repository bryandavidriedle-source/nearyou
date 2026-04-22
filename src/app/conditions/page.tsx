import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Card } from "@/components/ui/card";

export default function ConditionsHubPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">Conditions NearYou</h1>
        <p className="text-sm text-slate-600">
          Cadre legal et operationnel pour les clients et prestataires en Suisse.
        </p>

        <div className="grid gap-3">
          <Card className="premium-card p-4">
            <h2 className="text-lg font-semibold text-slate-900">Conditions d&apos;utilisation</h2>
            <p className="mt-1 text-sm text-slate-600">Regles de la plateforme d&apos;intermediation et usage client.</p>
            <Link href="/conditions-utilisation" className="mt-2 inline-flex text-sm font-semibold text-blue-700 hover:underline">
              Ouvrir les conditions d&apos;utilisation
            </Link>
          </Card>
          <Card className="premium-card p-4">
            <h2 className="text-lg font-semibold text-slate-900">Conditions prestataires</h2>
            <p className="mt-1 text-sm text-slate-600">Validation manuelle, age minimum 16 ans, responsabilites et paiements.</p>
            <Link href="/conditions-prestataires" className="mt-2 inline-flex text-sm font-semibold text-blue-700 hover:underline">
              Ouvrir les conditions prestataires
            </Link>
          </Card>
          <Card className="premium-card p-4">
            <h2 className="text-lg font-semibold text-slate-900">Protection des donnees</h2>
            <p className="mt-1 text-sm text-slate-600">Confidentialite, cookies et mentions legales.</p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              <Link href="/politique-confidentialite" className="font-semibold text-blue-700 hover:underline">Confidentialite</Link>
              <Link href="/politique-cookies" className="font-semibold text-blue-700 hover:underline">Cookies</Link>
              <Link href="/mentions-legales" className="font-semibold text-blue-700 hover:underline">Mentions legales</Link>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
