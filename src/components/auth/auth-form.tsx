"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AuthForm() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Compte créé. Vérifiez votre email pour confirmer l'inscription.");
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
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" required minLength={8} />
        <Button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-700 hover:bg-blue-800">
          {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer un compte"}
        </Button>
      </form>

      {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
    </Card>
  );
}
