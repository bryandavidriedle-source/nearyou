import type { Metadata } from "next";

import { CategoryCard } from "@/components/sections/category-card";
import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/sections/section-header";
import { buildMetadata } from "@/lib/metadata";
import { serviceCategories } from "@/lib/constants";

export const metadata: Metadata = buildMetadata({
  title: "Catégories de services | NearYou",
  description: "Explorez les catégories de services disponibles sur NearYou en Suisse romande.",
  path: "/categories",
});

export default function CategoriesPage() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeader
          eyebrow="Catégories"
          title="Services disponibles"
          description="Chaque catégorie vous redirige vers un formulaire de demande avec spécialité pré-remplie."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.map((category) => (
            <CategoryCard
              key={category.slug}
              slug={category.slug}
              label={category.label}
              description={category.description}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
