import Link from "next/link";
import type { Metadata } from "next";

import { ProviderCard } from "@/components/provider/provider-card";
import { SmartSearchBar } from "@/components/search/smart-search-bar";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { pageMetadata } from "@/lib/site";
import { getSmartSearchResult } from "@/lib/search/smart-search";

export const metadata: Metadata = pageMetadata({
  title: "Recherche intelligente | PrèsDeToi",
  description: "Trouvez rapidement un prestataire local par besoin, tags, ville et disponibilités.",
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
  const hasRecognizedNeed =
    result.detected.categorySlugs.length > 0 ||
    result.detected.serviceSlugs.length > 0 ||
    result.suggestions.categories.length > 0 ||
    result.suggestions.services.length > 0;

  return (
    <section className="py-10">
      <Container className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Trouvez un prestataire fiable rapidement</h1>
          <p className="text-slate-600">
            Décrivez votre besoin naturellement. Nous détectons les services, tags et zones proches pour vous proposer
            les meilleurs profils.
          </p>
        </div>

        <SmartSearchBar initialQuery={query} initialCity={city || "St-Prex, 1162"} submitLabel="Décrire mon besoin" />

        <Card className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold">Détection :</span>
            {result.detected.city ? (
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Ville : {result.detected.city}</Badge>
            ) : null}
            {result.detected.postalCode ? (
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">NPA : {result.detected.postalCode}</Badge>
            ) : null}
            {result.detected.tags.slice(0, 6).map((tag) => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
            {result.detected.tags.length === 0 ? <span>Aucun tag précis détecté.</span> : null}
          </div>
        </Card>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">Prestataires disponibles</h2>
          {result.providers.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {result.providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  id={provider.id}
                  name={provider.name}
                  avatarUrl={provider.avatarUrl}
                  city={provider.city}
                  distanceKm={provider.distanceKm}
                  rating={provider.rating}
                  reviewCount={provider.completedMissions}
                  fromPrice={provider.fromPrice}
                  isAvailableNow={provider.isAvailableNow}
                  isVerified={provider.badges.includes("Vérifié") || provider.badges.includes("Verifie")}
                  badges={provider.badges.filter((badge) => badge !== "Vérifié")}
                  categories={provider.categories}
                  bookingUrl={provider.bookingUrl}
                  profileUrl={provider.profileUrl}
                />
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl border border-dashed border-slate-300 bg-white p-6">
              <p className="text-lg font-semibold text-slate-900">
                {hasRecognizedNeed ? "Besoin identifié" : "Aucune correspondance exacte"}
              </p>
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
            </Card>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">Créer une demande personnalisée</h2>
          <Card className="rounded-2xl border border-green-100 bg-green-50 p-5">
            <p className="text-sm text-green-900">
              Vous ne trouvez pas exactement votre besoin ? Décrivez votre demande en quelques lignes, nous vous aidons
              à trouver le bon prestataire.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild className="rounded-xl bg-green-600 hover:bg-green-700">
                <Link href="/demande">Créer une demande personnalisée</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50">
                <Link href="/devenir-prestataire">Devenir prestataire</Link>
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
