"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { publicEnv } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Props = {
  initialMode?: "login" | "signup";
  signupRedirectPath?: string;
};

function safeNextPath(rawPath: string | null) {
  if (!rawPath) return null;
  if (!rawPath.startsWith("/")) return null;
  if (rawPath.startsWith("//")) return null;
  return rawPath;
}

async function resolvePostLoginPathClient(
  userId: string,
  supabase: ReturnType<typeof getSupabaseBrowserClient>,
): Promise<string | null> {
  const [{ data: profile }, { data: adminAccount }, { data: providerApplication }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", userId).maybeSingle(),
    supabase.from("admin_accounts").select("scope, is_active").eq("profile_id", userId).eq("is_active", true).maybeSingle(),
    supabase
      .from("provider_applications")
      .select("id, workflow_status")
      .eq("profile_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const role = profile?.role as "admin" | "provider" | "customer" | undefined;
  if (role === "admin" && adminAccount?.is_active) return "/admin";
  if (role === "admin") return "/admin";
  if (role === "provider") return "/espace-prestataire";
  if (providerApplication?.id) return "/espace-prestataire";
  if (role === "customer") return null;
  return null;
}

export function AuthForm({ initialMode = "login", signupRedirectPath = "/espace-client" }: Props) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [signupRole, setSignupRole] = useState<"customer" | "provider" | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const callbackBase = `${publicEnv.NEXT_PUBLIC_SITE_URL}/auth/callback`;

  async function resolvePostLoginPath() {
    const requestedNext = safeNextPath(searchParams.get("next"));
    if (requestedNext) return requestedNext;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetch("/api/auth/post-login", { method: "GET", cache: "no-store" });
        const data = (await response.json().catch(() => null)) as { path?: string } | null;
        if (response.ok && data?.path && safeNextPath(data.path)) {
          return data.path;
        }
      } catch {
        // Retry once before fallback.
      }
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    }

    return "/espace-client";
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setMessage(error.message);
          setLoading(false);
          return;
        }

        let destination = await resolvePostLoginPath();
        if (data.user?.id) {
          try {
            const clientDestination = await resolvePostLoginPathClient(data.user.id, supabase);
            if (clientDestination) {
              destination = clientDestination;
            }
          } catch {
            // Keep server-based fallback.
          }
        }

        router.push(destination);
        router.refresh();
        return;
      }

      if (!signupRole) {
        setMessage("Choisissez d'abord votre profil: Client ou Prestataire.");
        return;
      }

      const roleRedirect = signupRole === "provider" ? "/espace-prestataire/profil?onboarding=1" : "/espace-client?onboarding=1";
      const nextAfterSignup = safeNextPath(searchParams.get("next")) ?? roleRedirect ?? signupRedirectPath;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${callbackBase}?next=${encodeURIComponent(nextAfterSignup)}`,
          data: {
            first_name: firstName,
            last_name: lastName,
            phone,
            language: "fr",
            account_type: signupRole,
          },
        },
      });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          signupRole === "provider"
            ? "Compte cree. Verifiez votre email puis finalisez votre dossier prestataire."
            : "Compte cree. Verifiez votre email pour confirmer l'inscription.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function onForgotPassword() {
    if (!email) {
      setMessage("Ajoutez votre email pour recevoir le lien de reinitialisation.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${callbackBase}?next=/reinitialiser-mot-de-passe`,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Email envoye. Verifiez votre boite de reception.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="rounded-2xl border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-900">{mode === "login" ? "Connexion sécurisée" : "Créer un compte"}</h2>
      <p className="mt-1 text-sm text-slate-600">
        {mode === "login" ? "Accédez à votre espace client, prestataire ou admin." : "Choisissez votre profil pour démarrer avec NearYou."}
      </p>

      <div className="mt-4 flex gap-2">
        <Button type="button" variant={mode === "login" ? "default" : "outline"} onClick={() => setMode("login")}>
          Se connecter
        </Button>
        <Button type="button" variant={mode === "signup" ? "default" : "outline"} onClick={() => setMode("signup")}>
          Créer un compte
        </Button>
      </div>

      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        {mode === "signup" ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-800">Choisissez votre profil</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                  signupRole === "customer"
                    ? "border-blue-300 bg-blue-50 text-blue-800"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => setSignupRole("customer")}
              >
                <span className="block font-semibold">Client</span>
                <span className="text-xs text-slate-500">Je réserve des services.</span>
              </button>
              <button
                type="button"
                className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                  signupRole === "provider"
                    ? "border-green-300 bg-green-50 text-green-800"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => setSignupRole("provider")}
              >
                <span className="block font-semibold">Prestataire</span>
                <span className="text-xs text-slate-500">Je veux proposer mes services.</span>
              </button>
            </div>

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
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Téléphone"
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
          Lien de confirmation invalide ou expire. Merci de relancer l&apos;inscription ou la recuperation.
        </p>
      ) : null}
      {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
    </Card>
  );
}
