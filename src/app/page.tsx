import Link from "next/link";

import { HeroSearch } from "@/components/nearyou/hero-search";
import { ProviderMapSplit } from "@/components/nearyou/provider-map-split";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getHomeData } from "@/lib/db";
import { priceHighlights } from "@/lib/site";
import { messages } from "@/lib/i18n";
import { getCurrentLanguage } from "@/lib/i18n-server";

export default async function HomePage() {
  const lang = await getCurrentLanguage();
  const m = messages[lang];
  const { missions, parkingListings, partners } = await getHomeData();

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
    }));

  return (
    <>
      <section className="py-10 sm:py-14">
        <Container className="space-y-6">
          <div className="space-y-4">
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{m.home.badge}</Badge>
            <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">{m.home.title}</h1>
            <p className="max-w-2xl text-lg text-slate-600">{m.home.subtitle}</p>
            <div className="flex flex-wrap gap-3">
              {m.home.actions.map((action) => (
                <Button key={action} variant="outline" className="h-12 rounded-xl border-blue-200 bg-white px-5 text-base text-blue-700 hover:bg-blue-50">
                  {action}
                </Button>
              ))}
            </div>
          </div>
          <HeroSearch lang={lang} />
        </Container>
      </section>

      <section className="py-4 sm:py-8">
        <Container>
          <ProviderMapSplit lang={lang} providers={providerItems} parkingListings={parkingListings} partners={partners} />
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <h2 className="mb-5 text-2xl font-semibold text-slate-900">{m.home.pricingTitle}</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {priceHighlights.map((item) => (
              <Card key={item.label} className="rounded-2xl border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-green-700">{messages[lang].map.from} {item.fromPrice} CHF</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container className="grid gap-6 lg:grid-cols-3">
          <Card className="rounded-2xl border-blue-100 bg-white p-6 shadow-sm lg:col-span-2">
            <h3 className="text-2xl font-semibold text-slate-900">{m.home.seniorTitle}</h3>
            <p className="mt-2 text-slate-600">{m.home.seniorText}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild className="h-12 rounded-xl bg-green-600 px-5 text-base hover:bg-green-700"><Link href="/hotline">{m.home.seniorCta1}</Link></Button>
              <Button asChild variant="outline" className="h-12 rounded-xl border-blue-200 px-5 text-base text-blue-700 hover:bg-blue-50"><Link href="/catalogue">{m.home.seniorCta2}</Link></Button>
            </div>
          </Card>

          <Card className="rounded-2xl border-green-100 bg-green-50 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">{m.home.voucher}</p>
            <p className="mt-3 text-3xl font-bold text-green-800">10% OFF</p>
            <p className="mt-2 text-sm text-green-700">{m.home.voucherText}</p>
          </Card>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <h2 className="mb-5 text-2xl font-semibold text-slate-900">{m.home.partnersTitle}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {partners.slice(0, 6).map((partner) => (
              <Card key={partner.id} className="rounded-2xl border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{partner.type}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{partner.name}</p>
                <p className="text-sm text-slate-600">{partner.address}, {partner.city}</p>
                <p className="mt-2 text-sm text-slate-500">{m.home.partnersText}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}




