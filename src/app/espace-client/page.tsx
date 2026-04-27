import Link from "next/link";

import { CustomerOnboardingCard } from "@/components/customer/customer-onboarding-card";
import { ServiceRequestActions } from "@/components/customer/service-request-actions";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type RequestStatus = "new" | "reviewing" | "contacted" | "closed";
type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

const requestStatusLabel: Record<RequestStatus, string> = {
  new: "Nouvelle",
  reviewing: "En analyse",
  contacted: "Contact etabli",
  closed: "Cloturee",
};

const bookingStatusLabel: Record<BookingStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmee",
  in_progress: "En cours",
  completed: "Terminee",
  cancelled: "Annulee",
};

export default async function CustomerDashboardPage() {
  const auth = await requireRole("customer");
  const supabase = await getSupabaseServerClient();

  const { data: requests } = await supabase
    .from("service_requests")
    .select("id, created_at, updated_at, status, provider_status, category, city, description, budget, urgency")
    .eq("profile_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, status, reservation_source, starts_at, ends_at, created_at, notes")
    .eq("customer_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const requestIds = (requests ?? []).map((item) => item.id);
  const historyByRequest = new Map<
    string,
    Array<{ id: string; to_status: RequestStatus; created_at: string; note: string | null }>
  >();
  const supplementsByRequest = new Map<
    string,
    Array<{ id: string; amount_chf: number; reason: string; status: "pending" | "approved" | "rejected" | "cancelled"; requested_at: string }>
  >();

  if (requestIds.length > 0) {
    const [{ data: history }, { data: supplements }] = await Promise.all([
      supabase
        .from("service_request_status_history")
        .select("id, service_request_id, to_status, created_at, note")
        .in("service_request_id", requestIds)
        .order("created_at", { ascending: true }),
      supabase
        .from("service_request_supplements")
        .select("id, service_request_id, amount_chf, reason, status, requested_at")
        .in("service_request_id", requestIds)
        .order("requested_at", { ascending: false }),
    ]);

    for (const event of history ?? []) {
      const existing = historyByRequest.get(event.service_request_id) ?? [];
      existing.push({
        id: event.id,
        to_status: event.to_status as RequestStatus,
        created_at: event.created_at,
        note: event.note,
      });
      historyByRequest.set(event.service_request_id, existing);
    }

    for (const supplement of supplements ?? []) {
      const existing = supplementsByRequest.get(supplement.service_request_id) ?? [];
      existing.push({
        id: supplement.id,
        amount_chf: Number(supplement.amount_chf),
        reason: supplement.reason,
        status: supplement.status as "pending" | "approved" | "rejected" | "cancelled",
        requested_at: supplement.requested_at,
      });
      supplementsByRequest.set(supplement.service_request_id, existing);
    }
  }

  return (
    <section className="py-12">
      <Container className="max-w-5xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-slate-900">Espace client</h1>
          <Button asChild className="rounded-xl bg-green-600 hover:bg-green-700">
            <Link href="/trouver-un-prestataire">Nouvelle demande</Link>
          </Button>
        </div>

        <CustomerOnboardingCard
          initialFirstName={auth.profile?.first_name ?? ""}
          initialLastName={auth.profile?.last_name ?? ""}
          initialPhone={auth.profile?.phone ?? ""}
          initialCity={auth.profile?.city ?? ""}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-2xl border-slate-200 bg-white p-5 md:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">Mon compte</h2>
            <p className="mt-2 text-sm text-slate-700">
              {auth.profile?.first_name ?? "Client"} {auth.profile?.last_name ?? ""} - {auth.user.email}
            </p>
            <p className="text-sm text-slate-600">Ville: {auth.profile?.city ?? "-"}</p>
            <p className="mt-2 text-sm text-slate-600">
              Vos demandes et reservations sont suivies ici avec les statuts operationnels PrèsDeToi.
            </p>
          </Card>
          <Card className="rounded-2xl border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Demandes actives</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {(requests ?? []).filter((item) => item.status !== "closed").length}
            </p>
            <p className="mt-3 text-sm text-slate-500">Reservations</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{(bookings ?? []).length}</p>
          </Card>
        </div>

        <Card className="rounded-2xl border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Mes reservations</h2>
          <div className="mt-3 space-y-2">
            {(bookings ?? []).map((booking) => (
              <div key={booking.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">Reservation #{booking.id.slice(0, 8)}</p>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    {bookingStatusLabel[booking.status as BookingStatus] ?? booking.status}
                  </Badge>
                </div>
                <p className="text-slate-600">
                  {new Date(booking.starts_at).toLocaleString("fr-CH")} - Source: {booking.reservation_source}
                </p>
                <Link href={`/espace-client/reservations/${booking.id}`} className="mt-1 inline-flex text-xs font-semibold text-blue-700 hover:underline">
                  Ouvrir le detail de reservation
                </Link>
              </div>
            ))}
            {(bookings ?? []).length === 0 ? <p className="text-sm text-slate-500">Aucune reservation pour le moment.</p> : null}
          </div>
        </Card>

        {requests && requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((request) => {
              const history = historyByRequest.get(request.id) ?? [];
              const fallbackHistory =
                history.length > 0
                  ? history
                  : [
                      {
                        id: `${request.id}-initial`,
                        to_status: request.status as RequestStatus,
                        created_at: request.created_at,
                        note: "Demande envoyee.",
                      },
                    ];

              return (
                <Card key={request.id} className="rounded-2xl border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">Demande #{request.id.slice(0, 8)}</p>
                      <h2 className="text-lg font-semibold text-slate-900">{request.category}</h2>
                    <p className="text-sm text-slate-600">
                      {request.city} - Urgence: {request.urgency} - Budget: {request.budget}
                    </p>
                    <p className="text-xs text-slate-500">
                      Statut mission prestataire: {request.provider_status}
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    {requestStatusLabel[request.status as RequestStatus] ?? request.status}
                  </Badge>
                </div>

                  <p className="mt-3 text-sm text-slate-700">{request.description}</p>

                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Suivi</p>
                    <ol className="space-y-2">
                      {fallbackHistory.map((step) => (
                        <li key={step.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                          <span className="font-medium text-slate-900">{requestStatusLabel[step.to_status] ?? step.to_status}</span>
                          <span className="ml-2 text-slate-500">
                            {new Date(step.created_at).toLocaleString("fr-CH", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                          {step.note ? <p className="mt-1 text-slate-600">{step.note}</p> : null}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <ServiceRequestActions
                    serviceRequestId={request.id}
                    providerStatus={request.provider_status}
                    supplements={supplementsByRequest.get(request.id) ?? []}
                  />
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="rounded-2xl border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
            Vous n&apos;avez pas encore de demande liee a votre compte. Creez une demande depuis &quot;Trouver un prestataire&quot;.
          </Card>
        )}
      </Container>
    </section>
  );
}

