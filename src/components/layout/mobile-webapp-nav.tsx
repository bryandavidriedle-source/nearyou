"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Grid2x2, Home, Languages, Search, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supportedLanguages, type Language } from "@/lib/i18n";

type MobileWebappNavProps = {
  currentLanguage: Language;
  labels: {
    home: string;
    catalogue: string;
    find: string;
    account: string;
  };
};

export function MobileWebappNav({ currentLanguage, labels }: MobileWebappNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [languageOpen, setLanguageOpen] = useState(false);

  const items = useMemo(
    () => [
      { href: "/", label: labels.home, icon: Home },
      { href: "/catalogue", label: labels.catalogue, icon: Grid2x2 },
      { href: "/trouver-un-prestataire", label: labels.find, icon: Search },
      { href: "/espace-client", label: labels.account, icon: User },
    ],
    [labels],
  );

  function setLanguage(language: Language) {
    document.cookie = `lang=${language}; path=/; max-age=31536000`;
    setLanguageOpen(false);
    router.refresh();
  }

  return (
    <>
      {languageOpen ? (
        <div className="fixed inset-x-0 bottom-[5.7rem] z-50 px-4 md:hidden">
          <div className="mx-auto max-w-md rounded-2xl border border-blue-100 bg-white p-3 shadow-lg">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Langue</p>
            <div className="grid grid-cols-4 gap-2">
              {supportedLanguages.map((language) => (
                <Button
                  key={language}
                  type="button"
                  size="sm"
                  variant={currentLanguage === language ? "default" : "outline"}
                  className="rounded-lg text-xs uppercase"
                  onClick={() => setLanguage(language)}
                >
                  {language}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-blue-100 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.4rem)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-14 flex-col items-center justify-center rounded-xl px-1 text-[11px] font-medium transition ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="mb-1 h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setLanguageOpen((prev) => !prev)}
            className={`flex min-h-14 flex-col items-center justify-center rounded-xl px-1 text-[11px] font-medium transition ${
              languageOpen ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
            }`}
            aria-label="Changer la langue"
          >
            <Languages className="mb-1 h-4 w-4" />
            <span className="uppercase">{currentLanguage}</span>
          </button>
        </div>
      </nav>
    </>
  );
}

