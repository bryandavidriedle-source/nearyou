import type { Metadata } from "next";

import { ProviderForm } from "@/components/forms/provider-form";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/sections/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Devenir prestataire | PresDeToi",
  description:
    "Inscription prestataire avec validation manuelle obligatoire et contrôle documentaire sécurisé.",
  path: "/devenir-prestataire",
});

export default function BecomeProviderPage() {
  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-4xl space-y-6">
        <SectionHeader
          eyebrow="Candidature prestataire"
          title="Proposez vos services localement"
          description="Dossier vérifié manuellement par un administrateur autorisé avant activation."
        />

        <Card className="rounded-2xl border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>
            PresDeToi agit comme intermédiaire de mise en relation. Chaque prestataire reste juridiquement et fiscalement indépendant,
            responsable de ses obligations professionnelles, sociales et administratives en Suisse.
          </p>
          <p className="mt-2">
            Les justificatifs transmis (pièce d'identité ou titre de séjour B/C) sont consultables uniquement par des administrateurs autorisés.
          </p>
        </Card>

        <Card className="rounded-3xl border-border/80 bg-card/95 shadow-sm">
          <CardContent className="pt-6">
            <ProviderForm />
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
