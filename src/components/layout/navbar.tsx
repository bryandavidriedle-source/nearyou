import Link from "next/link";

import { messages } from "@/lib/i18n";
import { getCurrentLanguage } from "@/lib/i18n-server";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { LanguageTabs } from "@/components/layout/language-tabs";

export async function Navbar() {
  const lang = await getCurrentLanguage();
  const m = messages[lang];

  const navItems = [
    { href: "/", label: m.navbar.home },
    { href: "/catalogue", label: m.navbar.catalogue },
    { href: "/hotline", label: m.navbar.phoneHelp },
    { href: "/assistant", label: "Assistant" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900">
          <span className="grid h-9 w-9 place-content-center rounded-xl bg-blue-700 text-white">N</span>
          NearYou
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-slate-900">
              {item.label}
            </Link>
          ))}
        </nav>
        <LanguageTabs current={lang} />
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="rounded-xl border-blue-200">
            <Link href="/connexion">Connexion</Link>
          </Button>
          <Button asChild className="rounded-xl bg-green-600 hover:bg-green-700">
            <Link href="/reserve">{m.navbar.bookNow}</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}

