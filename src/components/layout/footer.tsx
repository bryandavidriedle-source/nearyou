import Link from "next/link";

import { Container } from "@/components/shared/container";
import { messages } from "@/lib/i18n";
import { getCurrentLanguage } from "@/lib/i18n-server";
import { siteConfig } from "@/lib/site";

export async function Footer() {
  const lang = await getCurrentLanguage();
  const m = messages[lang];

  return (
    <footer className="mt-16 border-t border-blue-100 bg-white py-12">
      <Container className="space-y-8 text-sm text-slate-600">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <p className="text-base font-semibold text-slate-900">PrèsDeToi</p>
            <p>{m.footer.tagline}</p>
            <p className="text-xs text-slate-500">{m.footer.protection}</p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-slate-900">Clients</p>
            <Link href="/trouver-un-prestataire" className="block hover:text-slate-900">Faire une demande</Link>
            <Link href="/services" className="block hover:text-slate-900">Catalogue des services</Link>
            <Link href="/comment-ca-marche" className="block hover:text-slate-900">Comment ça marche</Link>
            <Link href="/hotline" className="block hover:text-slate-900">Rappel téléphonique</Link>
            <Link href="/connexion" className="block hover:text-slate-900">Connexion client</Link>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-slate-900">Prestataires</p>
            <Link href="/devenir-prestataire" className="block hover:text-slate-900">Candidater</Link>
            <Link href="/connexion?next=/espace-prestataire" className="block hover:text-slate-900">Connexion prestataire</Link>
            <Link href="/conditions-prestataires" className="block hover:text-slate-900">Conditions prestataires</Link>
            <Link href="/contact" className="block hover:text-slate-900">Support</Link>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-slate-900">Légal & confiance</p>
            <Link href="/conditions" className="block hover:text-slate-900">Conditions</Link>
            <Link href="/conditions-utilisation" className="block hover:text-slate-900">CGU</Link>
            <Link href="/politique-confidentialite" className="block hover:text-slate-900">Confidentialité</Link>
            <Link href="/politique-cookies" className="block hover:text-slate-900">Cookies</Link>
            <Link href="/mentions-legales" className="block hover:text-slate-900">Mentions légales</Link>
            <Link href="/faq" className="block hover:text-slate-900">FAQ</Link>
            <p className="pt-2 text-xs text-slate-500">
              Contact: <a className="hover:text-slate-900" href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{siteConfig.name} · Suisse · {siteConfig.city} ({siteConfig.canton})</p>
          <p>Plateforme d'intermédiation locale, opérationnelle en Suisse romande.</p>
        </div>
      </Container>
    </footer>
  );
}
