import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ReserveIndexPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-5">
        <h1 className="text-3xl font-bold text-slate-900">Réserver un service</h1>
        <p className="text-slate-600">
          Choisissez un prestataire validé, un créneau et confirmez votre demande en toute sécurité.
        </p>

        <Card className="premium-card p-5 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Parcours recommandé</p>
          <ol className="mt-2 space-y-1">
            <li>1. Choisissez une catégorie et un prestataire.</li>
            <li>2. Définissez date, créneau et détails d'intervention.</li>
            <li>3. Connectez-vous uniquement au moment final pour confirmer et payer.</li>
          </ol>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-xl bg-green-600 hover:bg-green-700">
            <Link href="/catalogue">Voir le catalogue</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-blue-200 text-blue-700">
            <Link href="/trouver-un-prestataire">Faire une demande</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
