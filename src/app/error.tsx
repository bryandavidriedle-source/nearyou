"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("PrèsDeToi runtime error:", error);
  }, [error]);

  return (
    <section className="py-16">
      <Container className="max-w-2xl space-y-5 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-700">Incident applicatif</p>
        <h1 className="text-3xl font-bold text-slate-900">Une erreur est survenue</h1>
        <p className="text-slate-600">
          L&apos;équipe PrèsDeToi a été notifiée. Vous pouvez réessayer ou revenir à l&apos;accueil.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => reset()} className="rounded-xl bg-green-600 hover:bg-green-700">
            Réessayer
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-blue-200 text-blue-700">
            <Link href="/">Retour accueil</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}


