import Link from "next/link";

import { CheckCircle2, Clock3, ShieldCheck, UsersRound } from "lucide-react";

import { HeroSearch } from "@/components/nearyou/hero-search";
import { ProviderMapSplit } from "@/components/nearyou/provider-map-split";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getHomeData } from "@/lib/db";
import { messages } from "@/lib/i18n";
import { getCurrentLanguage } from "@/lib/i18n-server";
import { priceHighlights, siteConfig } from "@/lib/site";

const trustPillars = [
  { icon: ShieldCheck, title: "Prestataires verifies", detail: "Validation documentaire et controle manuel avant activation." },
  { icon: Clock3, title: "Reponse rapide", detail: "Demande traitee rapidement avec suivi clair dans votre espace client." },
  { icon: UsersRound, title: "Approche humaine", detail: "Equipe locale disponible par email, telephone et WhatsApp." },
  { icon: CheckCircle2, title: "Cadre suisse prudent", detail: "NearYou est une plateforme d'intermediation, pas un employeur." },
];

const socialProof = [
  { name: "Sophie M. - Lausanne", text: "Processus clair et tres rassurant. Prestataire ponctuel et professionnel." },
  { name: "Marc T. - Renens", text: "J'ai reserve pour ma mere en quelques minutes, avec rappel humain ensuite." },
  { name: "Claire B. - Pully", text: "Bonne experience mobile. Demande simple, statut visible et support reactif." },
];

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
          id: `fallback-${index}`,
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
      providerName: `${mission.provider.profile?.firstName ?? ""} ${mission.provider.profile?.lastName ?? ""}`.trim(),
      providerAvatar: mission.provider.profile?.avatarUrl ?? "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      rating: mission.provider.profile?.rating ?? 4.7,
      completedMissions: mission.provider.profile?.completedMissions ?? 0,
      providerScore: mission.provider.profile?.providerScore ?? 82,
    }));

  return (
    <>
      <section className="py-8 sm:py-12">
        <Container className="space-y-6">
          <div className="section-shell overflow-hidden p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{m.home.badge}</Badge>
                <h1 className="text-balance text-4xl font-bold text-slate-900 sm:text-5xl">{m.home.title}</h1>
                <p className="max-w-2xl text-lg text-slate-600">{m.home.subtitle}</p>

                <div className="flex flex-wrap gap-2">
                  {m.home.actions.map((action) => (
                    <span key={action} className="trust-chip">{action}</span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild className="h-12 rounded-xl bg-green-600 px-6 text-base hover:bg-green-700">
                    <Link href="/trouver-un-prestataire">Demander un service</Link>
                  </Button>
                  <Button asChild variant="outline" className="h-12 rounded-xl border-blue-200 px-6 text-base text-blue-700 hover:bg-blue-50">
                    <Link href="/devenir-prestataire">Devenir prestataire</Link>
                  </Button>
                </div>
                <p className="text-sm text-slate-500">Operation pilote a {siteConfig.city}. Extension progressive en Suisse romande.</p>
              </div>

              <Card className="premium-card border-blue-100 p-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Comment ca marche</p>
                <ol className="mt-3 space-y-3 text-sm text-slate-600">
                  <li>1. Vous decrivez votre besoin en moins de 2 minutes.</li>
                  <li>2. NearYou propose des prestataires verifies et disponibles.</li>
                  <li>3. Vous confirmez votre reservation avec suivi transparent.</li>
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
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Categories les plus demandees</h2>
          <Link href="/catalogue" className="text-sm font-medium text-blue-700 hover:text-blue-800">Voir tout le catalogue</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {categoryHighlights.slice(0, 8).map((category) => (
              <Card key={category.id} className="premium-card p-5">
                <p className="text-sm text-slate-500">{category.label}</p>
                <p className="mt-1 text-2xl font-bold text-green-700">des {category.fromPrice} CHF</p>
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
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Avis clients verifies</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {socialProof.map((review) => (
              <Card key={review.name} className="premium-card p-5">
                <p className="text-sm text-slate-700">{review.text}</p>
                <p className="mt-3 text-sm font-semibold text-slate-900">{review.name}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-8 sm:py-12">
        <Container className="grid gap-6 lg:grid-cols-3">
          <Card className="section-shell p-6 lg:col-span-2">
            <h3 className="text-2xl font-semibold text-slate-900">Vous etes prestataire independant en Suisse ?</h3>
            <p className="mt-2 text-slate-600">
              Rejoignez NearYou avec un dossier structure, validation manuelle et cadre clair d'intermediation.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>- Candidature en ligne et upload de justificatifs.</li>
              <li>- Statuts de validation lisibles dans votre espace prestataire.</li>
              <li>- Activation uniquement apres controle admin autorise.</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-xl bg-green-600 hover:bg-green-700">
                <Link href="/devenir-prestataire">Deposer mon dossier</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50">
                <Link href="/conditions-prestataires">Lire les conditions prestataires</Link>
              </Button>
            </div>
          </Card>

          <Card className="premium-card border-green-100 bg-green-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">Assistance humaine</p>
            <p className="mt-2 text-xl font-semibold text-green-900">Besoin d'aide pour reserver ?</p>
            <p className="mt-2 text-sm text-green-800">
              Notre equipe peut vous rappeler pour vous guider de facon simple.
            </p>
            <Button asChild className="mt-4 h-10 rounded-xl bg-green-700 hover:bg-green-800">
              <Link href="/hotline">Demander un rappel</Link>
            </Button>
          </Card>
        </Container>
      </section>
    </>
  );
}
