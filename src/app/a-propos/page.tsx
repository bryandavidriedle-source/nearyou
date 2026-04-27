import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/sections/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "A propos | PrèsDeToi",
  description: "Mission et vision PrèsDeToi pour des services locaux fiables en Suisse romande.",
  path: "/a-propos",
});

export default function AboutPage() {
  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-4xl">
        <SectionHeader
          eyebrow="A propos"
          title="Un service local pense pour la vraie vie"
          description="PrèsDeToi est ne d'un besoin simple: trouver rapidement un prestataire local fiable, sans friction inutile."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-2xl border-border/70">
            <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
              <p>Notre mission est de simplifier la mise en relation entre particuliers et professionnels de proximite.</p>
              <p>Nous demarrons a Lausanne pour garder un niveau de qualite eleve et un suivi humain de chaque demande.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70">
            <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
              <p>Notre vision: un service local fiable, mobile-first et premium, sans complexite technique inutile.</p>
              <p>PrèsDeToi privilegie la confiance, la transparence et l'efficacite operationnelle.</p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </section>
  );
}

