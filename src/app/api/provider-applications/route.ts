import { randomUUID } from "node:crypto";

import { applyRateLimit, jsonError, jsonSuccess } from "@/lib/api";
import { sendEmail } from "@/lib/email/sender";
import { emailTemplates } from "@/lib/email/templates";
import { providerApplicationSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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

async function uploadSensitiveDocument(file: File, targetPrefix: string) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Type de fichier non autorise (PDF/JPG/PNG/WEBP).");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Fichier trop volumineux (max 8MB).");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const path = `${targetPrefix}/${Date.now()}-${randomUUID()}-${sanitizeFileName(file.name)}`;

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.storage.from("provider-documents").upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error("Upload document impossible.");
  }

  return path;
}

export async function POST(request: Request) {
  const limited = applyRateLimit(request, "contact");
  if (limited) return limited;

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return jsonError("Format invalide. Merci de renvoyer le formulaire.", 400);
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return jsonError("Impossible de lire le formulaire.", 400);
  }

  const payloadRaw = formData.get("payload");
  if (typeof payloadRaw !== "string") {
    return jsonError("Données de candidature manquantes.", 400);
  }

  const payload = JSON.parse(payloadRaw);
  const parsed = providerApplicationSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError("Certains champs sont invalides. Merci de vérifier le formulaire.", 400, parsed.error.flatten().fieldErrors);
  }

  const authClient = await getSupabaseServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const applicantRef = user?.id ?? `guest-${Date.now()}`;

  let idDocumentPath: string | null = null;
  let residencePermitPath: string | null = null;

  try {
    const identityDocument = formData.get("identityDocument");
    const residencePermit = formData.get("residencePermit");

    if (parsed.data.idDocumentType === "piece_identite") {
      if (!(identityDocument instanceof File)) {
        return jsonError("Pièce d'identité requise.", 400);
      }
      idDocumentPath = await uploadSensitiveDocument(identityDocument, `${applicantRef}/identity`);
    } else {
      if (!(residencePermit instanceof File)) {
        return jsonError("Titre de séjour B ou C requis.", 400);
      }
      residencePermitPath = await uploadSensitiveDocument(residencePermit, `${applicantRef}/residence`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur upload document.";
    return jsonError(message, 400);
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("provider_applications").insert({
    profile_id: user?.id ?? null,
    status: "new",
    workflow_status: "pending_review",
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    business_name: parsed.data.businessName,
    company_name: parsed.data.companyName || null,
    legal_status: parsed.data.legalStatus,
    ide_number: parsed.data.ideNumber || null,
    email: parsed.data.email,
    phone: parsed.data.phone,
    address_line: parsed.data.addressLine,
    postal_code: parsed.data.postalCode,
    canton: parsed.data.canton,
    city: parsed.data.city,
    category: parsed.data.category,
    intervention_radius_km: parsed.data.interventionRadiusKm,
    services_description: parsed.data.servicesDescription,
    years_experience: parsed.data.yearsExperience,
    availability: parsed.data.availability,
    website_or_instagram: parsed.data.websiteOrInstagram || null,
    id_document_type: parsed.data.idDocumentType,
    id_document_path: idDocumentPath,
    residence_permit_type: parsed.data.residencePermitType || null,
    residence_permit_path: residencePermitPath,
    legal_responsibility_ack: parsed.data.legalResponsibilityAck,
    terms_ack: parsed.data.termsAck,
    consent: parsed.data.consent,
  });

  if (error) {
    return jsonError("Enregistrement impossible pour le moment. Merci de réessayer.", 500);
  }

  const applicantName = `${parsed.data.firstName} ${parsed.data.lastName}`.trim();
  const template = emailTemplates.providerApplicationReceived(applicantName);
  await sendEmail({ to: parsed.data.email, subject: template.subject, html: template.html });

  return jsonSuccess("Votre dossier prestataire a bien été enregistré.");
}
