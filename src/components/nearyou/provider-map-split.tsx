"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Image from "next/image";

import { Star } from "lucide-react";

import { ProviderMap } from "@/components/nearyou/provider-map";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { messages, type Language } from "@/lib/i18n";

type ProviderItem = {
  id: string;
  title: string;
  fromPrice: number;
  category: string;
  distanceKm: number | null;
  isAvailableToday: boolean;
  badge: string | null;
  lat: number;
  lng: number;
  providerName: string;
  providerAvatar: string;
  rating: number;
  completedMissions: number;
  providerScore: number;
};

type ParkingItem = {
  id: string;
  title: string;
  city: string;
  dayPrice: number;
  hasPower: boolean;
  lat: number;
  lng: number;
};

type PartnerItem = {
  id: string;
  name: string;
  type: string;
  city: string;
  lat: number;
  lng: number;
};

type Props = {
  lang: Language;
  providers: ProviderItem[];
  parkingListings: ParkingItem[];
  partners: PartnerItem[];
};

export function ProviderMapSplit({ lang, providers, parkingListings, partners }: Props) {
  const m = messages[lang];
  const [radiusKm, setRadiusKm] = useState(10);
  const [priceLimit, setPriceLimit] = useState(80);
  const [onlyToday, setOnlyToday] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(providers[0]?.id ?? null);

  const categories = useMemo(() => Array.from(new Set(providers.map((p) => p.category))), [providers]);

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const byRadius = provider.distanceKm == null ? true : provider.distanceKm <= radiusKm;
      const byPrice = provider.fromPrice <= priceLimit;
      const byAvailability = onlyToday ? provider.isAvailableToday : true;
      const byCategory = categoryFilter === "all" ? true : provider.category === categoryFilter;
      const bySearch =
        search.length === 0
          ? true
          : `${provider.title} ${provider.providerName}`.toLowerCase().includes(search.toLowerCase());

      return byRadius && byPrice && byAvailability && byCategory && bySearch;
    });
  }, [providers, radiusKm, priceLimit, onlyToday, categoryFilter, search]);

  const markers = useMemo(
    () => [
      ...filteredProviders.map((provider) => ({
        id: provider.id,
        lat: provider.lat,
        lng: provider.lng,
        type: "provider" as const,
        label: provider.providerName,
      })),
      ...parkingListings.map((parking) => ({
        id: parking.id,
        lat: parking.lat,
        lng: parking.lng,
        type: "parking" as const,
        label: `${parking.title} (${parking.dayPrice} CHF)`,
      })),
      ...partners.map((partner) => ({
        id: partner.id,
        lat: partner.lat,
        lng: partner.lng,
        type: "partner" as const,
        label: partner.name,
      })),
    ],
    [filteredProviders, parkingListings, partners],
  );

  const today = new Date();
  const upcomingDates = Array.from({ length: 4 }, (_, index) => {
    const d = new Date(today);
    d.setDate(today.getDate() + index);
    return d.toLocaleDateString("fr-CH", { day: "2-digit", month: "short" });
  });

  if (providers.length === 0) {
    return (
      <section className="space-y-4">
        <Card className="rounded-2xl border border-dashed border-blue-200 bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Aucun prestataire disponible pour le moment</p>
          <p className="mt-2 text-sm text-slate-600">Les premiers prestataires arrivent bientôt dans votre zone.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button asChild className="rounded-xl bg-green-600 hover:bg-green-700">
              <Link href="/trouver-un-prestataire">Faire une demande</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl border-blue-200 text-blue-700">
              <Link href="/devenir-prestataire">Devenir prestataire</Link>
            </Button>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-5">
          <div>
            <label className="text-xs font-semibold text-slate-500">{m.map.radius}</label>
            <Input
              type="number"
              min={1}
              max={30}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="h-10"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">{m.map.maxPrice}</label>
            <Input
              type="number"
              min={10}
              max={200}
              value={priceLimit}
              onChange={(e) => setPriceLimit(Number(e.target.value))}
              className="h-10"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">{m.map.category}</label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">{m.map.allCategories}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">{m.map.search}</label>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={m.map.nameOrService} className="h-10" />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant={onlyToday ? "default" : "outline"}
              className="h-10 w-full"
              onClick={() => setOnlyToday((prev) => !prev)}
            >
              {onlyToday ? m.map.todayOnly : m.map.anyAvailability}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="max-h-[700px] space-y-4 overflow-auto pr-1">
          {filteredProviders.map((provider) => {
            const hasValidPublicId = Boolean(provider.id);
            return (
              <Card
                key={provider.id}
                className={`rounded-2xl border bg-white p-4 shadow-sm transition ${selectedProviderId === provider.id ? "border-blue-300 ring-2 ring-blue-100" : "border-slate-200"}`}
              >
              <button
                type="button"
                onClick={() => setSelectedProviderId(provider.id)}
                className="w-full text-left"
                aria-label={`Sélectionner ${provider.providerName}`}
              >
                <div className="flex gap-3">
                  <Image src={provider.providerAvatar} alt={provider.providerName} width={80} height={80} className="h-20 w-20 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-slate-900">{provider.providerName}</h3>
                      <p className="text-sm font-semibold text-green-700">
                        {m.map.from} {provider.fromPrice} CHF
                      </p>
                    </div>
                    <p className="text-sm text-slate-600">{provider.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{" "}
                        {provider.rating > 0 ? provider.rating.toFixed(1) : "Nouveau"}
                      </span>
                      <span className="rounded-full bg-blue-100 px-2 py-1 font-semibold text-blue-700">
                        Score {provider.providerScore}/100
                      </span>
                      <span>
                        {provider.completedMissions} {m.map.missions}
                      </span>
                      {provider.distanceKm != null ? (
                        <span>
                          {provider.distanceKm.toFixed(1)} {m.map.km}
                        </span>
                      ) : null}
                      {provider.isAvailableToday ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Disponible maintenant</Badge>
                      ) : null}
                      {provider.badge ? <Badge variant="secondary">{provider.badge}</Badge> : null}
                    </div>
                  </div>
                </div>
                  </button>
                <div className="mt-3 flex flex-wrap gap-2">
                  {upcomingDates.map((date) => (
                    <button
                      key={`${provider.id}-${date}`}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-blue-300 hover:text-blue-700"
                    >
                      {date}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  {hasValidPublicId ? (
                    <>
                      <Button asChild className="rounded-xl bg-green-600 hover:bg-green-700">
                        <Link href={`/reserve/${provider.id}`}>{m.map.bookNow}</Link>
                      </Button>
                      <Button asChild variant="outline" className="rounded-xl border-blue-200 text-blue-700">
                        <Link href={`/providers/${provider.id}`}>{m.map.viewProfile}</Link>
                      </Button>
                    </>
                  ) : (
                    <Button asChild className="rounded-xl bg-green-600 hover:bg-green-700">
                      <Link href="/trouver-un-prestataire">Faire une demande</Link>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
          {filteredProviders.length === 0 ? (
            <Card className="rounded-2xl border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
              <p>{m.map.noMatch}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild size="sm" className="rounded-lg bg-green-600 hover:bg-green-700">
                  <Link href="/trouver-un-prestataire">Faire une demande</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-lg border-blue-200 text-blue-700">
                  <Link href="/devenir-prestataire">Devenir prestataire</Link>
                </Button>
              </div>
            </Card>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600 shadow">{m.map.mapLegend}</div>
          <ProviderMap markers={markers} selectedId={selectedProviderId} onSelect={setSelectedProviderId} />
        </div>
      </div>
    </section>
  );
}
