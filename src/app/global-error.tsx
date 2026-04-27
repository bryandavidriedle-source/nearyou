"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-5 px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-700">Erreur système</p>
          <h1 className="text-3xl font-bold">PrèsDeToi rencontre un incident inattendu</h1>
          <p className="text-slate-600">
            Vous pouvez réessayer. Si le problème persiste, revenez à l&apos;accueil.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-xl bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              onClick={() => reset()}
            >
              Réessayer
            </button>
            <Link href="/" className="rounded-xl border border-blue-200 px-4 py-2 text-blue-700 hover:bg-blue-50">
              Retour accueil
            </Link>
          </div>
          <p className="text-xs text-slate-500">{error.digest ? `Ref: ${error.digest}` : "Ref: runtime-error"}</p>
        </main>
      </body>
    </html>
  );
}


