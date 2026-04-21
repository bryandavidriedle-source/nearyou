import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { Container } from "@/components/shared/container";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Connexion NearYou",
  description: "Connexion et création de compte NearYou.",
  path: "/connexion",
});

export default function LoginPage() {
  return (
    <section className="py-12">
      <Container className="max-w-lg">
        <AuthForm />
      </Container>
    </section>
  );
}
