import type { Metadata } from "next";

import { ContactForm } from "@/components/forms/contact-form";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/sections/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { pageMetadata, siteConfig } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact | NearYou",
  description: "Contactez l'équipe NearYou pour toute question sur la phase test à Lausanne.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-3xl">
        <SectionHeader
          eyebrow="Contact"
          title="Parlons de votre besoin"
          description={`Une question sur la phase test ? Écrivez-nous ou contactez-nous à ${siteConfig.contactEmail}.`}
        />

        <Card className="rounded-3xl border-border/80 bg-card/95 shadow-sm">
          <CardContent className="space-y-6 pt-6">
            <p className="rounded-xl bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
              Nous répondons généralement sous 24 heures ouvrées. Votre message sera traité avec attention par une personne de l'équipe.
            </p>
            <ContactForm />
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}
