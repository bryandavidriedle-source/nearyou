"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type SuggestionPayload = {
  categories: Array<{ slug: string; label: string; fromPrice: number; reason: string }>;
  tags: Array<{ tag: string; label: string }>;
  cities: Array<{ city: string; postalCode: string; canton: string }>;
  services: Array<{ slug: string; title: string; categorySlug: string; fromPrice: number }>;
  providers: Array<{ id: string; name: string; city: string; rating: number; fromPrice: number; isAvailableNow: boolean }>;
};

type DetectedPayload = {
  city: string | null;
  postalCode: string | null;
  tags: string[];
  categorySlugs: string[];
};

type Props = {
  loading: boolean;
  suggestions: SuggestionPayload | null;
  detected: DetectedPayload | null;
  onApply: (next: { query?: string; city?: string }) => void;
};

export function SearchSuggestions({ loading, suggestions, detected, onApply }: Props) {
  if (loading) {
    return (
      <Card className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-500">Recherche intelligente en cours...</p>
      </Card>
    );
  }

  if (!suggestions) return null;

  const hasContent =
    suggestions.categories.length > 0 ||
    suggestions.tags.length > 0 ||
    suggestions.cities.length > 0 ||
    suggestions.services.length > 0 ||
    suggestions.providers.length > 0;

  if (!hasContent) return null;

  return (
    <Card className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {detected ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          {detected.city ? <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Zone: {detected.city}</Badge> : null}
          {detected.postalCode ? <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">NPA: {detected.postalCode}</Badge> : null}
          {detected.tags.slice(0, 5).map((tag) => (
            <Badge key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        {suggestions.categories.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Catégories suggérées</p>
            {suggestions.categories.slice(0, 4).map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => onApply({ query: category.label })}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 hover:border-blue-300 hover:text-blue-700"
              >
                {category.label} · dès {category.fromPrice} CHF
              </button>
            ))}
          </div>
        ) : null}

        {suggestions.services.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Services populaires</p>
            {suggestions.services.slice(0, 4).map((service) => (
              <button
                key={service.slug}
                type="button"
                onClick={() => onApply({ query: service.title })}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 hover:border-blue-300 hover:text-blue-700"
              >
                {service.title} · dès {service.fromPrice} CHF
              </button>
            ))}
          </div>
        ) : null}

        {suggestions.cities.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Villes proches</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.cities.slice(0, 6).map((city) => (
                <button
                  key={`${city.city}-${city.postalCode}`}
                  type="button"
                  onClick={() => onApply({ city: `${city.city}, ${city.postalCode}` })}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:border-blue-300 hover:text-blue-700"
                >
                  {city.city} ({city.postalCode})
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {suggestions.providers.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prestataires disponibles</p>
            {suggestions.providers.slice(0, 3).map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => onApply({ query: provider.name, city: provider.city })}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 hover:border-blue-300 hover:text-blue-700"
              >
                {provider.name} · {provider.city} · {provider.fromPrice} CHF/h
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
