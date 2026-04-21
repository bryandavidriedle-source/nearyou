import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { CallRequestForm } from "@/components/forms/call-request-form";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/sections/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildMetadata } from "@/lib/metadata";
import { hotlineThemeMedia } from "@/lib/theme-media";

export const metadata: Metadata = buildMetadata({
  title: "Besoin d'aide par telephone | PresDeToi",
  description:
    "Demandez un rappel et faites-vous accompagner simplement par telephone.",
  path: "/aide-telephone",
});

export default function PhoneHelpPage() {
  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-4xl space-y-8">
        <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm font-medium text-primary">
          Paiement securise, support, assurance et suivi uniquement via la plateforme.
        </div>

        <SectionHeader
          eyebrow="Assistance"
          title="Besoin d'aide par telephone ?"
          description="Nous pouvons vous aider par telephone, simplement. Un membre de l'equipe vous rappelle pour creer votre demande."
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild className="h-12 rounded-xl text-base">
            <a href="#form-rappel">Etre rappele</a>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-xl text-base">
            <Link href="tel:+41215550000">Appeler maintenant</Link>
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {hotlineThemeMedia.map((media) => (
            <div key={media.src} className="overflow-hidden rounded-2xl border border-border/70 bg-card">
              <Image
                src={media.src}
                alt={media.alt}
                width={320}
                height={200}
                className="h-28 w-full object-cover"
              />
            </div>
          ))}
        </div>

        <Card className="rounded-2xl border-border/80 bg-card">
          <CardContent className="space-y-4 pt-6">
            <p className="text-base font-semibold">Comment ca marche</p>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. Vous laissez votre numero et votre besoin.</li>
              <li>2. Notre equipe vous rappelle sur le creneau choisi.</li>
              <li>3. Nous creons votre demande avec vous, sans friction digitale.</li>
            </ol>
            <p className="text-sm font-medium text-foreground">Horaires hotline: lundi-vendredi, 8h00-18h00</p>
          </CardContent>
        </Card>

        <Card id="form-rappel" className="rounded-3xl border-border/80 bg-card/95 shadow-sm">
          <CardContent className="pt-6">
            <CallRequestForm />
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
