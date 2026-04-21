"use client";

import { useRouter } from "next/navigation";

import { supportedLanguages, type Language } from "@/lib/i18n";

type Props = {
  current: Language;
};

export function LanguageTabs({ current }: Props) {
  const router = useRouter();

  function setLanguage(language: Language) {
    document.cookie = `lang=${language}; path=/; max-age=31536000`;
    router.refresh();
  }

  return (
    <div className="hidden items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 p-1 md:flex">
      {supportedLanguages.map((language) => (
        <button
          key={language}
          type="button"
          onClick={() => setLanguage(language)}
          className={`rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide transition ${
            current === language
              ? "bg-white text-blue-700 shadow-sm"
              : "text-slate-600 hover:bg-white hover:text-blue-700"
          }`}
        >
          {language}
        </button>
      ))}
    </div>
  );
}
