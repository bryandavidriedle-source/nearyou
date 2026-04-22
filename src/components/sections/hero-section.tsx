"use client";

import Link from "next/link";

import { motion } from "framer-motion";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-background via-secondary/40 to-secondary/70 py-14 sm:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(39,81,64,0.20),transparent_70%)]" />
      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-3xl"
        >
          <p className="mb-4 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:text-sm">
            Services locaux - Lausanne
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Trouvez le bon prestataire pres de chez vous.
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Une demande rapide, un contact humain, une solution locale. NearYou facilite la mise en relation entre particuliers et prestataires de confiance en Suisse romande.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/trouver-un-prestataire">Trouver un prestataire</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-primary/30 bg-white/80">
              <Link href="/devenir-prestataire">Devenir prestataire</Link>
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
