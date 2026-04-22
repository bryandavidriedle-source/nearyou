import { jsonError } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAdminScopes(["super_admin", "admin_review", "admin_ops"]);
  if (!auth) return jsonError("Acces non autorise.", 403);

  const { id } = await context.params;
  const supabase = getSupabaseAdminClient();

  const { data: document, error } = await supabase
    .from("provider_documents")
    .select("id, storage_path")
    .eq("id", id)
    .maybeSingle();

  if (error || !document) {
    return jsonError("Document introuvable.", 404);
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from("provider-documents")
    .createSignedUrl(document.storage_path, 120);

  if (signedError || !signed?.signedUrl) {
    return jsonError("Impossible de generer l'acces au document.", 500);
  }

  await supabase.from("admin_audit_events").insert({
    actor_profile_id: auth.user.id,
    action: "provider_document.download",
    entity: "provider_documents",
    entity_id: id,
    metadata: { adminScope: auth.adminScope },
  });

  return Response.json({ success: true, url: signed.signedUrl });
}
