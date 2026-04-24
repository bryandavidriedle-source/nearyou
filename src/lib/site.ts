import type { Metadata } from "next";

export const siteConfig = {
  name: "PrèsDeToi",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@presdetoi.com",
  phone: "+41 21 555 00 00",
  city: "St-Prex",
  canton: "Vaud",
  commissionRate: 0.2,
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
      "réserver service local vaud",
      "mise en relation locale",
      "PrèsDeToi",
      "St-Prex",
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
  { label: "Ménage", fromPrice: 35 },
  { label: "Jardinage", fromPrice: 40 },
  { label: "Bricolage", fromPrice: 45 },
  { label: "Aide seniors", fromPrice: 35 },
] as const;

export const homepageActions = ["Ménage", "Jardinage", "Bricolage", "Livraison locale"] as const;

export const reviewReminderPlan = ["24h", "3 jours", "7 jours"] as const;
