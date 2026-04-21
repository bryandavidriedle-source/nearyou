import type { Metadata } from "next";

import { ProviderForm } from "@/components/forms/provider-form";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/sections/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Devenir prestataire | PrèsDeToi",
  description:
    "Rejoignez la phase test PrèsDeToi à Lausanne et recevez des demandes locales qualifiées.",
  path: "/devenir-prestataire",
});

export default function BecomeProviderPage() {
  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-3xl">
        <SectionHeader
          eyebrow="Candidature prestataire"
          title="Proposez vos services localement"
          description="Vous êtes basé dans la région lausannoise ? Rejoignez notre phase test et développez votre activité de proximité."
        />

        <Card className="rounded-3xl border-border/80 bg-card/95 shadow-sm">
          <CardContent className="pt-6">
            <ProviderForm />
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}

