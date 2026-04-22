import { randomUUID } from "node:crypto";

import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { requireApiProviderAccess } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { providerDocumentKinds } from "@/lib/workflow";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

export async function GET() {
  const auth = await requireApiProviderAccess();
  if (!auth) return jsonError("Acces non autorise.", 403);

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("provider_documents")
    .select("id, kind, status, original_filename, file_size_bytes, admin_note, reviewed_at, created_at")
    .eq("profile_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return jsonError("Impossible de charger les documents.", 500);
  }

  return Response.json({ success: true, data: data ?? [] });
}

export async function POST(request: Request) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await requireApiProviderAccess();
  if (!auth) return jsonError("Acces non autorise.", 403);
  if (auth.isSuspended) return jsonError("Compte suspendu: upload desactive temporairement.", 403);

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return jsonError("Format invalide.", 400);
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return jsonError("Impossible de lire le formulaire.", 400);
  }

  const kind = formData.get("kind");
  const file = formData.get("file");

  if (typeof kind !== "string" || !providerDocumentKinds.includes(kind as (typeof providerDocumentKinds)[number])) {
    return jsonError("Type de document invalide.", 400);
  }

  if (!(file instanceof File)) {
    return jsonError("Fichier manquant.", 400);
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return jsonError("Type de fichier non autorise (PDF/JPG/PNG/WEBP).", 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return jsonError("Fichier trop volumineux (max 8MB).", 400);
  }

  const supabase = getSupabaseAdminClient();

  const { data: latestApplication } = await supabase
    .from("provider_applications")
    .select("id")
    .eq("profile_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const buffer = Buffer.from(await file.arrayBuffer());
  const path = `${auth.user.id}/${kind}/${Date.now()}-${randomUUID()}-${sanitizeFileName(file.name)}`;

  const { error: storageError } = await supabase.storage.from("provider-documents").upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (storageError) {
    return jsonError("Upload impossible pour le moment.", 500);
  }

  const { error: dbError } = await supabase.from("provider_documents").insert({
    profile_id: auth.user.id,
    application_id: latestApplication?.id ?? null,
    kind,
    status: "pending_review",
    storage_path: path,
    original_filename: file.name,
    mime_type: file.type,
    file_size_bytes: file.size,
  });

  if (dbError) {
    await supabase.storage.from("provider-documents").remove([path]);
    return jsonError("Impossible d'enregistrer ce document.", 500);
  }

  await supabase.from("provider_notifications").insert({
    profile_id: auth.user.id,
    notification_type: "document_uploaded",
    title: "Document recu",
    body: "Votre document a bien ete recu et sera verifie par notre equipe.",
    data: { kind },
  });

  return jsonSuccess("Document televerse.");
}
