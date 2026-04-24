import Link from "next/link";
import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { serviceCategories, swissCityTargets } from "@/lib/constants";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Services locaux | PrèsDeToi",
  description: "Explorez les services disponibles par catégorie et ville en Suisse romande.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <section className="py-12">
      <Container className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Services à domicile en Suisse</h1>
          <p className="text-slate-600">
            Choisissez une catégorie puis une ville pour afficher les prestations locales disponibles.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {serviceCategories.map((category) => (
            <Card key={category.slug} className="premium-card space-y-3 p-5">
              <p className="text-lg font-semibold text-slate-900">{category.label}</p>
              <p className="text-sm text-slate-600">{category.description}</p>
              <p className="text-sm font-semibold text-green-700">dès {category.fromPrice} CHF</p>

              <div className="flex flex-wrap gap-2">
                {swissCityTargets.slice(0, 4).map((city) => (
                  <Link
                    key={`${category.slug}-${city.slug}`}
                    href={`/services/${category.slug}/${city.slug}`}
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:border-blue-300 hover:text-blue-700"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>

              <Button asChild className="rounded-xl bg-green-600 hover:bg-green-700">
                <Link href={`/services/${category.slug}/st-prex`}>Voir les prestataires</Link>
              </Button>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
