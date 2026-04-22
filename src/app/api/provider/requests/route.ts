import { jsonError } from "@/lib/api";
import { requireApiProviderAccess } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireApiProviderAccess();
  if (!auth) return jsonError("Acces non autorise.", 403);

  const supabase = getSupabaseAdminClient();

  const latestApplication = auth.providerApplication;
  if (latestApplication?.workflow_status !== "approved") {
    return Response.json({
      success: true,
      data: {
        available: [],
        assigned: [],
        accepted: [],
        inProgress: [],
        completed: [],
        cancelled: [],
        declined: [],
        disputed: [],
        allAssigned: [],
      },
      providerAccessLevel: auth.providerAccessLevel,
      providerStatus: latestApplication?.workflow_status ?? "draft",
    });
  }

  const category = latestApplication?.category;

  const openQuery = supabase
    .from("service_requests")
    .select("id, first_name, last_name, email, phone, category, city, client_address, description, urgency, budget, budget_amount_chf, status, provider_status, created_at, scheduled_for")
    .in("provider_status", ["new", "pending_assignment"])
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: availableRequests, error: availableError } = category
    ? await openQuery.eq("category", category)
    : await openQuery;

  const { data: assignedRequests, error: assignedError } = await supabase
    .from("service_requests")
    .select("id, first_name, last_name, email, phone, category, city, client_address, description, urgency, budget, budget_amount_chf, status, provider_status, created_at, scheduled_for, completed_at, assigned_at")
    .eq("assigned_provider_profile_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(300);

  if (availableError || assignedError) {
    return jsonError("Impossible de charger les demandes prestataire.", 500);
  }

  const grouped = {
    available: (availableRequests ?? []).filter((item) => item.provider_status === "new" || item.provider_status === "pending_assignment"),
    assigned: (assignedRequests ?? []).filter((item) => item.provider_status === "assigned"),
    accepted: (assignedRequests ?? []).filter((item) => item.provider_status === "accepted"),
    inProgress: (assignedRequests ?? []).filter((item) => item.provider_status === "in_progress"),
    completed: (assignedRequests ?? []).filter((item) => item.provider_status === "completed"),
    cancelled: (assignedRequests ?? []).filter((item) => item.provider_status === "cancelled"),
    declined: (assignedRequests ?? []).filter((item) => item.provider_status === "declined"),
    disputed: (assignedRequests ?? []).filter((item) => item.provider_status === "disputed"),
    allAssigned: assignedRequests ?? [],
  };

  const requestIds = (assignedRequests ?? []).map((item) => item.id);
  const supplementsByRequest: Record<string, Array<{ id: string; amount_chf: number; reason: string; status: string; requested_at: string }>> = {};

  if (requestIds.length > 0) {
    const { data: supplements } = await supabase
      .from("service_request_supplements")
      .select("id, service_request_id, amount_chf, reason, status, requested_at")
      .in("service_request_id", requestIds)
      .order("requested_at", { ascending: false });

    for (const supplement of supplements ?? []) {
      const existing = supplementsByRequest[supplement.service_request_id] ?? [];
      existing.push({
        id: supplement.id,
        amount_chf: Number(supplement.amount_chf),
        reason: supplement.reason,
        status: supplement.status,
        requested_at: supplement.requested_at,
      });
      supplementsByRequest[supplement.service_request_id] = existing;
    }
  }

  return Response.json({
    success: true,
    data: grouped,
    supplementsByRequest,
    providerAccessLevel: auth.providerAccessLevel,
    providerStatus: latestApplication?.workflow_status,
  });
}
