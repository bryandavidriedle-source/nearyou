"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { serviceCategories } from "@/lib/constants";
import { messages, type Language } from "@/lib/i18n";

type SearchPayload = {
  service: string;
  address: string;
  date: string;
};

type Props = {
  lang: Language;
  onSearch?: (value: SearchPayload) => void;
};

export function HeroSearch({ lang, onSearch }: Props) {
  const router = useRouter();
  const m = messages[lang];
  const [service, setService] = useState<string>(serviceCategories[0]?.label ?? "Ménage");
  const [address, setAddress] = useState("St-Prex, 1162");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  function handleSearch() {
    const payload = { service, address, date };
    onSearch?.(payload);
    const params = new URLSearchParams({
      categorie: payload.service,
      ville: payload.address,
      date: payload.date,
    });
    router.push(`/trouver-un-prestataire?${params.toString()}`);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationMessage(m.search.geolocationUnsupported);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationMessage(`${m.search.locationCaptured} (${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}).`);
      },
      () => {
        setLocationMessage(m.search.locationDenied);
      },
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-3">
        <select
          value={service}
          onChange={(event) => setService(event.target.value)}
          className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
          aria-label="De quel service avez-vous besoin ?"
        >
          {serviceCategories.map((category) => (
            <option key={category.slug} value={category.label}>
              {category.label}
            </option>
          ))}
        </select>
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Ville ou NPA"
          className="h-12 text-base"
        />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 text-base" />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSearch} className="h-12 rounded-xl bg-green-600 px-6 text-base hover:bg-green-700">{m.search.search}</Button>
        <Button variant="outline" onClick={useMyLocation} className="h-12 rounded-xl border-blue-200 text-base text-blue-700 hover:bg-blue-50">
          {m.search.useLocation}
        </Button>
      </div>
      {locationMessage ? <p className="text-sm text-slate-600">{locationMessage}</p> : null}
    </div>
  );
}
