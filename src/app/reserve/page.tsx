import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ReserveIndexPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-5">
        <h1 className="text-3xl font-bold text-slate-900">Réservation NearYou</h1>
        <p className="text-slate-600">
          Sélectionnez un prestataire depuis l'accueil pour ouvrir un formulaire de réservation fiable et complet.
        </p>

        <Card className="premium-card p-5 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Parcours recommandé</p>
          <ol className="mt-2 space-y-1">
            <li>1. Choisissez un service et un prestataire sur la carte.</li>
            <li>2. Définissez date, créneau et coordonnées de contact.</li>
            <li>3. Connectez-vous uniquement au moment final pour confirmer.</li>
          </ol>
        </Card>

        <Button asChild className="rounded-xl bg-green-600 hover:bg-green-700">
          <Link href="/">Voir les prestataires disponibles</Link>
        </Button>
      </Container>
    </section>
  );
}
