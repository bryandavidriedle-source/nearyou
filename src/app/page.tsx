import Link from "next/link";

import { CheckCircle2, Clock3, ShieldCheck, UsersRound } from "lucide-react";

import { HeroSearch } from "@/components/nearyou/hero-search";
import { ProviderMapSplit } from "@/components/nearyou/provider-map-split";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { swissCityTargets } from "@/lib/constants";
import { getHomeData } from "@/lib/db";
import { messages } from "@/lib/i18n";
import { getCurrentLanguage } from "@/lib/i18n-server";
import { priceHighlights, siteConfig } from "@/lib/site";

const trustPillars = [
  { icon: ShieldCheck, title: "Prestataires vérifiés", detail: "Validation documentaire et contrôle manuel avant publication." },
  { icon: Clock3, title: "Réservation rapide", detail: "Parcours mobile simple pour réserver un créneau sans friction." },
  { icon: UsersRound, title: "Support humain local", detail: "Équipe de proximité en Suisse romande pour vous accompagner." },
  { icon: CheckCircle2, title: "Cadre suisse clair", detail: "PrèsDeToi est une plateforme d'intermédiation, pas un employeur." },
];

const socialProof: Array<{ name: string; text: string }> = [];

export default async function HomePage() {
  const lang = await getCurrentLanguage();
  const m = messages[lang];
  const { missions, parkingListings, partners, categories } = await getHomeData();
  const categoryHighlights =
    categories.length > 0
      ? categories.map((category) => ({
          id: category.id,
          label: category.name,
          fromPrice: category.fromPrice,
        }))
      : priceHighlights.map((category, index) => ({
          id: `local-${index}`,
          label: category.label,
          fromPrice: category.fromPrice,
        }));

  const providerItems = missions
    .filter((mission) => mission.provider.profile)
    .map((mission) => ({
      id: mission.id,
      title: mission.title,
      fromPrice: mission.fromPrice,
      category: mission.category.name,
      distanceKm: mission.distanceKm,
      isAvailableToday: mission.isAvailableToday,
      badge: mission.badge,
      lat: mission.lat,
      lng: mission.lng,
      city: mission.city,
      providerName: `${mission.provider.profile?.firstName ?? ""} ${mission.provider.profile?.lastName ?? ""}`.trim(),
      providerAvatar: mission.provider.profile?.avatarUrl ?? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      rating: mission.provider.profile?.rating ?? 0,
      completedMissions: mission.provider.profile?.completedMissions ?? 0,
      providerScore: mission.provider.profile?.providerScore ?? 0,
    }));

  return (
    <>
      <section className="py-8 sm:py-12">
        <Container className="space-y-6">
          <div className="section-shell overflow-hidden p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{m.home.badge}</Badge>
                <h1 className="text-balance text-4xl font-bold text-slate-900 sm:text-5xl">
                  Trouvez une personne de confiance près de chez vous
                </h1>
                <p className="max-w-2xl text-lg text-slate-600">
                  Réservez un service local en Suisse: ménage, jardinage, bricolage, aide seniors et bien plus, avec des
                  prestataires vérifiés et validés manuellement.
                </p>

                <div className="flex flex-wrap gap-2">
                  {m.home.actions.map((action) => (
                    <span key={action} className="trust-chip">{action}</span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild className="h-12 rounded-xl bg-green-600 px-6 text-base hover:bg-green-700">
                    <Link href="/trouver-un-prestataire">Réserver un service</Link>
                  </Button>
                  <Button asChild variant="outline" className="h-12 rounded-xl border-blue-200 px-6 text-base text-blue-700 hover:bg-blue-50">
                    <Link href="/devenir-prestataire">Devenir prestataire</Link>
                  </Button>
                </div>
                <p className="text-sm text-slate-500">
                  Lancement prioritaire à {siteConfig.city} ({siteConfig.canton}), puis extension Vaud, Genève et Fribourg.
                </p>
              </div>

              <Card className="premium-card border-blue-100 p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Comment ça marche</p>
                <ol className="mt-3 space-y-3 text-sm text-slate-600">
                  <li>1. Choisissez un service.</li>
                  <li>2. Comparez les prestataires.</li>
                  <li>3. Réservez en sécurité.</li>
                </ol>
                <p className="mt-4 rounded-xl bg-green-50 px-3 py-2 text-sm text-green-800">
                  Validation manuelle obligatoire des prestataires avant publication.
                </p>
              </Card>
            </div>

            <div className="mt-6">
              <HeroSearch lang={lang} />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-4 sm:py-8">
        <Container>
          <ProviderMapSplit lang={lang} providers={providerItems} parkingListings={parkingListings} partners={partners} />
        </Container>
      </section>

      <section className="py-8 sm:py-12">
        <Container className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Catégories les plus demandées</h2>
            <Link href="/catalogue" className="text-sm font-medium text-blue-700 hover:text-blue-800">Voir tout le catalogue</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {categoryHighlights.slice(0, 8).map((category) => (
              <Card key={category.id} className="premium-card p-5">
                <p className="text-sm text-slate-500">{category.label}</p>
                <p className="mt-1 text-2xl font-bold text-green-700">dès {category.fromPrice} CHF</p>
                <Button asChild variant="outline" className="mt-4 h-10 rounded-lg border-blue-200 text-blue-700">
                  <Link href={`/trouver-un-prestataire?categorie=${encodeURIComponent(category.label)}`}>Demander</Link>
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-8 sm:py-12">
        <Container className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {trustPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card key={pillar.title} className="premium-card p-5">
                <Icon className="h-5 w-5 text-blue-700" />
                <p className="mt-3 font-semibold text-slate-900">{pillar.title}</p>
                <p className="mt-1 text-sm text-slate-600">{pillar.detail}</p>
              </Card>
            );
          })}
        </Container>
      </section>

      <section className="py-8 sm:py-12">
        <Container className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Avis clients</h2>
          {socialProof.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {socialProof.map((review) => (
                <Card key={review.name} className="premium-card p-5">
                  <p className="text-sm text-slate-700">{review.text}</p>
                  <p className="mt-3 text-sm font-semibold text-slate-900">{review.name}</p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
              Les premiers avis vérifiés seront affichés ici dès les premières missions complétées.
            </Card>
          )}
        </Container>
      </section>

      <section className="py-8 sm:py-12">
        <Container className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Près de chez vous</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {swissCityTargets.slice(0, 6).map((city) => (
              <Card key={city.slug} className="premium-card p-4">
                <p className="font-semibold text-slate-900">{city.name} ({city.canton})</p>
                <p className="text-sm text-slate-600">Services disponibles autour du NPA {city.postalCode}.</p>
                <Link className="mt-2 inline-flex text-sm font-semibold text-blue-700 hover:underline" href={`/services/menage/${city.slug}`}>
                  Voir les services locaux
                </Link>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-8 sm:py-12">
        <Container className="grid gap-6 lg:grid-cols-3">
          <Card className="section-shell p-6 lg:col-span-2">
            <h3 className="text-2xl font-semibold text-slate-900">Vous êtes prestataire en Suisse ?</h3>
            <p className="mt-2 text-slate-600">
              Rejoignez PrèsDeToi avec un dossier structuré, validation manuelle et cadre clair d'intermédiation.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>- Candidature en ligne et upload de justificatifs.</li>
              <li>- Statuts de validation lisibles dans votre espace prestataire.</li>
              <li>- Activation uniquement après contrôle admin autorisé.</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-xl bg-green-600 hover:bg-green-700">
                <Link href="/devenir-prestataire">Déposer mon dossier</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50">
                <Link href="/conditions-prestataires">Lire les conditions prestataires</Link>
              </Button>
            </div>
          </Card>

          <Card className="premium-card border-green-100 bg-green-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">Assistance humaine</p>
            <p className="mt-2 text-xl font-semibold text-green-900">Besoin d'aide pour réserver ?</p>
            <p className="mt-2 text-sm text-green-800">
              Notre équipe peut vous rappeler pour vous guider simplement.
            </p>
            <Button asChild className="mt-4 h-10 rounded-xl bg-green-700 hover:bg-green-800">
              <Link href="/hotline">Demander un rappel</Link>
            </Button>
          </Card>
        </Container>
      </section>

      <div className="fixed inset-x-0 bottom-20 z-40 px-4 md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
          <Button asChild className="h-11 rounded-xl bg-green-600 hover:bg-green-700">
            <Link href="/trouver-un-prestataire">Réserver</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 rounded-xl border-blue-200 bg-white text-blue-700 hover:bg-blue-50">
            <Link href="/devenir-prestataire">Devenir prestataire</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
