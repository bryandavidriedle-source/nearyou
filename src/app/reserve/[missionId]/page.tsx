import { notFound } from "next/navigation";

import { BookingIntentForm } from "@/components/nearyou/booking-intent-form";
import { Container } from "@/components/shared/container";
import { getMissionById } from "@/lib/db";

export default async function ReserveMissionPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const mission = await getMissionById(missionId);

  if (!mission || !mission.provider.profile) {
    notFound();
  }

  return (
    <section className="py-12">
      <Container className="max-w-4xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h1 className="text-3xl font-bold text-slate-900">Reserve: {mission.title}</h1>
          <p className="mt-2 text-slate-600">Provider: {mission.provider.profile.firstName} {mission.provider.profile.lastName}</p>
          <p className="text-slate-600">Availability: {mission.isAvailableToday ? "Available today" : "Planned"}</p>
        </div>
        <BookingIntentForm missionId={mission.id} defaultFromPrice={mission.fromPrice} />
      </Container>
    </section>
  );
}
