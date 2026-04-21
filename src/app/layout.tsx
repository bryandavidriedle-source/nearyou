import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { MobileWebappNav } from "@/components/layout/mobile-webapp-nav";
import { Navbar } from "@/components/layout/navbar";
import { CookieBanner } from "@/components/shared/cookie-banner";
import { PwaRegister } from "@/components/shared/pwa-register";
import { getCurrentLanguage } from "@/lib/i18n-server";
import { messages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/site";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...pageMetadata({
    title: "NearYou | Services locaux en Suisse",
    description: "Trouvez une aide locale fiable en quelques secondes à Lausanne et en Suisse romande.",
    path: "/",
  }),
  manifest: "/manifest.webmanifest",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "NearYou",
    description: "Marketplace locale Suisse: simple, rapide, humaine.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getCurrentLanguage();
  const m = messages[lang];

  return (
    <html lang={lang} className={`${inter.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        <PwaRegister />
        <Navbar />
        <main className="pb-24 md:pb-0">{children}</main>
        <Footer />
        <MobileWebappNav
          currentLanguage={lang}
          labels={{
            home: m.navbar.home,
            catalogue: m.navbar.catalogue,
            find: m.navbar.find,
            account: m.navbar.account,
          }}
        />
        <CookieBanner />
      </body>
    </html>
  );
}
