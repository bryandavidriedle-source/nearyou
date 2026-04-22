import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { pageMetadata, siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Conditions prestataires | NearYou",
  description: "Conditions prestataires NearYou pour une activité locale en Suisse.",
  path: "/conditions-prestataires",
});

export default function ProviderTermsPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-5 text-sm leading-relaxed text-slate-700">
        <h1 className="text-3xl font-semibold text-slate-900">Conditions prestataires</h1>
        <p>
          Ces conditions s'appliquent à tout prestataire candidat ou actif sur NearYou. L'activation publique est conditionnée
          à une validation manuelle du dossier.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">1. Statut juridique</h2>
        <p>
          Le prestataire agit à titre indépendant ou en qualité de société. Il n'existe aucun lien de subordination avec NearYou.
          Le prestataire assume seul ses obligations sociales, fiscales, administratives et réglementaires.
        </p>
        <p>
          Âge minimum pour candidater: 16 ans. Une candidature dont la date de naissance indique moins de 16 ans est bloquée.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">2. Validation du dossier</h2>
        <p>
          Le dossier peut passer par les statuts: draft, submitted, pending_review, needs_info, approved, rejected, suspended.
          Tant que le statut n'est pas approved, le profil ne doit pas être considéré comme actif publiquement.
        </p>
        <p>
          Le prestataire s'engage à transmettre des informations exactes et à jour. NearYou peut demander tout justificatif
          complémentaire en cas de doute de conformité.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">3. Documents et conformite</h2>
        <p>
          Selon l'activité, NearYou peut demander une pièce d'identité, un permis de séjour, une assurance RC et tout document
          complémentaire utile à la validation. Les documents restent en stockage privé.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">4. Missions et qualite de service</h2>
        <p>
          Le prestataire s'engage à répondre rapidement aux demandes assignées, à respecter les horaires confirmés et à maintenir
          un niveau de qualité compatible avec les attentes de la plateforme.
        </p>
        <p>
          Les prix affichés sont des prix de départ. En cas d'ajustement sur place, un supplément motivé peut être proposé,
          mais il doit être approuvé explicitement par le client avant application.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">5. Paiements et commissions</h2>
        <p>
          Les montants prestataires sont suivis dans l'espace paiement avec distinction brut, commission plateforme et net.
          Les modalités de versement peuvent évoluer avec l'intégration de solutions de paiement externes.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">6. Suspension et cloture</h2>
        <p>
          En cas de manquement grave, de non-conformité ou de risque opérationnel, NearYou peut suspendre un compte prestataire.
          Le compte reste accessible en lecture pour suivi administratif.
        </p>

        <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600">
          Contact operation prestataires: {siteConfig.contactEmail}
        </p>
      </Container>
    </section>
  );
}
