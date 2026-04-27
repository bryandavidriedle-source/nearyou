"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "nearyou-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const value = window.localStorage.getItem(STORAGE_KEY);
    setVisible(value !== "accepted");
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
      <p className="text-sm text-slate-700">
        PrèsDeToi utilise des cookies essentiels pour la sécurité et l'expérience, et des cookies d'analyse après consentement.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          className="rounded-xl bg-green-600 hover:bg-green-700"
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, "accepted");
            setVisible(false);
          }}
        >
          Accepter
        </Button>
        <Button type="button" variant="outline" className="rounded-xl" onClick={() => setVisible(false)}>
          Continuer sans analytics
        </Button>
      </div>
    </div>
  );
}

