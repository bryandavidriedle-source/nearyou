import { notFound } from "next/navigation";

import { BookingIntentForm } from "@/components/nearyou/booking-intent-form";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireAuthenticatedUser } from "@/lib/auth";
import { getMissionById } from "@/lib/db";

export default async function ReserveMissionPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  await requireAuthenticatedUser("/connexion", `/reserve/${missionId}`);
  const mission = await getMissionById(missionId);

  if (!mission || !mission.provider.profile) {
    notFound();
  }

  const providerName = `${mission.provider.profile.firstName} ${mission.provider.profile.lastName}`.trim();

  return (
    <section className="py-10 sm:py-12">
      <Container className="max-w-5xl space-y-6">
        <Card className="section-shell p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-700">Reservation encadree NearYou</p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">{mission.title}</h1>
              <p className="mt-2 text-sm text-slate-600">
                Prestataire: <span className="font-semibold text-slate-900">{providerName}</span> - Categorie {mission.category.name}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Disponibilite: {mission.isAvailableToday ? "Possible aujourd'hui" : "Planification standard"}.
              </p>
            </div>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Tarif des {mission.fromPrice} CHF</Badge>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Card className="premium-card p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">1. Choix du creneau</p>
              <p className="mt-1">Selection mobile-friendly date + plage horaire.</p>
            </Card>
            <Card className="premium-card p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">2. Confirmation claire</p>
              <p className="mt-1">Etat explicite en succes ou erreur, sans ambiguite.</p>
            </Card>
            <Card className="premium-card p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">3. Cadre juridique prudent</p>
              <p className="mt-1">NearYou reste une plateforme d'intermediation.</p>
            </Card>
          </div>
        </Card>

        <BookingIntentForm missionId={mission.id} defaultFromPrice={mission.fromPrice} />
      </Container>
    </section>
  );
}
