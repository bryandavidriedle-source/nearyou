import { z } from "zod";

import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const patchSchema = z.object({
  accountStatus: z.enum(["active", "suspended"]).optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await requireApiAdminScopes(["super_admin", "admin_ops", "admin_support"]);
  if (!auth) return jsonError("Acces non autorise.", 403);

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success || !parsed.data.accountStatus) {
    return jsonError("Donnees invalides.", 400, parsed.error?.flatten().fieldErrors);
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ account_status: parsed.data.accountStatus })
    .eq("id", id)
    .eq("role", "customer");

  if (error) {
    return jsonError("Impossible de mettre a jour ce compte client.", 500);
  }

  await supabase.from("admin_audit_events").insert({
    actor_profile_id: auth.user.id,
    action: "client_account.patch_status",
    entity: "profiles",
    entity_id: id,
    metadata: {
      accountStatus: parsed.data.accountStatus,
      adminScope: auth.adminScope,
    },
  });

  return jsonSuccess("Compte client mis a jour.");
}
