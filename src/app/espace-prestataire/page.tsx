import { Container } from "@/components/shared/container";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";

export default async function ProviderDashboardPage() {
  const auth = await requireRole("provider");

  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">Espace prestataire</h1>
        <Card className="rounded-2xl border-slate-200 bg-white p-5">
          Bonjour {auth.profile?.first_name ?? "prestataire"}, vos demandes clients et disponibilités seront visibles ici.
        </Card>
      </Container>
    </section>
  );
}
