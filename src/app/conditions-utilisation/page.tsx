import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Conditions générales d'utilisation | PresDeToi",
  description: "CGU PresDeToi pour la mise en relation locale en Suisse.",
  path: "/conditions-utilisation",
});

export default function TermsPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-5 text-sm leading-relaxed text-slate-700">
        <h1 className="text-3xl font-semibold text-slate-900">Conditions générales d'utilisation</h1>

        <p>
          PresDeToi est une plateforme numérique d'intermédiation entre clients et prestataires. PresDeToi n'est pas l'employeur des prestataires
          et n'exécute pas elle-même les prestations réservées.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">1. Objet de la plateforme</h2>
        <p>
          La plateforme facilite la mise en relation locale, la centralisation des demandes et le suivi administratif des réservations.
          Les modalités concrètes de la prestation sont convenues entre client et prestataire.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">2. Responsabilité des prestataires</h2>
        <p>
          Chaque prestataire agit sous sa propre responsabilité, déclare être autorisé à exercer en Suisse et demeure seul responsable
          de ses obligations légales, fiscales, sociales, administratives et réglementaires.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">3. Limitation de rôle de PresDeToi</h2>
        <p>
          Une validation de dossier par PresDeToi ne constitue pas un conseil juridique ni une garantie absolue de conformité du prestataire.
          PresDeToi intervient comme intermédiaire technique et support opérationnel.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">4. Données et documents</h2>
        <p>
          Les données personnelles et documents sensibles transmis sur la plateforme sont traités selon la politique de confidentialité,
          avec accès restreint aux administrateurs autorisés selon leurs droits.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">5. Droit applicable</h2>
        <p>
          Les présentes CGU sont régies par le droit suisse. En cas de litige, une tentative de résolution amiable est privilégiée avant toute action.
        </p>

        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
          Note: ce texte constitue une base opérationnelle MVP et doit être validé juridiquement avant exploitation commerciale à grande échelle en Suisse.
        </p>
      </Container>
    </section>
  );
}
