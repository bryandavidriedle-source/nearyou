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
  description:
    "Faites une demande de service locale à Lausanne en quelques minutes.",
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
          description="Une demande claire, un traitement humain, une mise en relation locale adaptée à Lausanne."
        />

        <Card className="rounded-3xl border-border/80 bg-card/95 shadow-sm">
          <CardContent className="pt-6">
            <LeadForm initialCategory={initialCategory} />
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}

