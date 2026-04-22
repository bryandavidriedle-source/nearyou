import Link from "next/link";

import { Card } from "@/components/ui/card";
import { requireProviderAccess } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { providerRequestLabels } from "@/lib/workflow";

export default async function ProviderDashboardPage() {
  const auth = await requireProviderAccess();
  const supabase = getSupabaseAdminClient();

  const [requestsRes, notificationsRes, documentsRes, paymentsRes, providerRes, availabilityRulesRes] = await Promise.all([
    supabase
      .from("service_requests")
      .select("id, provider_status, created_at, category, city")
      .eq("assigned_provider_profile_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(40),
    supabase
      .from("provider_notifications")
      .select("id, title, body, is_read, created_at")
      .eq("profile_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("provider_documents")
      .select("id, status")
      .eq("profile_id", auth.user.id),
    supabase
      .from("payment_records")
      .select("id, net_amount_chf, status")
      .eq("profile_id", auth.user.id),
    supabase
      .from("providers")
      .select("id, rating, completed_missions")
      .eq("profile_id", auth.user.id)
      .maybeSingle(),
    supabase
      .from("provider_availability_rules")
      .select("day_of_week, start_time, end_time, is_active")
      .eq("profile_id", auth.user.id)
      .eq("is_active", true),
  ]);

  const requests = requestsRes.data ?? [];
  const unreadNotifications = (notificationsRes.data ?? []).filter((item) => !item.is_read).length;
  const pendingDocuments = (documentsRes.data ?? []).filter((item) => item.status === "pending_review" || item.status === "needs_resubmission").length;
  const pendingPayments = (paymentsRes.data ?? []).filter((item) => item.status !== "paid").length;
  const completedMissions = requests.filter((item) => item.provider_status === "completed").length;
  const inProgress = requests.filter((item) => item.provider_status === "accepted" || item.provider_status === "in_progress").length;
  const providerRating = Number(providerRes.data?.rating ?? 4.8);
  const providerCompleted = providerRes.data?.completed_missions ?? completedMissions;
  const actionableRequests = requests.filter((item) => ["assigned", "accepted", "in_progress", "completed", "declined"].includes(item.provider_status));
  const acceptedRequests = actionableRequests.filter((item) => ["accepted", "in_progress", "completed"].includes(item.provider_status));
  const acceptanceRate = actionableRequests.length > 0 ? acceptedRequests.length / actionableRequests.length : 1;
  const providerScore = Math.min(
    100,
    Math.round(providerRating * 14 + Math.min(providerCompleted, 200) * 0.22 + acceptanceRate * 26),
  );

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const availableNow = (availabilityRulesRes.data ?? []).some((rule) => {
    if (rule.day_of_week !== now.getDay()) return false;
    const [startH, startM] = (rule.start_time ?? "00:00:00").split(":").map(Number);
    const [endH, endM] = (rule.end_time ?? "00:00:00").split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Missions en cours</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{inProgress}</p>
        </Card>
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Missions terminees</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{completedMissions}</p>
        </Card>
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Documents a suivre</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{pendingDocuments}</p>
        </Card>
        <Card className="premium-card p-4">
          <p className="text-sm text-slate-500">Notifications non lues</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{unreadNotifications}</p>
        </Card>
        <Card className="premium-card p-4 sm:col-span-2 lg:col-span-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm text-slate-500">Statut operationnel</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {auth.providerApplication?.workflow_status === "approved" ? "Prestataire valide" : "Prestataire en attente"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">Score prestataire: {providerScore}/100</span>
              <span className={`rounded-full px-3 py-1 font-semibold ${availableNow ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                {availableNow ? "Disponible maintenant" : "Hors plage actuelle"}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="premium-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Actions prioritaires</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>1. Completer vos informations de profil et de facturation.</li>
            <li>2. Verifier vos documents pour eviter un blocage de validation.</li>
            <li>3. Mettre a jour vos disponibilites hebdomadaires.</li>
            <li>4. Repondre aux demandes assignees rapidement.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/espace-prestataire/profil" className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
              Completer mon profil
            </Link>
            <Link href="/espace-prestataire/missions" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Voir mes demandes
            </Link>
          </div>
        </Card>

        <Card className="premium-card p-5">
          <h2 className="text-lg font-semibold text-slate-900">Paiements</h2>
          <p className="mt-2 text-sm text-slate-600">
            {pendingPayments > 0
              ? `${pendingPayments} paiements sont encore en attente de versement.`
              : "Aucun paiement en attente pour le moment."}
          </p>
          <Link href="/espace-prestataire/revenus" className="mt-3 inline-flex rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Ouvrir les paiements
          </Link>
        </Card>
      </div>

      <Card className="premium-card p-5">
        <h2 className="text-lg font-semibold text-slate-900">Dernieres missions</h2>
        <div className="mt-3 space-y-2">
          {requests.slice(0, 8).map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <p className="font-medium text-slate-900">{item.category} - {item.city}</p>
              <p>
                Statut: {providerRequestLabels[item.provider_status as keyof typeof providerRequestLabels] ?? item.provider_status} -{" "}
                {new Date(item.created_at).toLocaleString("fr-CH")}
              </p>
            </div>
          ))}
          {requests.length === 0 ? <p className="text-sm text-slate-500">Aucune mission pour le moment.</p> : null}
        </div>
      </Card>

      <Card className="premium-card p-5">
        <h2 className="text-lg font-semibold text-slate-900">Dernieres notifications</h2>
        <div className="mt-3 space-y-2">
          {(notificationsRes.data ?? []).map((item) => (
            <div key={item.id} className={`rounded-xl border px-3 py-2 text-sm ${item.is_read ? "border-slate-200 text-slate-600" : "border-blue-200 bg-blue-50 text-blue-900"}`}>
              <p className="font-medium">{item.title}</p>
              <p>{item.body}</p>
            </div>
          ))}
          {(notificationsRes.data ?? []).length === 0 ? <p className="text-sm text-slate-500">Aucune notification.</p> : null}
        </div>
      </Card>
    </div>
  );
}
