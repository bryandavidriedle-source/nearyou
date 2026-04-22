import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { requireApiProviderAccess } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await requireApiProviderAccess();
  if (!auth) return jsonError("Acces non autorise.", 403);

  const { id } = await context.params;
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("provider_notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("profile_id", auth.user.id);

  if (error) {
    return jsonError("Impossible de mettre a jour la notification.", 500);
  }

  return jsonSuccess("Notification lue.");
}
