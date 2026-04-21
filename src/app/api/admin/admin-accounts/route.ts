import { jsonError, jsonSuccess } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const createAdminSchema = z.object({
  email: z.string().email(),
  scope: z.enum(["super_admin", "admin_ops", "admin_support", "admin_review"]),
  isActive: z.boolean().optional().default(true),
});

export async function GET() {
  const auth = await requireApiAdminScopes(["super_admin"]);
  if (!auth) return jsonError("Accès non autorisé.", 403);

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_accounts")
    .select("profile_id, scope, is_active, created_at, profiles!inner(first_name,last_name)")
    .order("created_at", { ascending: false });

  if (error) return jsonError("Impossible de charger les administrateurs.", 500);
  return Response.json({ success: true, data });
}

export async function POST(request: Request) {
  const auth = await requireApiAdminScopes(["super_admin"]);
  if (!auth) return jsonError("Accès non autorisé.", 403);

  const body = await request.json().catch(() => null);
  const parsed = createAdminSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Données invalides.", 400, parsed.error.flatten().fieldErrors);
  }

  const supabase = getSupabaseAdminClient();
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

  if (userError) return jsonError("Impossible de vérifier l'utilisateur.", 500);

  const user = userData.users.find((item) => item.email?.toLowerCase() === parsed.data.email.toLowerCase());
  if (!user) return jsonError("Utilisateur introuvable pour cet email.", 404);

  const profileId = user.id;
  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", profileId);

  if (profileUpdateError) return jsonError("Impossible de promouvoir le profil en admin.", 500);

  const { error: upsertError } = await supabase.from("admin_accounts").upsert({
    profile_id: profileId,
    scope: parsed.data.scope,
    is_active: parsed.data.isActive,
    created_by: auth.user.id,
  });

  if (upsertError) return jsonError("Impossible de créer l'admin.", 500);

  await supabase.from("admin_audit_events").insert({
    actor_profile_id: auth.user.id,
    action: "admin_account.upsert",
    entity: "admin_accounts",
    entity_id: profileId,
    metadata: {
      scope: parsed.data.scope,
      isActive: parsed.data.isActive,
      email: parsed.data.email,
    },
  });

  return jsonSuccess("Administrateur enregistré.");
}

