import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { Container } from "@/components/shared/container";
import { getAuthContext, resolveAuthenticatedHomePath } from "@/lib/auth";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Connexion NearYou",
  description: "Connexion et creation de compte NearYou.",
  path: "/connexion",
});

function safeNextPath(path?: string) {
  if (!path) return null;
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}

export default async function LoginPage(props: { searchParams?: Promise<{ next?: string }> }) {
  const searchParams = await props.searchParams;
  const nextPath = safeNextPath(searchParams?.next);
  const auth = await getAuthContext();
  if (auth.user) {
    redirect(nextPath ?? (await resolveAuthenticatedHomePath()));
  }

  return (
    <section className="py-12">
      <Container className="grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Compte NearYou</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Connexion securisee et redirection intelligente</h1>
          <p className="mt-3 text-sm text-slate-700">
            Accedez directement a votre espace client, prestataire ou admin selon votre profil.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>1. Session securisee Supabase.</li>
            <li>2. Redirection automatique selon le role.</li>
            <li>3. Workflow prestataire avec validation manuelle.</li>
          </ul>
        </div>
        <AuthForm initialMode="login" />
      </Container>
    </section>
  );
}
