import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Politique de cookies | NearYou",
  description: "Politique de cookies NearYou / PresDeToi.",
  path: "/politique-cookies",
});

export default function CookiesPolicyPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-5 text-sm leading-relaxed text-slate-700">
        <h1 className="text-3xl font-semibold text-slate-900">Politique de cookies</h1>
        <p>
          NearYou utilise des cookies et technologies similaires pour assurer le bon fonctionnement du site, proteger les sessions
          utilisateurs et memoriser certaines preferences.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">1. Cookies strictement necessaires</h2>
        <p>
          Ces cookies sont indispensables au fonctionnement (authentification, securite, protection anti-abus, maintien de session).
          Ils ne peuvent pas etre desactives sans affecter le service.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">2. Cookies de mesure</h2>
        <p>
          Des cookies de mesure d'audience peuvent etre utilises pour ameliorer la qualite produit. Leur activation repose sur votre
          consentement lorsqu'il est juridiquement requis.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">3. Cookies tiers</h2>
        <p>
          Certains services integres (cartographie, paiement, communication) peuvent deposer des traceurs techniques necessaires a
          leur fonctionnement. Les cookies publicitaires ne sont pas actives par defaut.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">4. Gestion de vos preferences</h2>
        <p>
          Vous pouvez ajuster vos preferences dans les reglages de votre navigateur et via le bandeau cookies de la plateforme.
        </p>
      </Container>
    </section>
  );
}
