import type { Metadata } from "next";

import { Container } from "@/components/shared/container";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getAdminData } from "@/lib/db";
import { pageMetadata, reviewReminderPlan } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "NearYou Admin dashboard",
  description: "Vue opérationnelle admins: utilisateurs, missions, support et feedback.",
  path: "/admin",
});

export default async function AdminPage() {
  await requireRole("admin");
  const data = await getAdminData();

  return (
    <section className="py-12">
      <Container className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard admin</h1>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="rounded-2xl border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Utilisateurs</p><p className="text-3xl font-bold">{data.users}</p></Card>
          <Card className="rounded-2xl border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Demandes</p><p className="text-3xl font-bold">{data.missions}</p></Card>
          <Card className="rounded-2xl border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Prestataires</p><p className="text-3xl font-bold">{data.providers}</p></Card>
          <Card className="rounded-2xl border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Partenaires</p><p className="text-3xl font-bold">{data.partners}</p></Card>
          <Card className="rounded-2xl border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Avis</p><p className="text-3xl font-bold">{data.reviews}</p></Card>
          <Card className="rounded-2xl border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Taux feedback</p><p className="text-3xl font-bold">{data.feedbackRate}%</p></Card>
          <Card className="rounded-2xl border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Rappels avis</p><p className="text-sm font-semibold">{reviewReminderPlan.join(" • ")}</p></Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-2xl border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Dernières réservations</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {data.bookings.map((booking) => (
                <li key={booking.id} className="rounded-lg border border-slate-100 px-3 py-2">
                  {booking.serviceType} - {booking.status} - source: {booking.reservationSource} - dès {booking.totalFromPrice} CHF
                </li>
              ))}
            </ul>
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Demandes hotline</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {data.hotlineRequests.map((item) => (
                <li key={item.id} className="rounded-lg border border-slate-100 px-3 py-2">
                  {item.firstName} {item.lastName} - {item.serviceType} - {item.status}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="rounded-2xl border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Messages support</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {(data.supportMessages ?? []).map((message: { id: string; email: string; subject: string; status: string; created_at: string }) => (
              <li key={message.id} className="rounded-lg border border-slate-100 px-3 py-2">
                {message.email} - {message.subject} - {message.status} - {new Date(message.created_at).toLocaleString("fr-CH")}
              </li>
            ))}
          </ul>
        </Card>
      </Container>
    </section>
  );
}
