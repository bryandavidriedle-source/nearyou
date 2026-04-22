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
  title: "Devenir prestataire | NearYou",
  description: "Candidature prestataire avec validation manuelle obligatoire et controle documentaire securise.",
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
          title="Rejoignez NearYou en tant que professionnel independant"
          description="Chaque dossier est verifie manuellement avant activation publique."
        />

        <Card className="rounded-2xl border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>
            NearYou agit comme intermediaire de mise en relation. Chaque prestataire reste juridiquement et fiscalement
            independant, responsable de ses obligations professionnelles, sociales et administratives en Suisse.
          </p>
          <p className="mt-2">
            Les justificatifs transmis sont consultables uniquement par des administrateurs autorises pour la validation.
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
              Pour deposer un dossier prestataire, connectez-vous ou creez un compte. Vos documents restent prives et lies a votre profil.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild className="rounded-xl bg-blue-700 hover:bg-blue-800">
                <Link href="/connexion?next=/devenir-prestataire">Se connecter</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl border-blue-200">
                <Link href="/inscription?next=/devenir-prestataire">Creer un compte</Link>
              </Button>
            </div>
          </Card>
        )}
      </Container>
    </section>
  );
}
