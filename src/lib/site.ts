import type { Metadata } from "next";

export const siteConfig = {
  name: "NearYou",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@nearyou.ch",
  phone: "+41 21 555 00 00",
  city: "Lausanne",
  locale: "fr_CH",
};

export function pageMetadata(input: { title: string; description: string; path?: string }): Metadata {
  const path = input.path ?? "/";
  const url = `${siteConfig.url}${path}`;

  return {
    title: input.title,
    description: input.description,
    keywords: [
      "services à domicile suisse",
      "prestataires vérifiés",
      "réserver service local lausanne",
      "mise en relation locale",
      "NearYou",
    ],
    alternates: { canonical: url },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: siteConfig.name,
      type: "website",
      locale: siteConfig.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
  };
}

export const priceHighlights = [
  { label: "Aide à domicile", fromPrice: 35 },
  { label: "Visite senior", fromPrice: 29 },
  { label: "Promenade chien", fromPrice: 22 },
  { label: "Parking", fromPrice: 12 },
] as const;

export const homepageActions = ["Aide à domicile", "Visite proche", "Promenade chien", "Parking"] as const;

export const reviewReminderPlan = ["24h", "3 jours", "7 jours"] as const;
