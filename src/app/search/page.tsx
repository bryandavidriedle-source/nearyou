import Link from "next/link";
import type { Metadata } from "next";

import { SmartSearchBar } from "@/components/search/smart-search-bar";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { pageMetadata } from "@/lib/site";
import { getSmartSearchResult } from "@/lib/search/smart-search";

export const metadata: Metadata = pageMetadata({
  title: "Recherche intelligente | PrèsDeToi",
  description: "Trouvez rapidement un prestataire local par intention, tags, ville et disponibilité.",
  path: "/search",
});

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
    city?: string;
    npa?: string;
    minRating?: string;
    maxPrice?: string;
    availableNow?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = (params?.q ?? "").trim();
  const city = (params?.city ?? "").trim();
  const npa = (params?.npa ?? "").trim();
  const minRating = Number(params?.minRating ?? "");
  const maxPrice = Number(params?.maxPrice ?? "");
  const availableNow = (params?.availableNow ?? "").toLowerCase() === "true";

  const result = await getSmartSearchResult({
    query,
    city: city || undefined,
    postalCode: npa || undefined,
    minRating: Number.isFinite(minRating) ? minRating : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
    availableNow,
    limit: 24,
    sourcePage: "search_page",
    logQuery: query.length >= 2,
  });

  return (
    <section className="py-10">
      <Container className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Recherche intelligente</h1>
          <p className="text-slate-600">
            Décrivez votre besoin naturellement. Nous détectons les services, tags et zones proches pour proposer les meilleurs profils.
          </p>
        </div>

        <SmartSearchBar initialQuery={query} initialCity={city || "St-Prex, 1162"} submitLabel="Relancer la recherche" />

        <Card className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold">Détection:</span>
            {result.detected.city ? <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Ville: {result.detected.city}</Badge> : null}
            {result.detected.postalCode ? <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">NPA: {result.detected.postalCode}</Badge> : null}
            {result.detected.tags.slice(0, 6).map((tag) => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
            {result.detected.tags.length === 0 ? <span>Aucun tag précis détecté.</span> : null}
          </div>
        </Card>

        {result.providers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.providers.map((provider) => (
              <Card key={provider.id} className="premium-card space-y-3 p-5">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{provider.name}</p>
                  <p className="text-sm text-slate-600">
                    {provider.city}
                    {provider.postalCode ? ` (${provider.postalCode})` : ""} · {provider.rating.toFixed(1)} / 5 · {provider.completedMissions} missions
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{provider.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {provider.badges.map((badge) => (
                    <Badge key={`${provider.id}-${badge}`} variant="secondary">
                      {badge}
                    </Badge>
                  ))}
                  {provider.categories.slice(0, 3).map((category) => (
                    <Badge key={`${provider.id}-${category}`} className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      {category}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm font-semibold text-green-700">Dès {provider.fromPrice} CHF/h</p>
                <div className="flex gap-2">
                  <Button asChild className="rounded-xl bg-green-600 hover:bg-green-700">
                    <Link href={provider.bookingUrl}>Réserver</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50">
                    <Link href={provider.profileUrl}>Voir profil</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border border-dashed border-slate-300 bg-white p-6">
            <p className="text-lg font-semibold text-slate-900">Aucune correspondance exacte</p>
            <p className="mt-1 text-sm text-slate-600">{result.fallback.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {result.fallback.suggestedCategories.map((category) => (
                <Button key={category.slug} asChild variant="outline" className="rounded-lg border-blue-200 text-blue-700">
                  <Link href={`/services/${category.slug}/st-prex`}>
                    {category.label} · dès {category.fromPrice} CHF
                  </Link>
                </Button>
              ))}
            </div>
            <div className="mt-4">
              <Button asChild className="rounded-xl bg-green-600 hover:bg-green-700">
                <Link href={result.fallback.customRequestUrl}>Créer une demande personnalisée</Link>
              </Button>
            </div>
          </Card>
        )}
      </Container>
    </section>
  );
}
