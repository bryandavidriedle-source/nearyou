import { notFound } from "next/navigation";

import { BookingIntentForm } from "@/components/nearyou/booking-intent-form";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getMissionById } from "@/lib/db";

export default async function ReserveMissionPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
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
              <p className="text-sm font-medium text-blue-700">Réservation encadrée NearYou</p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">{mission.title}</h1>
              <p className="mt-2 text-sm text-slate-600">
                Prestataire: <span className="font-semibold text-slate-900">{providerName}</span> - Catégorie {mission.category.name}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Disponibilité: {mission.isAvailableToday ? "Possible aujourd'hui" : "Planification standard"}.
              </p>
              <p className="mt-1 text-sm text-slate-600">Vous pourrez créer un compte ou vous connecter uniquement au moment de confirmer.</p>
            </div>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Tarif dès {mission.fromPrice} CHF</Badge>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Card className="premium-card p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">1. Choix du créneau</p>
              <p className="mt-1">Sélection mobile-first de la date et de la plage horaire.</p>
            </Card>
            <Card className="premium-card p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">2. Confirmation claire</p>
              <p className="mt-1">État explicite en succès ou erreur, sans ambiguïté.</p>
            </Card>
            <Card className="premium-card p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">3. Cadre juridique clair</p>
              <p className="mt-1">NearYou reste une plateforme d'intermédiation.</p>
            </Card>
          </div>
        </Card>

        <BookingIntentForm missionId={mission.id} defaultFromPrice={mission.fromPrice} />
      </Container>

      <div className="fixed inset-x-0 bottom-20 z-40 px-4 md:hidden">
        <Button
          type="submit"
          form="booking-intent-form"
          className="h-12 w-full rounded-xl bg-green-600 text-base hover:bg-green-700"
        >
          Confirmer ma réservation
        </Button>
      </div>
    </section>
  );
}
