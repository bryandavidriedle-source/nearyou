import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProviderForm } from "@/components/forms/provider-form";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/sections/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAuthContext, resolveAuthenticatedHomePath } from "@/lib/auth";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Devenir prestataire | PrèsDeToi",
  description: "Candidature prestataire avec validation manuelle obligatoire et contrôle documentaire sécurisé.",
  path: "/devenir-prestataire",
});

export default async function BecomeProviderPage() {
  const auth = await getAuthContext();
  const user = auth.user;

  if (auth.user) {
    const home = await resolveAuthenticatedHomePath();
    if (home === "/espace-prestataire" || home === "/admin") {
      redirect(home);
    }
  }

  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-4xl space-y-6">
        <SectionHeader
          eyebrow="Candidature prestataire"
          title="Rejoignez PrèsDeToi en tant que prestataire local"
          description="Chaque dossier est vérifié manuellement avant activation publique."
        />

        <Card className="rounded-2xl border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>
            PrèsDeToi agit comme intermédiaire de mise en relation. Chaque prestataire reste juridiquement et
            fiscalement indépendant, responsable de ses obligations professionnelles, sociales et administratives en
            Suisse.
          </p>
          <p className="mt-2">
            ge minimum pour candidater: 15 ans. Entre 15 et 17 ans, l'accès est limité à des missions simples après
            validation admin renforcée.
          </p>
          <p className="mt-2">
            Les justificatifs transmis sont consultables uniquement par des administrateurs autorisés pour la validation.
          </p>
        </Card>

        {user ? (
          <Card className="rounded-3xl border-border/80 bg-card/95 shadow-sm">
            <CardContent className="pt-6">
              <ProviderForm />
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-3xl border-blue-100 bg-blue-50 p-6">
            <p className="text-sm text-blue-900">
              Pour déposer un dossier prestataire, connectez-vous ou créez un compte. Vos documents restent privés et
              liés à votre profil.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild className="rounded-xl bg-blue-700 hover:bg-blue-800">
                <Link href="/connexion?next=/devenir-prestataire">Se connecter</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl border-blue-200">
                <Link href="/inscription?next=/devenir-prestataire">Créer un compte</Link>
              </Button>
            </div>
          </Card>
        )}
      </Container>
    </section>
  );
}
