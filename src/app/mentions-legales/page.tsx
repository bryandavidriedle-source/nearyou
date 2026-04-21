import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Mentions légales | NearYou",
  description: "Mentions légales NearYou.",
  path: "/mentions-legales",
});

export default function LegalNoticePage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-5 text-sm leading-relaxed text-slate-600">
        <h1 className="text-3xl font-semibold text-slate-900">Mentions légales</h1>
        <p><strong>Éditeur:</strong> NearYou (à compléter: raison sociale, adresse complète, IDE, responsable publication).</p>
        <p><strong>Contact:</strong> {process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@nearyou.ch"}</p>
        <p><strong>Hébergement:</strong> Vercel Inc.</p>
        <p><strong>Base de données:</strong> Supabase Inc.</p>
        <p>NearYou opère en Suisse comme plateforme intermédiaire de mise en relation locale.</p>
      </Container>
    </section>
  );
}
