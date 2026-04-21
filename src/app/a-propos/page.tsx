import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/sections/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "À propos | PrèsDeToi",
  description:
    "Découvrez la mission et la vision locale de PrèsDeToi pour les services de proximité en Suisse romande.",
  path: "/a-propos",
});

export default function AboutPage() {
  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-4xl">
        <SectionHeader
          eyebrow="À propos"
          title="Un service de proximité pensé pour la vraie vie"
          description="PrèsDeToi est né d'un besoin simple: trouver rapidement un prestataire local fiable, sans friction ni jargon."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-2xl border-border/70">
            <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
              <p>
                Notre mission est de simplifier la mise en relation entre particuliers et professionnels de proximité.
              </p>
              <p>
                Nous commençons volontairement à Lausanne pour garder un niveau de qualité élevé et un suivi humain de chaque demande.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70">
            <CardContent className="space-y-3 pt-6 text-sm leading-relaxed text-muted-foreground">
              <p>
                Notre vision: un service local fiable, accessible sur mobile, avec une expérience claire et premium sans complexité inutile.
              </p>
              <p>
                PrèsDeToi privilégie l'écoute, la transparence et la praticité pour répondre aux besoins du quotidien.
              </p>
            </CardContent>
          </Card>
        </div>
      </Container>
    </section>
  );
}

