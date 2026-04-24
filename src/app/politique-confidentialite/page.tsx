import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { pageMetadata, siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Politique de confidentialité | PrèsDeToi",
  description: "Politique de confidentialité PrèsDeToi (Suisse).",
  path: "/politique-confidentialite",
});

export default function PrivacyPolicyPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-5 text-sm leading-relaxed text-slate-700">
        <h1 className="text-3xl font-semibold text-slate-900">Politique de confidentialité</h1>
        <p>
          PrèsDeToi traite les données personnelles uniquement pour fournir le service de mise en relation locale,
          sécuriser la plateforme et assurer le suivi opérationnel des demandes et réservations.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">1. Catégories de données traitées</h2>
        <p>
          Données d'identification (nom, email, téléphone), informations de compte, demandes de service, réservations,
          statuts de mission, messages de support, données de vérification prestataire, informations de versement et
          données techniques de sécurité (logs, anti-abus).
        </p>

        <h2 className="text-xl font-semibold text-slate-900">2. Finalités et base de traitement</h2>
        <p>
          Les traitements reposent sur l'exécution du service, l'intérêt légitime de sécurité et de prévention de la
          fraude, ainsi que le consentement lorsque requis (cookies non essentiels, communications marketing).
        </p>

        <h2 className="text-xl font-semibold text-slate-900">3. Données sensibles prestataires</h2>
        <p>
          Les documents de validation prestataire sont conservés en stockage privé avec accès limité aux administrateurs
          autorisés selon leur scope de rôle. Les informations bancaires de versement sont également protégées.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">4. Sous-traitants et hébergement</h2>
        <p>
          La plateforme est hébergée sur Vercel et utilise Supabase pour la base de données, l'authentification et le
          stockage. Des sous-traitants complémentaires peuvent être utilisés pour l'email transactionnel et le paiement.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">5. Conservation</h2>
        <p>
          Les données sont conservées pendant la durée nécessaire aux finalités de service, aux obligations légales et à
          la défense des droits de la plateforme. Les données obsolètes sont supprimées ou anonymisées.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">6. Vos droits</h2>
        <p>
          Vous pouvez demander l'accès, la rectification, la suppression ou la limitation de traitement de vos données,
          dans les limites du droit applicable. Contact: {siteConfig.contactEmail}
        </p>
      </Container>
    </section>
  );
}
