import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { pageMetadata, siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Conditions d'utilisation | NearYou",
  description: "Conditions d'utilisation de la plateforme NearYou en Suisse.",
  path: "/conditions-utilisation",
});

export default function TermsPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-5 text-sm leading-relaxed text-slate-700">
        <h1 className="text-3xl font-semibold text-slate-900">Conditions d'utilisation</h1>
        <p>
          NearYou est une plateforme numérique d'intermédiation entre clients et prestataires de services locaux en Suisse.
          La plateforme facilite la mise en relation, la gestion des demandes, le suivi des statuts et la coordination
          opérationnelle.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">1. Role de la plateforme</h2>
        <p>
          NearYou intervient comme intermédiaire technique et opérationnel. NearYou n'est pas l'employeur des prestataires et
          n'exécute pas directement les prestations réservées.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">2. Comptes et acces</h2>
        <p>
          L'utilisateur est responsable des informations fournies lors de l'inscription et de la sécurité de ses identifiants.
          NearYou peut suspendre ou restreindre un accès en cas de non-respect des présentes conditions ou d'usage abusif.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">3. Prix, supplement et pourboire</h2>
        <p>
          Les prix affichés sur la plateforme sont des prix de départ ("dès XX CHF"). Le prix final peut varier selon la
          réalité de la mission: complexité, urgence, accès, distance ou matériel nécessaire.
        </p>
        <p>
          Tout supplément proposé par un prestataire doit être motivé et soumis à validation explicite du client. Aucun
          supplément ne peut être appliqué silencieusement. Une fois la mission terminée, le client peut laisser un pourboire.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">4. Demandes, missions et annulations</h2>
        <p>
          Les demandes et réservations sont traitées selon les disponibilités des prestataires validés. Les statuts affichés
          dans les espaces client, prestataire et admin font foi pour le suivi opérationnel.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">5. Responsabilites</h2>
        <p>
          Chaque prestataire reste seul responsable de la bonne exécution de sa prestation, de sa conformité légale et de ses
          obligations professionnelles. Le client reste responsable de l'exactitude des informations de mission transmises.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">6. Donnees personnelles</h2>
        <p>
          Le traitement des données est détaillé dans la politique de confidentialité. Les documents sensibles des prestataires
          et les informations bancaires sont stockés dans un espace privé avec accès restreint et journalisation des actions sensibles.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">7. Droit applicable</h2>
        <p>
          Les présentes conditions sont régies par le droit suisse. En cas de litige, une résolution amiable est recherchée
          en priorité avant recours aux juridictions compétentes.
        </p>

        <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600">
          Pour toute question: {siteConfig.contactEmail}
        </p>
      </Container>
    </section>
  );
}
