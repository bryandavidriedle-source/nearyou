import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { pageMetadata, siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Mentions legales | NearYou",
  description: "Mentions legales de la plateforme NearYou / PresDeToi.",
  path: "/mentions-legales",
});

export default function LegalNoticePage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-5 text-sm leading-relaxed text-slate-700">
        <h1 className="text-3xl font-semibold text-slate-900">Mentions legales</h1>

        <h2 className="text-xl font-semibold text-slate-900">Editeur</h2>
        <p>
          NearYou / PresDeToi, plateforme numerique de mise en relation locale pour services a domicile en Suisse.
          Siege operationnel: {siteConfig.city}, Suisse.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">Contact</h2>
        <p>Email: {siteConfig.contactEmail}</p>
        <p>Telephone: {siteConfig.phone}</p>

        <h2 className="text-xl font-semibold text-slate-900">Hebergement</h2>
        <p>Infrastructure applicative: Vercel.</p>
        <p>Base de donnees, auth et stockage securise: Supabase.</p>

        <h2 className="text-xl font-semibold text-slate-900">Propriete intellectuelle</h2>
        <p>
          Les contenus, marques, logos, textes et elements graphiques de la plateforme sont proteges par les droits applicables.
          Toute reproduction non autorisee est interdite.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">Responsabilite</h2>
        <p>
          NearYou agit comme intermediaire. Les prestations sont executees par des professionnels tiers, responsables de leurs actes
          et obligations. NearYou met en place des controles raisonnables mais ne garantit pas l'absence totale d'incident.
        </p>
      </Container>
    </section>
  );
}
