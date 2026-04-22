import { z } from "zod";

import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const patchSchema = z.object({
  nameFr: z.string().trim().min(2).max(100).optional(),
  slug: z.string().trim().min(2).max(60).optional(),
  description: z.string().trim().max(400).optional().or(z.literal("")),
  fromPriceChf: z.number().int().min(0).max(5000).optional(),
  active: z.boolean().optional(),
  displayOrder: z.number().int().min(0).max(5000).optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await requireApiAdminScopes(["super_admin", "admin_ops"]);
  if (!auth) return jsonError("Acces non autorise.", 403);

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Donnees invalides.", 400, parsed.error.flatten().fieldErrors);
  }

  const patchPayload: Record<string, string | number | boolean | null> = {};
  if (parsed.data.nameFr) patchPayload.name_fr = parsed.data.nameFr;
  if (parsed.data.slug) patchPayload.slug = parsed.data.slug;
  if (parsed.data.description !== undefined) patchPayload.description = parsed.data.description || null;
  if (parsed.data.fromPriceChf !== undefined) patchPayload.from_price_chf = parsed.data.fromPriceChf;
  if (parsed.data.active !== undefined) patchPayload.active = parsed.data.active;
  if (parsed.data.displayOrder !== undefined) patchPayload.display_order = parsed.data.displayOrder;

  if (Object.keys(patchPayload).length === 0) {
    return jsonError("Aucune modification demandee.", 400);
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("service_categories").update(patchPayload).eq("id", id);
  if (error) {
    return jsonError("Impossible de mettre a jour cette categorie.", 500);
  }

  await supabase.from("admin_audit_events").insert({
    actor_profile_id: auth.user.id,
    action: "category.patch",
    entity: "service_categories",
    entity_id: id,
    metadata: {
      ...patchPayload,
      adminScope: auth.adminScope,
    },
  });

  return jsonSuccess("Categorie mise a jour.");
}
