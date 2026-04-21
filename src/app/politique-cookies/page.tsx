import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Politique de cookies | NearYou",
  description: "Politique de cookies NearYou.",
  path: "/politique-cookies",
});

export default function CookiesPolicyPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-5 text-sm leading-relaxed text-slate-600">
        <h1 className="text-3xl font-semibold text-slate-900">Politique de cookies</h1>
        <p>
          NearYou utilise des cookies essentiels (authentification, sécurité, préférences de langue) pour assurer le fonctionnement du service.
        </p>
        <p>
          Des cookies de mesure d'audience peuvent être activés après consentement. Vous pouvez retirer votre consentement à tout moment.
        </p>
        <p>
          Les cookies publicitaires tiers ne sont pas activés par défaut dans le MVP.
        </p>
      </Container>
    </section>
  );
}
