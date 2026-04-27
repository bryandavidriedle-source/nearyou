"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  ClipboardList,
  Home,
  Languages,
  LayoutDashboard,
  LogOut,
  Search,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { supportedLanguages, type Language } from "@/lib/i18n";
import type { NavigationItem, NavigationRole } from "@/lib/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type MobileWebappNavProps = {
  currentLanguage: Language;
  items: NavigationItem[];
  isAuthenticated: boolean;
  role: NavigationRole;
};

function iconForItem(item: NavigationItem) {
  const href = item.href;
  if (href === "/" || href === "/admin" || href === "/espace-prestataire") return Home;
  if (href.includes("search") || href.includes("trouver") || href.includes("services")) return Search;
  if (href.includes("reservation") || href.includes("prestations") || href.includes("demandes")) return ClipboardList;
  if (href.includes("espace") || href.includes("profil") || href.includes("connexion")) return User;
  return LayoutDashboard;
}

export function MobileWebappNav({ currentLanguage, items, isAuthenticated, role }: MobileWebappNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = useMemo(
    () =>
      items.slice(0, 4).map((item) => ({
        ...item,
        icon: iconForItem(item),
      })),
    [items],
  );

  const hasPrimaryFlowCta =
    pathname === "/" ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/demande") ||
    pathname.startsWith("/trouver-un-prestataire") ||
    pathname.startsWith("/reserve") ||
    pathname.startsWith("/providers/");
  const showNeedCta = (role === "guest" || role === "client") && !hasPrimaryFlowCta;

  function setLanguage(language: Language) {
    document.cookie = `lang=${language}; path=/; max-age=31536000`;
    setLanguageOpen(false);
    router.refresh();
  }

  async function signOut() {
    setLoggingOut(true);
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
    setLoggingOut(false);
  }

  return (
    <>
      {showNeedCta ? (
        <div className="fixed inset-x-0 bottom-[5.7rem] z-50 px-4 md:hidden">
          <Button asChild className="mx-auto flex h-11 w-full max-w-md rounded-xl bg-green-600 text-sm font-semibold hover:bg-green-700">
            <Link href="/demande">Décrire mon besoin</Link>
          </Button>
        </div>
      ) : null}

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
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

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

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                void signOut();
              }}
              className="flex min-h-14 flex-col items-center justify-center rounded-xl px-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100"
              aria-label="Se déconnecter"
            >
              <LogOut className="mb-1 h-4 w-4" />
              <span>{loggingOut ? "..." : "Sortir"}</span>
            </button>
          ) : (
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
          )}
        </div>
      </nav>
    </>
  );
}
