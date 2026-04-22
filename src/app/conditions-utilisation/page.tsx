import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { pageMetadata, siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Conditions d'utilisation | NearYou",
  description: "Conditions d'utilisation de la plateforme NearYou / PresDeToi en Suisse.",
  path: "/conditions-utilisation",
});

export default function TermsPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-5 text-sm leading-relaxed text-slate-700">
        <h1 className="text-3xl font-semibold text-slate-900">Conditions d'utilisation</h1>
        <p>
          NearYou / PresDeToi est une plateforme numerique d'intermediation entre clients et prestataires de services locaux
          en Suisse. La plateforme facilite la mise en relation, la gestion des demandes, le suivi des statuts et la
          coordination operationnelle.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">1. Role de la plateforme</h2>
        <p>
          NearYou intervient comme intermediaire technique et operationnel. NearYou n'est pas l'employeur des prestataires
          et n'execute pas directement les prestations reservees.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">2. Comptes et acces</h2>
        <p>
          L'utilisateur est responsable des informations fournies lors de l'inscription et de la securite de ses identifiants.
          NearYou peut suspendre ou restreindre un acces en cas de non-respect des presentes conditions ou d'usage abusif.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">3. Prix, supplement et pourboire</h2>
        <p>
          Les prix affiches sur la plateforme sont des prix de depart ("des XX CHF"). Le prix final peut varier selon la
          realite de la mission: complexite, urgence, acces, distance ou materiel necessaire.
        </p>
        <p>
          Tout supplement propose par un prestataire doit etre motive et soumis a validation explicite du client. Aucun
          supplement ne peut etre applique silencieusement. Une fois la mission terminee, le client peut laisser un pourboire.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">4. Demandes, missions et annulations</h2>
        <p>
          Les demandes et reservations sont traitees selon les disponibilites des prestataires valides. Les statuts affiches
          dans les espaces client, prestataire et admin font foi pour le suivi operationnel.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">5. Responsabilites</h2>
        <p>
          Chaque prestataire reste seul responsable de la bonne execution de sa prestation, de sa conformite legale et de ses
          obligations professionnelles. Le client reste responsable de l'exactitude des informations de mission transmises.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">6. Donnees personnelles</h2>
        <p>
          Le traitement des donnees est detaille dans la politique de confidentialite. Les documents sensibles des prestataires
          et les informations bancaires sont stockes dans un espace prive avec acces restreint et journalisation des actions sensibles.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">7. Droit applicable</h2>
        <p>
          Les presentes conditions sont regies par le droit suisse. En cas de litige, une resolution amiable est recherchee
          en priorite avant recours aux juridictions competentes.
        </p>

        <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600">
          Pour toute question: {siteConfig.contactEmail}
        </p>
      </Container>
    </section>
  );
}
