import { CustomerOnboardingCard } from "@/components/customer/customer-onboarding-card";
import { Container } from "@/components/shared/container";
import { requireRole } from "@/lib/auth";

export default async function ClientProfilePage() {
  const auth = await requireRole("customer");

  return (
    <section className="py-8">
      <Container className="max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Mon profil client</h1>
        <CustomerOnboardingCard
          initialFirstName={auth.profile?.first_name ?? ""}
          initialLastName={auth.profile?.last_name ?? ""}
          initialPhone={auth.profile?.phone ?? ""}
          initialCity={auth.profile?.city ?? ""}
        />
      </Container>
    </section>
  );
}
