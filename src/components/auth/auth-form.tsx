"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { publicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AuthForm() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const callbackBase = `${publicEnv.NEXT_PUBLIC_SITE_URL}/auth/callback`;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setMessage(error.message);
          setLoading(false);
          return;
        }

        const next = searchParams.get("next") ?? "/";
        router.push(next);
        router.refresh();
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${callbackBase}?next=/espace-client`,
          data: {
            first_name: firstName,
            last_name: lastName,
            language: "fr",
          },
        },
      });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Compte créé. Vérifiez votre email pour confirmer l'inscription.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function onForgotPassword() {
    if (!email) {
      setMessage("Ajoutez votre email pour recevoir le lien de réinitialisation.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${callbackBase}?next=/connexion`,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Email envoyé. Vérifiez votre boîte de réception.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-2xl border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Connexion NearYou</h1>
      <p className="mt-1 text-sm text-slate-600">Accédez à votre espace client, prestataire ou admin.</p>

      <div className="mt-4 flex gap-2">
        <Button type="button" variant={mode === "login" ? "default" : "outline"} onClick={() => setMode("login")}>Se connecter</Button>
        <Button type="button" variant={mode === "signup" ? "default" : "outline"} onClick={() => setMode("signup")}>Créer un compte</Button>
      </div>

      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        {mode === "signup" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Prénom"
              required
            />
            <Input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nom"
              required
            />
          </div>
        ) : null}
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" required minLength={8} />
        <Button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-700 hover:bg-blue-800">
          {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer un compte"}
        </Button>

        {mode === "login" ? (
          <button
            type="button"
            onClick={onForgotPassword}
            className="w-full text-center text-sm text-blue-700 underline-offset-2 hover:underline"
          >
            Mot de passe oublié ?
          </button>
        ) : null}
      </form>

      {searchParams.get("error") ? (
        <p className="mt-3 text-sm text-amber-700">
          Lien de confirmation invalide ou expiré. Merci de relancer l&apos;inscription ou la récupération.
        </p>
      ) : null}
      {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
    </Card>
  );
}
