import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="py-20">
      <Container className="max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Erreur 404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Cette page n&apos;existe pas</h1>
        <p className="mt-4 text-muted-foreground">
          Revenez sur l&apos;accueil pour continuer votre demande de service ou decouvrir les prestataires NearYou.
        </p>
        <Button asChild className="mt-8 rounded-full">
          <Link href="/">Retour a l&apos;accueil</Link>
        </Button>
      </Container>
    </section>
  );
}
