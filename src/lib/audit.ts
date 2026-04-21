import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function logAdminAction(action: string, entity: string, entityId: string, metadata: Record<string, unknown> = {}) {
  const supabaseServer = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  const supabaseAdmin = getSupabaseAdminClient();

  await supabaseAdmin.from("audit_logs").insert({
    actor_profile_id: user?.id ?? null,
    actor_role: "admin",
    action,
    entity,
    entity_id: entityId,
    metadata,
  });
}
