import Link from "next/link";

import { ProviderMapSplit } from "@/components/nearyou/provider-map-split";
import { SmartSearchBar } from "@/components/search/smart-search-bar";
import { HowItWorks } from "@/components/sections/how-it-works";
import { TrustBadges } from "@/components/sections/trust-badges";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { swissCityTargets } from "@/lib/constants";
import { getHomeData } from "@/lib/db";
import { getCurrentLanguage } from "@/lib/i18n-server";
import { priceHighlights, siteConfig } from "@/lib/site";

const socialProof: Array<{ name: string; text: string }> = [];

export default async function HomePage() {
  const lang = await getCurrentLanguage();
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
      providerAvatar:
        mission.provider.profile?.avatarUrl ??
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      rating: mission.provider.profile?.rating ?? 0,
      completedMissions: mission.provider.profile?.completedMissions ?? 0,
      providerScore: mission.provider.profile?.providerScore ?? 0,
    }));

  return (
    <>
      <section className="py-8 sm:py-12">
        <Container className="space-y-6">
          <div className="section-shell overflow-hidden p-6 sm:p-8">
            <div className="space-y-5">
              <h1 className="max-w-4xl text-balance text-4xl font-bold text-slate-900 sm:text-5xl">
                Décrivez votre besoin, trouvez une aide fiable près de chez vous
              </h1>
              <p className="max-w-3xl text-lg text-slate-600">
                Ménage, jardin, informatique, animaux, courses ou accompagnement: comparez les profils validés ou
                créez une demande personnalisée si aucun prestataire ne correspond encore.
              </p>
              <SmartSearchBar submitLabel="Décrire mon besoin" initialCity={siteConfig.city} />
              <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                <p className="rounded-xl bg-slate-50 px-3 py-2">1. Je décris mon besoin</p>
                <p className="rounded-xl bg-slate-50 px-3 py-2">2. Je vois des prestataires ou je crée une demande</p>
                <p className="rounded-xl bg-slate-50 px-3 py-2">3. Je réserve avec accompagnement humain</p>
              </div>
              <p className="text-sm text-slate-500">
                Vérification manuelle, avis modérés, support humain et paiement sécurisé.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-2 sm:py-4">
        <Container>
          <TrustBadges />
        </Container>
      </section>

      <section className="py-8 sm:py-10">
        <Container className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">Comment ça marche ?</h2>
            <Link href="/comment-ca-marche" className="text-sm font-medium text-blue-700 hover:text-blue-800">
              Voir le détail
            </Link>
          </div>
          <HowItWorks />
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
            <Link href="/catalogue" className="text-sm font-medium text-blue-700 hover:text-blue-800">
              Voir tout le catalogue
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {categoryHighlights.slice(0, 8).map((category) => (
              <Card key={category.id} className="premium-card p-5">
                <p className="text-sm text-slate-500">{category.label}</p>
                <p className="mt-1 text-2xl font-bold text-green-700">dès {category.fromPrice} CHF</p>
                <Button asChild variant="outline" className="mt-4 h-10 rounded-lg border-blue-200 text-blue-700">
                  <Link href={`/search?q=${encodeURIComponent(category.label)}`}>Voir les prestataires</Link>
                </Button>
              </Card>
            ))}
          </div>
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
                <p className="font-semibold text-slate-900">
                  {city.name} ({city.canton})
                </p>
                <p className="text-sm text-slate-600">Services disponibles autour du NPA {city.postalCode}.</p>
                <Link
                  className="mt-2 inline-flex text-sm font-semibold text-blue-700 hover:underline"
                  href={`/services/menage/${city.slug}`}
                >
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
            <p className="mt-2 text-sm text-green-800">Notre équipe peut vous rappeler pour vous guider simplement.</p>
            <Button asChild className="mt-4 h-10 rounded-xl bg-green-700 hover:bg-green-800">
              <Link href="/hotline">Demander un rappel</Link>
            </Button>
          </Card>
        </Container>
      </section>

    </>
  );
}

