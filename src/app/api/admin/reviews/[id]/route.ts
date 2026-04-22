import { z } from "zod";

import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const reviewPatchSchema = z.object({
  isPublic: z.boolean().optional(),
  isModerated: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await requireApiAdminScopes(["super_admin", "admin_review"]);
  if (!auth) {
    return jsonError("Acces non autorise.", 403);
  }

  const body = await request.json().catch(() => null);
  const parsed = reviewPatchSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Donnees invalides.", 400, parsed.error.flatten().fieldErrors);
  }

  const { id } = await context.params;
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from("reviews")
    .update({
      is_public: parsed.data.isPublic,
      is_moderated: parsed.data.isModerated,
    })
    .eq("id", id);

  if (error) {
    return jsonError("Impossible de moderer cet avis.", 500);
  }

  await supabase.from("admin_audit_events").insert({
    actor_profile_id: auth.user.id,
    action: "review.moderation",
    entity: "reviews",
    entity_id: id,
    metadata: {
      isPublic: parsed.data.isPublic,
      isModerated: parsed.data.isModerated,
      adminScope: auth.adminScope,
    },
  });

  return jsonSuccess("Avis mis a jour.");
}
