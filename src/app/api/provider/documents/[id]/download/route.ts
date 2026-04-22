import { jsonError } from "@/lib/api";
import { requireApiProviderAccess } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiProviderAccess();
  if (!auth) return jsonError("Acces non autorise.", 403);

  const { id } = await context.params;
  const supabase = getSupabaseAdminClient();

  const { data: document, error } = await supabase
    .from("provider_documents")
    .select("id, profile_id, storage_path")
    .eq("id", id)
    .maybeSingle();

  if (error || !document || document.profile_id !== auth.user.id) {
    return jsonError("Document introuvable.", 404);
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from("provider-documents")
    .createSignedUrl(document.storage_path, 120);

  if (signedError || !signed?.signedUrl) {
    return jsonError("Impossible de generer l'acces au document.", 500);
  }

  return Response.json({ success: true, url: signed.signedUrl });
}
