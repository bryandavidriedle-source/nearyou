import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { MobileWebappNav } from "@/components/layout/mobile-webapp-nav";
import { Navbar } from "@/components/layout/navbar";
import { CookieBanner } from "@/components/shared/cookie-banner";
import { PwaRegister } from "@/components/shared/pwa-register";
import { getAuthContext, resolveAuthenticatedHomePath } from "@/lib/auth";
import { getCurrentLanguage } from "@/lib/i18n-server";
import { getMobileNav, resolveNavigationRole } from "@/lib/navigation";
import { pageMetadata } from "@/lib/site";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...pageMetadata({
    title: "NearYou | Services à domicile premium en Suisse",
    description: "Plateforme suisse de mise en relation locale avec prestataires vérifiés et suivi humain.",
    path: "/",
  }),
  manifest: "/manifest.webmanifest",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "NearYou | Services locaux vérifiés",
    description: "Réservation simple, confiance forte et opération locale en Suisse romande.",
    type: "website",
    locale: "fr_CH",
  },
  applicationName: "NearYou",
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getCurrentLanguage();
  const auth = await getAuthContext();
  const dashboardPath = auth.user ? await resolveAuthenticatedHomePath() : null;
  const navRole = resolveNavigationRole({
    isAuthenticated: Boolean(auth.user),
    dashboardPath,
  });
  const mobileItems = getMobileNav(navRole);

  return (
    <html lang={lang} className={`${manrope.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        <PwaRegister />
        <Navbar />
        <main className="pb-24 md:pb-0">{children}</main>
        <Footer />
        <MobileWebappNav
          currentLanguage={lang}
          items={mobileItems}
          isAuthenticated={Boolean(auth.user)}
        />
        <CookieBanner />
      </body>
    </html>
  );
}
