import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Conditions générales d'utilisation | NearYou",
  description: "CGU NearYou pour la marketplace locale suisse.",
  path: "/conditions-utilisation",
});

export default function TermsPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-5 text-sm leading-relaxed text-slate-600">
        <h1 className="text-3xl font-semibold text-slate-900">Conditions générales d'utilisation</h1>
        <p>
          NearYou est une plateforme de mise en relation locale. NearYou agit comme intermédiaire technique entre clients et prestataires.
        </p>
        <p>
          Les prestataires restent des professionnels indépendants, responsables de leurs services, assurances et obligations légales.
        </p>
        <p>
          Les réservations et échanges doivent rester sur la plateforme pour garantir paiement sécurisé, support et suivi.
        </p>
        <p>
          En phase MVP, certaines fonctionnalités évoluent rapidement. L'utilisation continue vaut acceptation des présentes CGU.
        </p>
      </Container>
    </section>
  );
}
