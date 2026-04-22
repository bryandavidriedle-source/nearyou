import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const updateAdminSchema = z.object({
  scope: z.enum(["super_admin", "admin_ops", "admin_support", "admin_review"]).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ profileId: string }> },
) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await requireApiAdminScopes(["super_admin"]);
  if (!auth) return jsonError("Accès non autorisé.", 403);

  const { profileId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateAdminSchema.safeParse(body);
  if (!parsed.success) return jsonError("Données invalides.", 400, parsed.error.flatten().fieldErrors);

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("admin_accounts")
    .update({
      scope: parsed.data.scope,
      is_active: parsed.data.isActive,
    })
    .eq("profile_id", profileId);

  if (error) return jsonError("Impossible de mettre à jour cet admin.", 500);

  await supabase.from("admin_audit_events").insert({
    actor_profile_id: auth.user.id,
    action: "admin_account.patch",
    entity: "admin_accounts",
    entity_id: profileId,
    metadata: parsed.data,
  });

  return jsonSuccess("Administrateur mis à jour.");
}
