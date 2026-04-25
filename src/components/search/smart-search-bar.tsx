"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Search } from "lucide-react";

import { SearchSuggestions } from "@/components/search/search-suggestions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SuggestResponse = {
  success: boolean;
  data?: {
    detected: {
      city: string | null;
      postalCode: string | null;
      tags: string[];
      categorySlugs: string[];
    };
    suggestions: {
      categories: Array<{ slug: string; label: string; fromPrice: number; reason: string }>;
      tags: Array<{ tag: string; label: string }>;
      cities: Array<{ city: string; postalCode: string; canton: string }>;
      services: Array<{ slug: string; title: string; categorySlug: string; fromPrice: number }>;
      providers: Array<{ id: string; name: string; city: string; rating: number; fromPrice: number; isAvailableNow: boolean }>;
    };
  };
};

type SuggestionData = NonNullable<SuggestResponse["data"]>;

type Props = {
  className?: string;
  initialQuery?: string;
  initialCity?: string;
  submitLabel?: string;
  showSuggestions?: boolean;
};

function parsePostalCode(cityValue: string) {
  return cityValue.match(/\b\d{4}\b/)?.[0] ?? "";
}

export function SmartSearchBar({
  className,
  initialQuery = "",
  initialCity = "St-Prex, 1162",
  submitLabel = "Rechercher",
  showSuggestions = true,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionData["suggestions"] | null>(null);
  const [detected, setDetected] = useState<SuggestionData["detected"] | null>(null);

  const effectiveQuery = useMemo(() => query.trim(), [query]);
  const effectiveCity = useMemo(() => city.trim(), [city]);

  useEffect(() => {
    if (!showSuggestions) return;
    if (effectiveQuery.length < 2 && effectiveCity.length < 2) {
      setSuggestions(null);
      setDetected(null);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("mode", "suggest");
        params.set("limit", "8");
        if (effectiveQuery.length > 0) params.set("q", effectiveQuery);
        if (effectiveCity.length > 0) {
          params.set("city", effectiveCity);
          const npa = parsePostalCode(effectiveCity);
          if (npa) params.set("npa", npa);
        }

        const response = await fetch(`/api/search?${params.toString()}`, {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = (await response.json()) as SuggestResponse;
        if (!payload.success || !payload.data) return;
        setSuggestions(payload.data.suggestions);
        setDetected(payload.data.detected);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [effectiveQuery, effectiveCity, showSuggestions]);

  function submitSearch() {
    const params = new URLSearchParams();
    if (effectiveQuery.length > 0) params.set("q", effectiveQuery);
    if (effectiveCity.length > 0) {
      params.set("city", effectiveCity);
      const npa = parsePostalCode(effectiveCity);
      if (npa) params.set("npa", npa);
    }
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <Card className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_260px_auto]">
          <div>
            <label htmlFor="smart-search-query" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              De quel service avez-vous besoin ?
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="smart-search-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ex: promener mon chien, cours informatique senior, montage armoire IKEA"
                className="h-12 pl-10 text-base"
              />
            </div>
          </div>

          <div>
            <label htmlFor="smart-search-city" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ville ou NPA
            </label>
            <Input
              id="smart-search-city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="St-Prex, 1162"
              className="h-12 text-base"
            />
          </div>

          <div className="flex items-end gap-2">
            <Button type="button" onClick={submitSearch} className="h-12 rounded-xl bg-green-600 px-6 text-base hover:bg-green-700">
              {submitLabel}
            </Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span>Recherche intelligente par tags, catégories, ville et disponibilité.</span>
          <span className="rounded-full bg-slate-100 px-2 py-1">CHF</span>
          <span className="rounded-full bg-slate-100 px-2 py-1">Vaud / Suisse romande</span>
        </div>
      </Card>

      {showSuggestions ? (
        <SearchSuggestions
          loading={loading}
          suggestions={suggestions}
          detected={detected}
          onApply={({ query: nextQuery, city: nextCity }) => {
            if (typeof nextQuery === "string") setQuery(nextQuery);
            if (typeof nextCity === "string") setCity(nextCity);
          }}
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50">
          <Link href="/trouver-un-prestataire">Créer une demande personnalisée</Link>
        </Button>
      </div>
    </div>
  );
}
