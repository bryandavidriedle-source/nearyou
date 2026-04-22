import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { pageMetadata, siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Politique de confidentialite | NearYou",
  description: "Politique de confidentialite NearYou / PresDeToi (Suisse).",
  path: "/politique-confidentialite",
});

export default function PrivacyPolicyPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-5 text-sm leading-relaxed text-slate-700">
        <h1 className="text-3xl font-semibold text-slate-900">Politique de confidentialite</h1>
        <p>
          NearYou / PresDeToi traite les donnees personnelles uniquement pour fournir le service de mise en relation locale,
          securiser la plateforme et assurer le suivi operationnel des demandes et reservations.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">1. Categories de donnees traitees</h2>
        <p>
          Donnees d'identification (nom, email, telephone), informations de compte, demandes de service, reservations, statuts
          de mission, messages de support, donnees de verification prestataire, informations de versement et donnees techniques
          de securite (logs, anti-abus).
        </p>

        <h2 className="text-xl font-semibold text-slate-900">2. Finalites et base de traitement</h2>
        <p>
          Les traitements reposent sur l'execution du service, l'interet legitime de securite et de prevention de la fraude,
          ainsi que le consentement lorsque requis (cookies non essentiels, communications marketing).
        </p>

        <h2 className="text-xl font-semibold text-slate-900">3. Donnees sensibles prestataires</h2>
        <p>
          Les documents de validation prestataire sont conserves en stockage prive avec acces limite aux administrateurs autorises
          selon leur scope de role. Les informations bancaires de versement sont egalement protegees. Les consultations sensibles
          sont journalisees.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">4. Sous-traitants et hebergement</h2>
        <p>
          La plateforme est hebergee sur Vercel et utilise Supabase pour la base de donnees, l'authentification et le stockage.
          Des sous-traitants complementaires peuvent etre utilises pour l'email transactionnel et les services de carte.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">5. Conservation</h2>
        <p>
          Les donnees sont conservees pendant la duree necessaire aux finalites de service, aux obligations legales et a la
          defense des droits de la plateforme. Les donnees obsoletes sont supprimees ou anonymisees.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">6. Vos droits</h2>
        <p>
          Vous pouvez demander l'acces, la rectification, la suppression ou la limitation de traitement de vos donnees, dans les
          limites du droit applicable. Contact: {siteConfig.contactEmail}
        </p>
      </Container>
    </section>
  );
}
