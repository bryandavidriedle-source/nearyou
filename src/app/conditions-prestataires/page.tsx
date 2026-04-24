import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { pageMetadata, siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Conditions prestataires | PrèsDeToi",
  description: "Conditions prestataires PrèsDeToi pour une activité locale en Suisse.",
  path: "/conditions-prestataires",
});

export default function ProviderTermsPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-5 text-sm leading-relaxed text-slate-700">
        <h1 className="text-3xl font-semibold text-slate-900">Conditions prestataires</h1>
        <p>
          Ces conditions s'appliquent à tout prestataire candidat ou actif sur PrèsDeToi. L'activation publique est
          conditionnée à une validation manuelle du dossier par l'équipe admin.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">1. Statut juridique</h2>
        <p>
          Le prestataire agit à titre indépendant, particulier ou société. Il n'existe aucun lien de subordination avec
          PrèsDeToi. Le prestataire assume seul ses obligations sociales, fiscales, administratives et réglementaires.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">2. Âge minimum et restrictions</h2>
        <p>
          Âge minimum pour candidater: 15 ans.
        </p>
        <p>
          Entre 15 et 17 ans, seules des missions simples et sans risque sont autorisées après validation admin
          renforcée (pas de transport motorisé, pas de garde d'enfants seuls, pas de mission sensible).
        </p>

        <h2 className="text-xl font-semibold text-slate-900">3. Validation du dossier</h2>
        <p>
          Le dossier peut passer par les statuts: draft, submitted, pending_review, needs_info, approved, rejected,
          suspended. Tant que le statut n'est pas approved, le profil n'est pas publiable.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">4. Documents et conformité</h2>
        <p>
          Selon l'activité, PrèsDeToi peut demander une pièce d'identité, un permis de séjour, une assurance RC et tout
          document complémentaire utile à la validation. Les documents sont stockés en espace privé.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">5. Missions et qualité</h2>
        <p>
          Le prestataire s'engage à répondre rapidement aux demandes assignées, respecter les horaires confirmés et
          maintenir un niveau de qualité compatible avec les attentes de la plateforme.
        </p>
        <p>
          Les prix affichés sont des prix de départ. En cas d'ajustement sur place, un supplément motivé peut être
          proposé, mais il doit être approuvé explicitement par le client avant application.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">6. Paiements et commissions</h2>
        <p>
          Les montants sont suivis avec distinction brut, commission plateforme et net prestataire. La commission
          plateforme V1 est fixée à 20%.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">7. Suspension et clôture</h2>
        <p>
          En cas de manquement grave, de non-conformité ou de risque opérationnel, PrèsDeToi peut suspendre un compte
          prestataire. Le compte peut rester accessible en lecture pour suivi administratif.
        </p>

        <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600">
          Contact opérations prestataires: {siteConfig.contactEmail}
        </p>
      </Container>
    </section>
  );
}
