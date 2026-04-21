import { Container } from "@/components/shared/container";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";

export default async function CustomerDashboardPage() {
  const auth = await requireRole("customer");

  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">Espace client</h1>
        <Card className="rounded-2xl border-slate-200 bg-white p-5">
          Bonjour {auth.profile?.first_name ?? "client"}, vos prochaines réservations apparaîtront ici.
        </Card>
      </Container>
    </section>
  );
}
