import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SmartSearchBar } from "@/components/search/smart-search-bar";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { findCategoryBySlug, findCityBySlug, SERVICE_CATEGORIES, SWISS_CITY_TARGETS } from "@/lib/catalog";
import { getHomeData } from "@/lib/db";
import { pageMetadata } from "@/lib/site";

type Params = {
  category: string;
  city: string;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function generateStaticParams(): Params[] {
  return SERVICE_CATEGORIES.flatMap((category) =>
    SWISS_CITY_TARGETS.map((city) => ({
      category: category.slug,
      city: city.slug,
    })),
  );
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolved = await params;
  const category = findCategoryBySlug(resolved.category);
  const city = findCityBySlug(resolved.city);

  if (!category || !city) {
    return pageMetadata({
      title: "Service local | PrèsDeToi",
      description: "Prestataires locaux et réservations sécurisées en Suisse.",
      path: "/services",
    });
  }

  return pageMetadata({
    title: `${category.label} à ${city.name} | PrèsDeToi`,
    description: `Réservez un service de ${category.label.toLowerCase()} à ${city.name} (${city.canton}) avec des prestataires vérifiés.`,
    path: `/services/${category.slug}/${city.slug}`,
  });
}

export default async function LocalServicePage({ params }: { params: Promise<Params> }) {
  const resolved = await params;
  const category = findCategoryBySlug(resolved.category);
  const city = findCityBySlug(resolved.city);

  if (!category || !city) {
    notFound();
  }

  const { missions } = await getHomeData();
  const normalizedCity = normalize(city.name);
  const normalizedCategory = normalize(category.label);
  const providers = missions
    .filter((mission) => mission.provider.profile)
    .filter((mission) => {
      const missionCategory = normalize(mission.category.name);
      return missionCategory.includes(normalizedCategory) || normalizedCategory.includes(missionCategory);
    })
    .filter((mission) => normalize(mission.city ?? "").includes(normalizedCity));

  return (
    <section className="py-12">
      <Container className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            {category.label} · {city.name} ({city.canton})
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            {category.label} à {city.name}
          </h1>
          <p className="text-slate-600">
            Prestataires locaux vérifiés, réservation encadrée et paiement en CHF.
          </p>
        </div>

        <SmartSearchBar initialQuery={category.label} initialCity={`${city.name}, ${city.postalCode}`} submitLabel="Comparer les prestataires" />

        {providers.length === 0 ? (
          <Card className="rounded-2xl border border-dashed border-blue-200 bg-white p-6">
            <p className="text-lg font-semibold text-slate-900">Aucun prestataire disponible actuellement</p>
            <p className="mt-2 text-sm text-slate-600">
              Les premiers prestataires {category.label.toLowerCase()} arrivent bientôt autour de {city.name}.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild className="rounded-xl bg-green-600 hover:bg-green-700">
                <Link href={`/trouver-un-prestataire?categorie=${encodeURIComponent(category.label)}&ville=${encodeURIComponent(city.name)}`}>
                  Faire une demande
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl border-blue-200 text-blue-700">
                <Link href="/devenir-prestataire">Devenir prestataire</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {providers.map((provider) => {
              const profile = provider.provider.profile;
              if (!profile) return null;

              const providerName = `${profile.firstName} ${profile.lastName}`.trim();
              return (
                <Card key={provider.id} className="premium-card space-y-2 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-lg font-semibold text-slate-900">{providerName}</p>
                    {profile.demoLabel ? <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{profile.demoLabel}</Badge> : null}
                  </div>
                  <p className="text-sm text-slate-600">{provider.title}</p>
                  <p className="text-sm text-slate-500">{provider.city}</p>
                  <p className="text-sm font-semibold text-green-700">dès {provider.fromPrice} CHF</p>
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="rounded-lg bg-green-600 hover:bg-green-700">
                      <Link href={`/reserve/${provider.id}`}>Réserver</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="rounded-lg border-blue-200 text-blue-700">
                      <Link href={`/providers/${provider.id}`}>Voir profil</Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
