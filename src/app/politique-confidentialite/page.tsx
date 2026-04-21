import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Politique de confidentialité | NearYou",
  description: "Politique de confidentialité NearYou (Suisse).",
  path: "/politique-confidentialite",
});

export default function PrivacyPolicyPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-5 text-sm leading-relaxed text-slate-600">
        <h1 className="text-3xl font-semibold text-slate-900">Politique de confidentialité</h1>
        <p>
          NearYou collecte uniquement les données nécessaires à la création de compte, à la réservation, au support client et à la sécurité.
        </p>
        <p>
          Données traitées: identité, coordonnées, messages, historiques de réservation, données techniques et logs de sécurité.
        </p>
        <p>
          Base légale: exécution du service, intérêt légitime de sécurité, consentement quand requis (cookies analytics, communications marketing).
        </p>
        <p>
          Hébergement et base de données: Vercel et Supabase. Les données sont protégées par contrôle d'accès, chiffrement en transit et journalisation.
        </p>
        <p>
          Exercice des droits (accès, rectification, suppression): contactez <strong>{process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@nearyou.ch"}</strong>.
        </p>
      </Container>
    </section>
  );
}
