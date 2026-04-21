import Link from "next/link";

import { Container } from "@/components/shared/container";
import { messages } from "@/lib/i18n";
import { getCurrentLanguage } from "@/lib/i18n-server";

export async function Footer() {
  const lang = await getCurrentLanguage();
  const m = messages[lang];

  return (
    <footer className="mt-16 border-t border-blue-100 bg-white py-10">
      <Container className="space-y-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">{m.footer.tagline}</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/catalogue" className="hover:text-slate-900">{m.navbar.catalogue}</Link>
          <Link href="/hotline" className="hover:text-slate-900">{m.navbar.phoneHelp}</Link>
          <Link href="/assistant" className="hover:text-slate-900">Assistant IA</Link>
          <Link href="/conditions-utilisation" className="hover:text-slate-900">CGU</Link>
          <Link href="/conditions-prestataires" className="hover:text-slate-900">Conditions prestataires</Link>
          <Link href="/politique-confidentialite" className="hover:text-slate-900">Confidentialité</Link>
          <Link href="/politique-cookies" className="hover:text-slate-900">Cookies</Link>
          <Link href="/mentions-legales" className="hover:text-slate-900">Mentions légales</Link>
        </div>
        <p>{m.footer.protection}</p>
      </Container>
    </footer>
  );
}

