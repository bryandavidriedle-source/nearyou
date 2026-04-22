import { z } from "zod";

import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const createSchema = z.object({
  slug: z.string().trim().min(2).max(60),
  nameFr: z.string().trim().min(2).max(100),
  description: z.string().trim().max(400).optional().or(z.literal("")),
  fromPriceChf: z.number().int().min(0).max(5000).optional().default(0),
});

export async function GET() {
  const auth = await requireApiAdminScopes(["super_admin", "admin_ops", "admin_review"]);
  if (!auth) return jsonError("Acces non autorise.", 403);

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("service_categories")
    .select("id, slug, name_fr, description, from_price_chf, active, display_order, created_at")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return jsonError("Impossible de charger les categories.", 500);
  return Response.json({ success: true, data: data ?? [] });
}

export async function POST(request: Request) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await requireApiAdminScopes(["super_admin", "admin_ops"]);
  if (!auth) return jsonError("Acces non autorise.", 403);

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Donnees invalides.", 400, parsed.error.flatten().fieldErrors);
  }

  const supabase = getSupabaseAdminClient();
  const { data: lastCategory } = await supabase
    .from("service_categories")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (lastCategory?.display_order ?? -1) + 1;

  const { error } = await supabase.from("service_categories").insert({
    slug: parsed.data.slug,
    name_fr: parsed.data.nameFr,
    description: parsed.data.description || null,
    from_price_chf: parsed.data.fromPriceChf,
    display_order: nextOrder,
    active: true,
  });

  if (error) {
    return jsonError("Impossible de creer cette categorie.", 500);
  }

  await supabase.from("admin_audit_events").insert({
    actor_profile_id: auth.user.id,
    action: "category.create",
    entity: "service_categories",
    metadata: {
      slug: parsed.data.slug,
      nameFr: parsed.data.nameFr,
      adminScope: auth.adminScope,
    },
  });

  return jsonSuccess("Categorie creee.");
}
