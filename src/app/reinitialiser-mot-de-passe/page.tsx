"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }

      setMessage("Mot de passe mis a jour. Vous pouvez maintenant vous connecter.");
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push("/connexion");
      }, 800);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-12">
      <Container className="max-w-lg">
        <Card className="rounded-2xl border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Reinitialiser le mot de passe</h1>
          <p className="mt-1 text-sm text-slate-600">Definissez un nouveau mot de passe pour votre compte NearYou.</p>

          <form className="mt-4 space-y-3" onSubmit={onSubmit}>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Nouveau mot de passe"
              minLength={8}
              required
            />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirmer le mot de passe"
              minLength={8}
              required
            />
            <Button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-700 hover:bg-blue-800">
              {loading ? "Mise a jour..." : "Mettre a jour le mot de passe"}
            </Button>
          </form>

          {error ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="mt-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p> : null}

          <Link href="/connexion" className="mt-4 inline-flex text-sm font-semibold text-blue-700 hover:underline">
            Retour a la connexion
          </Link>
        </Card>
      </Container>
    </section>
  );
}
