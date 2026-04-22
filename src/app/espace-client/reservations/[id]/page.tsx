import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const bookingStatusLabel: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmee",
  in_progress: "En cours",
  completed: "Terminee",
  cancelled: "Annulee",
};

export default async function CustomerReservationDetailPage(
  props: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole("customer");
  const { id } = await props.params;
  const supabase = await getSupabaseServerClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, customer_id, status, reservation_source, starts_at, ends_at, notes, created_at")
    .eq("id", id)
    .eq("customer_id", auth.user.id)
    .maybeSingle();

  if (!booking) {
    notFound();
  }

  const { data: history } = await supabase
    .from("booking_status_history")
    .select("id, from_status, to_status, note, created_at")
    .eq("booking_id", booking.id)
    .order("created_at", { ascending: true });

  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-4">
        <Link href="/espace-client" className="text-sm font-semibold text-blue-700 hover:underline">
          Retour a l'espace client
        </Link>

        <Card className="rounded-2xl border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Reservation #{booking.id.slice(0, 8)}</h1>
              <p className="text-sm text-slate-600">Source: {booking.reservation_source}</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
              {bookingStatusLabel[booking.status] ?? booking.status}
            </Badge>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-slate-700">
            <p><span className="font-semibold text-slate-900">Debut:</span> {new Date(booking.starts_at).toLocaleString("fr-CH")}</p>
            <p><span className="font-semibold text-slate-900">Fin:</span> {new Date(booking.ends_at).toLocaleString("fr-CH")}</p>
            <p><span className="font-semibold text-slate-900">Creee le:</span> {new Date(booking.created_at).toLocaleString("fr-CH")}</p>
            <p><span className="font-semibold text-slate-900">Notes:</span> {booking.notes ?? "-"}</p>
          </div>
        </Card>

        <Card className="rounded-2xl border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Historique</h2>
          <ol className="mt-3 space-y-2">
            {(history ?? []).map((event) => (
              <li key={event.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <p>
                  {event.from_status ?? "Nouveau"} {"->"} {event.to_status}
                </p>
                <p className="text-xs text-slate-500">{new Date(event.created_at).toLocaleString("fr-CH")}</p>
                {event.note ? <p className="text-xs text-slate-600">{event.note}</p> : null}
              </li>
            ))}
            {(history ?? []).length === 0 ? (
              <li className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Aucun evenement de suivi pour le moment.
              </li>
            ) : null}
          </ol>
        </Card>
      </Container>
    </section>
  );
}
