import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Politique de cookies | PrèsDeToi",
  description: "Politique de cookies PrèsDeToi.",
  path: "/politique-cookies",
});

export default function CookiesPolicyPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-5 text-sm leading-relaxed text-slate-700">
        <h1 className="text-3xl font-semibold text-slate-900">Politique de cookies</h1>
        <p>
          PrèsDeToi utilise des cookies et technologies similaires pour assurer le bon fonctionnement du site,
          protéger les sessions utilisateurs et mémoriser certaines préférences.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">1. Cookies strictement nécessaires</h2>
        <p>
          Ces cookies sont indispensables au fonctionnement (authentification, sécurité, protection anti-abus,
          maintien de session). Ils ne peuvent pas être désactivés sans affecter le service.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">2. Cookies de mesure</h2>
        <p>
          Des cookies de mesure d'audience peuvent être utilisés pour améliorer la qualité produit. Leur activation
          repose sur votre consentement lorsqu'il est juridiquement requis.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">3. Cookies tiers</h2>
        <p>
          Certains services intégrés (cartographie, paiement, communication) peuvent déposer des traceurs techniques
          nécessaires à leur fonctionnement. Les cookies publicitaires ne sont pas activés par défaut.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">4. Gestion de vos préférences</h2>
        <p>
          Vous pouvez ajuster vos préférences dans les réglages de votre navigateur et via le bandeau cookies de la
          plateforme.
        </p>
      </Container>
    </section>
  );
}
