import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type RequestStatus = "new" | "reviewing" | "contacted" | "closed";

const statusLabel: Record<RequestStatus, string> = {
  new: "Nouvelle",
  reviewing: "En analyse",
  contacted: "Contact etabli",
  closed: "Cloturee",
};

export default async function CustomerDashboardPage() {
  const auth = await requireRole("customer");
  const supabase = await getSupabaseServerClient();

  const { data: requests } = await supabase
    .from("service_requests")
    .select("id, created_at, updated_at, status, category, city, description, budget, urgency")
    .eq("profile_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const requestIds = (requests ?? []).map((item) => item.id);
  const historyByRequest = new Map<
    string,
    Array<{ id: string; to_status: RequestStatus; created_at: string; note: string | null }>
  >();

  if (requestIds.length > 0) {
    const { data: history } = await supabase
      .from("service_request_status_history")
      .select("id, service_request_id, to_status, created_at, note")
      .in("service_request_id", requestIds)
      .order("created_at", { ascending: true });

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
  }

  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-slate-900">Espace client</h1>
          <div className="flex items-center gap-2">
            <Button asChild className="rounded-xl bg-green-600 hover:bg-green-700">
              <Link href="/trouver-un-prestataire">Nouvelle demande</Link>
            </Button>
            <SignOutButton />
          </div>
        </div>

        <Card className="rounded-2xl border-slate-200 bg-white p-5">
          Bonjour {auth.profile?.first_name ?? "client"}, retrouvez ici vos demandes et leur suivi.
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
                        {request.city} • Urgence: {request.urgency} • Budget: {request.budget}
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      {statusLabel[request.status as RequestStatus] ?? request.status}
                    </Badge>
                  </div>

                  <p className="mt-3 text-sm text-slate-700">{request.description}</p>

                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Suivi</p>
                    <ol className="space-y-2">
                      {fallbackHistory.map((step) => (
                        <li key={step.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                          <span className="font-medium text-slate-900">{statusLabel[step.to_status] ?? step.to_status}</span>
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
