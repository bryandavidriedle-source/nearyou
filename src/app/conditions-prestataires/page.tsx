import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { pageMetadata, siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Conditions prestataires | NearYou",
  description: "Conditions prestataires NearYou / PresDeToi pour une activite locale en Suisse.",
  path: "/conditions-prestataires",
});

export default function ProviderTermsPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-5 text-sm leading-relaxed text-slate-700">
        <h1 className="text-3xl font-semibold text-slate-900">Conditions prestataires</h1>
        <p>
          Ces conditions s'appliquent a tout prestataire candidat ou actif sur NearYou / PresDeToi. L'activation publique
          est conditionnee a une validation manuelle du dossier.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">1. Statut juridique</h2>
        <p>
          Le prestataire agit a titre independant ou en qualite de societe. Il n'existe aucun lien de subordination avec NearYou.
          Le prestataire assume seul ses obligations sociales, fiscales, administratives et reglementaires.
        </p>
        <p>
          Age minimum pour candidater: 16 ans. Une candidature dont la date de naissance indique moins de 16 ans est bloquee.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">2. Validation du dossier</h2>
        <p>
          Le dossier peut passer par les statuts: draft, submitted, pending_review, needs_info, approved, rejected, suspended.
          Tant que le statut n'est pas approved, le profil ne doit pas etre considere comme actif publiquement.
        </p>
        <p>
          Le prestataire s'engage a transmettre des informations exactes et a jour. NearYou peut demander tout justificatif
          complementaire en cas de doute de conformite.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">3. Documents et conformite</h2>
        <p>
          Selon l'activite, NearYou peut demander une piece d'identite, un permis de sejour, une assurance RC et tout document
          complementaire utile a la validation. Les documents restent en stockage prive.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">4. Missions et qualite de service</h2>
        <p>
          Le prestataire s'engage a repondre rapidement aux demandes assignees, a respecter les horaires confirmes et a maintenir
          un niveau de qualite compatible avec les attentes de la plateforme.
        </p>
        <p>
          Les prix affiches sont des prix de depart. En cas d'ajustement sur place, un supplement motive peut etre propose,
          mais il doit etre approuve explicitement par le client avant application.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">5. Paiements et commissions</h2>
        <p>
          Les montants prestataires sont suivis dans l'espace paiement avec distinction brut, commission plateforme et net.
          Les modalites de versement peuvent evoluer avec l'integration de solutions de paiement externes.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">6. Suspension et cloture</h2>
        <p>
          En cas de manquement grave, de non-conformite ou de risque operationnel, NearYou peut suspendre un compte prestataire.
          Le compte reste accessible en lecture pour suivi administratif.
        </p>

        <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600">
          Contact operation prestataires: {siteConfig.contactEmail}
        </p>
      </Container>
    </section>
  );
}
