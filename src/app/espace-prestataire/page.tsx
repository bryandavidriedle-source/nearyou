import { Container } from "@/components/shared/container";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  submitted: "Soumis",
  pending_review: "En attente de validation",
  approved: "Approuvé",
  rejected: "Refusé",
  needs_info: "A compléter",
};

export default async function ProviderDashboardPage() {
  const auth = await requireRole("provider");
  const supabase = await getSupabaseServerClient();

  const { data: applications } = await supabase
    .from("provider_applications")
    .select("id, workflow_status, created_at, category, city, intervention_radius_km, admin_note")
    .eq("profile_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const latest = applications?.[0] ?? null;

  return (
    <section className="py-12">
      <Container className="max-w-4xl space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">Espace prestataire</h1>
        <Card className="rounded-2xl border-slate-200 bg-white p-5">
          Bonjour {auth.profile?.first_name ?? "prestataire"}, suivez l'état de votre dossier et préparez vos prochaines missions.
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-2xl border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Statut du dossier</h2>
            {latest ? (
              <>
                <p className="mt-2 text-sm text-slate-600">Statut actuel: <span className="font-semibold text-slate-900">{statusLabels[latest.workflow_status] ?? latest.workflow_status}</span></p>
                <p className="text-sm text-slate-600">Catégorie: {latest.category}</p>
                <p className="text-sm text-slate-600">Zone: {latest.city} · {latest.intervention_radius_km ?? "-"} km</p>
                {latest.admin_note ? (
                  <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Note admin: {latest.admin_note}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-600">Aucun dossier trouvé. Déposez votre candidature depuis la page Devenir prestataire.</p>
            )}
          </Card>

          <Card className="rounded-2xl border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Visibilité marketplace</h2>
            <p className="mt-2 text-sm text-slate-600">
              Vos services sont visibles uniquement après validation manuelle par un administrateur autorisé.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Le matching futur sera basé sur catégorie, rayon d'intervention et disponibilité.
            </p>
          </Card>
        </div>

        <Card className="rounded-2xl border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Historique des dossiers</h2>
          <ul className="mt-3 space-y-2">
            {(applications ?? []).map((item) => (
              <li key={item.id} className="rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-700">
                {new Date(item.created_at).toLocaleString("fr-CH")} · {item.category} · {statusLabels[item.workflow_status] ?? item.workflow_status}
              </li>
            ))}
          </ul>
        </Card>
      </Container>
    </section>
  );
}
