import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { Container } from "@/components/shared/container";
import { getAuthContext, resolveAuthenticatedHomePath } from "@/lib/auth";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Créer un compte | PrèsDeToi",
  description: "Rejoignez PrèsDeToi en quelques instants.",
  path: "/inscription",
});

function safeNextPath(path?: string) {
  if (!path) return null;
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  return path;
}

export default async function SignupPage(props: { searchParams?: Promise<{ next?: string }> }) {
  const searchParams = await props.searchParams;
  const nextPath = safeNextPath(searchParams?.next);
  const auth = await getAuthContext();
  if (auth.user) {
    redirect(nextPath ?? (await resolveAuthenticatedHomePath()));
  }

  return (
    <section className="py-12">
      <Container className="grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-green-100 bg-green-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">Nouveau compte</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Créer un compte</h1>
          <p className="mt-3 text-sm text-slate-700">Rejoignez PrèsDeToi en quelques instants.</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>1. Création du compte en moins d'une minute.</li>
            <li>2. Choix du parcours client ou prestataire.</li>
            <li>3. Redirection automatique vers votre dashboard.</li>
          </ul>
        </div>
        <AuthForm initialMode="signup" />
      </Container>
    </section>
  );
}
