import { jsonError } from "@/lib/api";
import { requireApiAdminScopes } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAdminScopes(["super_admin", "admin_review"]);
  if (!auth) {
    return jsonError("Accès non autorisé.", 403);
  }

  const { id } = await context.params;
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");

  if (kind !== "identity" && kind !== "residence") {
    return jsonError("Type de document invalide.", 400);
  }

  const supabase = getSupabaseAdminClient();
  const { data: application, error: appError } = await supabase
    .from("provider_applications")
    .select("id_document_path, residence_permit_path")
    .eq("id", id)
    .maybeSingle();

  if (appError || !application) {
    return jsonError("Dossier introuvable.", 404);
  }

  const path = kind === "identity" ? application.id_document_path : application.residence_permit_path;
  if (!path) {
    return jsonError("Document non disponible.", 404);
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from("provider-documents")
    .createSignedUrl(path, 120);

  if (signedError || !signed?.signedUrl) {
    return jsonError("Impossible de générer l'accès au document.", 500);
  }

  await supabase.from("admin_audit_events").insert({
    actor_profile_id: auth.user.id,
    action: "provider_document.view",
    entity: "provider_applications",
    entity_id: id,
    metadata: { kind, path, adminScope: auth.adminScope },
  });

  return Response.json({ success: true, url: signed.signedUrl });
}

