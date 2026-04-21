import type { Metadata } from "next";

export const siteConfig = {
  name: "NearYou",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@nearyou.ch",
  phone: "+41 21 555 00 00",
  city: "Lausanne",
};

export function pageMetadata(input: { title: string; description: string; path?: string }): Metadata {
  const path = input.path ?? "/";
  const url = `${siteConfig.url}${path}`;

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: siteConfig.name,
      type: "website",
      locale: "fr_CH",
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
