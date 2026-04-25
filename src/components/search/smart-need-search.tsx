"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { MapPin, Search } from "lucide-react";

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

type SmartNeedSearchProps = {
  className?: string;
  initialQuery?: string;
  initialCity?: string;
  submitLabel?: string;
  showSuggestions?: boolean;
  showExamples?: boolean;
  primaryActionHref?: string;
};

const QUICK_NEEDS = [
  "Promener mon chien",
  "Nettoyer mon appartement",
  "Monter un meuble",
  "Aider un proche",
  "Cours informatique",
  "Tondre le jardin",
];

function parsePostalCode(cityValue: string) {
  return cityValue.match(/\b\d{4}\b/)?.[0] ?? "";
}

export function SmartNeedSearch({
  className,
  initialQuery = "",
  initialCity = "",
  submitLabel = "Décrire mon besoin",
  showSuggestions = true,
  showExamples = true,
  primaryActionHref = "/demande",
}: SmartNeedSearchProps) {
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

  function buildParams() {
    const params = new URLSearchParams();
    if (effectiveQuery.length > 0) params.set("q", effectiveQuery);
    if (effectiveCity.length > 0) {
      params.set("city", effectiveCity);
      const npa = parsePostalCode(effectiveCity);
      if (npa) params.set("npa", npa);
    }
    return params;
  }

  function goToNeedFlow() {
    const params = buildParams();
    const qs = params.toString();
    router.push(qs ? `${primaryActionHref}?${qs}` : primaryActionHref);
  }

  function goToProviders() {
    const params = buildParams();
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  }

  function applyQuickNeed(label: string) {
    setQuery(label);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <Card className="rounded-3xl border border-blue-100 bg-white p-4 shadow-md sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1.15fr_0.75fr_auto_auto]">
          <div>
            <label htmlFor="need-query" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              De quoi avez-vous besoin ?
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="need-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="De quoi avez-vous besoin ?"
                className="h-12 rounded-xl pl-10 text-base"
              />
            </div>
          </div>

          <div>
            <label htmlFor="need-city" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Ville ou NPA
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="need-city"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="Ville ou NPA"
                className="h-12 rounded-xl pl-10 text-base"
              />
            </div>
          </div>

          <div className="flex items-end">
            <Button type="button" onClick={goToNeedFlow} className="h-12 w-full rounded-xl bg-green-600 px-6 text-base hover:bg-green-700">
              {submitLabel}
            </Button>
          </div>

          <div className="flex items-end">
            <Button type="button" onClick={goToProviders} variant="outline" className="h-12 w-full rounded-xl border-blue-200 px-6 text-base text-blue-700 hover:bg-blue-50">
              Voir les prestataires disponibles
            </Button>
          </div>
        </div>

        {showExamples ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_NEEDS.map((need) => (
              <button
                key={need}
                type="button"
                onClick={() => applyQuickNeed(need)}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
              >
                {need}
              </button>
            ))}
          </div>
        ) : null}
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
        <Button asChild variant="ghost" className="h-9 rounded-xl px-3 text-sm text-slate-600 hover:bg-slate-100">
          <Link href="/demande">Je ne trouve pas mon besoin</Link>
        </Button>
      </div>
    </div>
  );
}
