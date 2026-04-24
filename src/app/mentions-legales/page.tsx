import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { pageMetadata, siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Mentions légales | PrèsDeToi",
  description: "Mentions légales de la plateforme PrèsDeToi.",
  path: "/mentions-legales",
});

export default function LegalNoticePage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-5 text-sm leading-relaxed text-slate-700">
        <h1 className="text-3xl font-semibold text-slate-900">Mentions légales</h1>

        <h2 className="text-xl font-semibold text-slate-900">Éditeur</h2>
        <p>
          PrèsDeToi, plateforme numérique de mise en relation locale pour services à domicile en Suisse.
          Siège opérationnel: {siteConfig.city}, {siteConfig.canton}, Suisse.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">Contact</h2>
        <p>Email: {siteConfig.contactEmail}</p>
        <p>Téléphone: {siteConfig.phone}</p>

        <h2 className="text-xl font-semibold text-slate-900">Hébergement</h2>
        <p>Infrastructure applicative: Vercel.</p>
        <p>Base de données, auth et stockage sécurisé: Supabase.</p>

        <h2 className="text-xl font-semibold text-slate-900">Propriété intellectuelle</h2>
        <p>
          Les contenus, marques, logos, textes et éléments graphiques de la plateforme sont protégés par les droits
          applicables. Toute reproduction non autorisée est interdite.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">Responsabilité</h2>
        <p>
          PrèsDeToi agit comme intermédiaire. Les prestations sont exécutées par des prestataires tiers, responsables de
          leurs actes et obligations. PrèsDeToi met en place des contrôles raisonnables sans garantir l'absence totale
          d'incident.
        </p>
      </Container>
    </section>
  );
}
