import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Conditions prestataires | PresDeToi",
  description: "Conditions spécifiques applicables aux prestataires PresDeToi en Suisse.",
  path: "/conditions-prestataires",
});

export default function ProviderTermsPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-5 text-sm leading-relaxed text-slate-700">
        <h1 className="text-3xl font-semibold text-slate-900">Conditions prestataires</h1>

        <p>
          Les présentes conditions s'appliquent à tout prestataire inscrivant un dossier sur PresDeToi.
          L'activation du profil est soumise à validation manuelle préalable.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">1. Statut indépendant</h2>
        <p>
          Le prestataire agit en qualité d'indépendant ou d'entreprise autonome. Il ne dispose d'aucun lien de subordination
          avec PresDeToi et assume seul ses charges, assurances et obligations légales.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">2. Droit d'exercer</h2>
        <p>
          Le prestataire déclare disposer des autorisations nécessaires à l'exercice de son activité en Suisse.
          Si un titre de séjour est utilisé, seuls les statuts valables B ou C sont acceptés sous réserve du droit applicable.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">3. Validation documentaire</h2>
        <p>
          Les justificatifs fournis sont consultables uniquement par les administrateurs autorisés en charge de la revue des dossiers.
          L'accès aux documents est journalisé et limité dans le temps via URL signées.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">4. Workflow de dossier</h2>
        <p>
          Les statuts possibles sont: brouillon, soumis, en attente de validation, approuvé, refusé, à compléter.
          Tant que le statut n'est pas approuvé, le prestataire ne doit pas être présenté comme actif.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">5. Responsabilité</h2>
        <p>
          Le prestataire demeure seul responsable de ses prestations, de sa conformité réglementaire et des obligations fiscales, sociales
          et administratives liées à son activité.
        </p>

        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
          Note: ce texte est une base opérationnelle MVP et doit être validé juridiquement avant exploitation commerciale à grande échelle en Suisse.
        </p>
      </Container>
    </section>
  );
}

