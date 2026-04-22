import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { providerDocumentReviewSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await requireApiAdminScopes(["super_admin", "admin_review"]);
  if (!auth) return jsonError("Acces non autorise.", 403);

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = providerDocumentReviewSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Donnees invalides.", 400, parsed.error.flatten().fieldErrors);
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("provider_documents")
    .update({
      status: parsed.data.status,
      admin_note: parsed.data.adminNote || null,
      reviewed_by: auth.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return jsonError("Impossible de mettre a jour ce document.", 500);
  }

  await supabase.from("admin_audit_events").insert({
    actor_profile_id: auth.user.id,
    action: "provider_document.review",
    entity: "provider_documents",
    entity_id: id,
    metadata: {
      status: parsed.data.status,
      adminNote: parsed.data.adminNote || null,
      adminScope: auth.adminScope,
    },
  });

  return jsonSuccess("Document mis a jour.");
}
