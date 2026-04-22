import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { logAdminAction } from "@/lib/audit";
import { requireApiAdminScopes } from "@/lib/auth";
import { callRequestStatusSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await requireApiAdminScopes(["super_admin", "admin_support", "admin_ops"]);
  if (!auth) {
    return jsonError("Acces non autorise.", 403);
  }

  const body = await request.json().catch(() => null);
  const parsed = callRequestStatusSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Statut invalide.", 400, parsed.error.flatten().fieldErrors);
  }

  const { id } = await params;

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("call_requests")
    .update({ status: parsed.data.status })
    .eq("id", id);

  if (error) {
    return jsonError("Mise a jour impossible.", 500);
  }

  await logAdminAction("call_request_status_updated", "call_requests", id, {
    status: parsed.data.status,
    adminScope: auth.adminScope,
  });

  return jsonSuccess("Statut mis a jour.");
}
