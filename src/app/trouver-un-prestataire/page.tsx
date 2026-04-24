import type { Metadata } from "next";

import { LeadForm } from "@/components/forms/lead-form";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/sections/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/lib/metadata";

type FindProviderPageProps = {
  searchParams?: Promise<{
    categorie?: string;
  }>;
};

export const metadata: Metadata = buildMetadata({
  title: "Trouver un prestataire | PrèsDeToi",
  description: "Faites une demande locale en Suisse romande en quelques minutes avec PrèsDeToi.",
  path: "/trouver-un-prestataire",
});

export default async function FindProviderPage({ searchParams }: FindProviderPageProps) {
  const resolvedSearchParams = await searchParams;
  const initialCategory = resolvedSearchParams?.categorie;

  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-3xl">
        <SectionHeader
          eyebrow="Demande de service"
          title="Décrivez votre besoin"
          description="Parcours simple, traitement humain et mise en relation locale adaptée à votre situation."
        />

        <Card className="rounded-3xl border-border/80 bg-card/95 shadow-sm">
          <CardContent className="pt-6">
            <LeadForm initialCategory={initialCategory} />
          </CardContent>
        </Card>
      </Container>

      <div className="fixed inset-x-0 bottom-20 z-40 px-4 md:hidden">
        <button
          type="submit"
          form="service-request-form"
          className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-green-700"
        >
          Envoyer ma demande
        </button>
      </div>
    </section>
  );
}


