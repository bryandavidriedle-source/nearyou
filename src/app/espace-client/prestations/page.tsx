import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const statusLabel: Record<string, string> = {
  new: "Nouvelle",
  reviewing: "En analyse",
  contacted: "Contactee",
  closed: "Cloturee",
};

export default async function ClientServicesPage() {
  const auth = await requireRole("customer");
  const supabase = await getSupabaseServerClient();

  const { data: requests } = await supabase
    .from("service_requests")
    .select("id, category, city, status, provider_status, created_at, description")
    .eq("profile_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <section className="py-8">
      <Container className="max-w-5xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Mes prestations</h1>
        <div className="space-y-3">
          {(requests ?? []).map((item) => (
            <Card key={item.id} className="premium-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{item.category}</p>
                  <p className="text-sm text-slate-600">{item.city} - {new Date(item.created_at).toLocaleString("fr-CH")}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{statusLabel[item.status] ?? item.status}</Badge>
                  <Badge variant="secondary">{item.provider_status}</Badge>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-700">{item.description}</p>
            </Card>
          ))}
          {(requests ?? []).length === 0 ? (
            <Card className="rounded-2xl border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
              Aucune prestation enregistree.{" "}
              <Link href="/trouver-un-prestataire" className="font-semibold text-blue-700 hover:underline">Creer une demande</Link>
            </Card>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
