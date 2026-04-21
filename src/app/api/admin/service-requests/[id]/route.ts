import { jsonError, jsonSuccess } from "@/lib/api";
import { requireApiRole } from "@/lib/auth";
import { serviceRequestStatusSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole("admin");
  if (!auth) {
    return jsonError("Accès réservé aux administrateurs.", 403);
  }

  const { id } = await context.params;
  const payload = await request.json().catch(() => null);
  const parsed = serviceRequestStatusSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError("Statut invalide.", 400, parsed.error.flatten().fieldErrors);
  }

  const supabase = getSupabaseAdminClient();

  const { data: current, error: currentError } = await supabase
    .from("service_requests")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();

  if (currentError || !current) {
    return jsonError("Demande introuvable.", 404);
  }

  const { error: updateError } = await supabase
    .from("service_requests")
    .update({ status: parsed.data.status })
    .eq("id", id);

  if (updateError) {
    return jsonError("Impossible de mettre à jour la demande.", 500);
  }

  if (current.status !== parsed.data.status) {
    await supabase.from("service_request_status_history").insert({
      service_request_id: id,
      from_status: current.status,
      to_status: parsed.data.status,
      changed_by: auth.user.id,
      note: parsed.data.note || null,
    });
  }

  return jsonSuccess("Statut mis à jour.");
}

