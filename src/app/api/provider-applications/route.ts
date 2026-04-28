import { randomUUID } from "node:crypto";

import { applyRateLimit, enforcePublicFormSecurity, enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { sendEmail } from "@/lib/email/sender";
import { emailTemplates } from "@/lib/email/templates";
import { getErrorMessage, logEvent } from "@/lib/monitoring";
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
const ALLOWED_PROFILE_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

async function uploadSensitiveDocument(file: File, targetPrefix: string, allowedTypes = ALLOWED_TYPES) {
  if (!allowedTypes.has(file.type)) {
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

function buildStructuredProviderDescription(data: typeof providerApplicationSchema._output) {
  const capabilities = data.capabilities
    .map((item) => `- ${item.label}: ${item.hasEquipment ? "materiel disponible" : "materiel client necessaire"}`)
    .join("\n");

  const parentBlock = data.agePath === "junior"
    ? [
        "",
        "Parcours 15-17 ans",
        `Parent: ${data.parentFirstName} ${data.parentLastName}`,
        `Contact parent: ${data.parentEmail} / ${data.parentPhone}`,
        `Adresse parent: ${data.parentAddressLine}`,
        "Autorisation parentale: fournie et declaree signee",
        "Limites junior: missions simples uniquement, pas de nuit, pas de charges lourdes, pas de travaux dangereux.",
      ].join("\n")
    : "Parcours 18 ans et plus";

  return [
    data.servicesDescription,
    "",
    "Details du dossier",
    `Parcours: ${data.agePath === "junior" ? "15-17 ans" : "18 ans et plus"}`,
    `Zone couverte: ${data.coverageAreas}`,
    `Rayon: ${data.interventionRadiusKm} km`,
    `Permis de conduire: ${data.hasDrivingLicense ? data.drivingLicenseDetails || "oui" : "non"}`,
    `Vehicule disponible: ${data.hasVehicle ? "oui" : "non"}`,
    "Capacites:",
    capabilities,
    parentBlock,
  ].join("\n");
}

export async function POST(request: Request) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

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
    return jsonError("Donnees de candidature manquantes.", 400);
  }

  const payload = JSON.parse(payloadRaw);
  const parsed = providerApplicationSchema.safeParse(payload);

  if (!parsed.success) {
    return jsonError("Certains champs sont invalides. Merci de verifier le formulaire.", 400, parsed.error.flatten().fieldErrors);
  }

  const securityGuard = await enforcePublicFormSecurity(parsed.data);
  if (securityGuard) return securityGuard;

  const authClient = await getSupabaseServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return jsonError("Connexion requise pour soumettre un dossier prestataire.", 401);
  }

  const applicantRef = user.id;

  let profilePhotoPath: string | null = null;
  let idDocumentPath: string | null = null;
  let residencePermitPath: string | null = null;
  let parentAuthorizationPath: string | null = null;

  try {
    const profilePhoto = formData.get("profilePhoto");
    const identityDocument = formData.get("identityDocument");
    const residencePermit = formData.get("residencePermit");
    const parentAuthorization = formData.get("parentAuthorization");

    if (!(profilePhoto instanceof File)) {
      return jsonError("Photo de profil requise.", 400);
    }
    profilePhotoPath = await uploadSensitiveDocument(profilePhoto, `${applicantRef}/profile-photo`, ALLOWED_PROFILE_PHOTO_TYPES);

    if (parsed.data.idDocumentType === "piece_identite" || parsed.data.idDocumentType === "permis_conduire") {
      if (!(identityDocument instanceof File)) {
        return jsonError("Document d'identification requis.", 400);
      }
      idDocumentPath = await uploadSensitiveDocument(identityDocument, `${applicantRef}/identity`);
    } else {
      if (!(residencePermit instanceof File)) {
        return jsonError("Titre de sejour B ou C requis.", 400);
      }
      residencePermitPath = await uploadSensitiveDocument(residencePermit, `${applicantRef}/residence`);
    }

    if (parsed.data.agePath === "junior") {
      if (!(parentAuthorization instanceof File)) {
        return jsonError("Autorisation parentale signee requise.", 400);
      }
      parentAuthorizationPath = await uploadSensitiveDocument(parentAuthorization, `${applicantRef}/parent-authorization`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur upload document.";
    return jsonError(message, 400);
  }

  const supabase = getSupabaseAdminClient();
  const structuredDescription = buildStructuredProviderDescription(parsed.data);
  const primaryCategory = parsed.data.capabilities[0]?.label ?? parsed.data.category;
  const adminNote = parsed.data.agePath === "junior"
    ? "Parcours 15-17 ans: verifier autorisation parentale, type de missions autorisees, horaires et absence de travaux dangereux."
    : "Parcours 18 ans et plus: verifier identite, coherence des capacites et IBAN suisse.";

  const { data: insertedApplication, error } = await supabase.from("provider_applications").insert({
    profile_id: user.id,
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
    birth_date: parsed.data.birthDate,
    address_line: parsed.data.addressLine,
    postal_code: parsed.data.postalCode,
    canton: parsed.data.canton,
    city: parsed.data.city,
    country: parsed.data.country,
    category: primaryCategory,
    intervention_radius_km: parsed.data.interventionRadiusKm,
    services_description: structuredDescription,
    years_experience: parsed.data.yearsExperience,
    availability: parsed.data.availability,
    languages: parsed.data.languages.split(",").map((item) => item.trim()).filter(Boolean),
    accepts_urgency: parsed.data.acceptsUrgency,
    website_or_instagram: parsed.data.websiteOrInstagram || null,
    iban: parsed.data.iban || null,
    vat_number: parsed.data.vatNumber || null,
    id_document_type: parsed.data.idDocumentType,
    id_document_path: idDocumentPath,
    residence_permit_type: parsed.data.residencePermitType || null,
    residence_permit_path: residencePermitPath,
    legal_responsibility_ack: parsed.data.legalResponsibilityAck,
    terms_ack: parsed.data.termsAck,
    consent: parsed.data.consent,
    admin_note: adminNote,
  }).select("id, profile_id").single();

  if (error) {
    return jsonError("Enregistrement impossible pour le moment. Merci de reessayer.", 500);
  }

  if (insertedApplication?.id) {
    const documentsToInsert = [];
    if (profilePhotoPath) {
      documentsToInsert.push({
        profile_id: user.id,
        application_id: insertedApplication.id,
        kind: "other",
        status: "pending_review",
        storage_path: profilePhotoPath,
        original_filename: `Photo de profil - ${(formData.get("profilePhoto") as File | null)?.name ?? "profil"}`,
        mime_type: (formData.get("profilePhoto") as File | null)?.type ?? null,
        file_size_bytes: (formData.get("profilePhoto") as File | null)?.size ?? null,
        admin_note: "Photo de profil a verifier avant publication.",
      });
    }
    if (idDocumentPath) {
      documentsToInsert.push({
        profile_id: user.id,
        application_id: insertedApplication.id,
        kind: "identity",
        status: "pending_review",
        storage_path: idDocumentPath,
        original_filename: (formData.get("identityDocument") as File | null)?.name ?? null,
        mime_type: (formData.get("identityDocument") as File | null)?.type ?? null,
        file_size_bytes: (formData.get("identityDocument") as File | null)?.size ?? null,
      });
    }
    if (residencePermitPath) {
      documentsToInsert.push({
        profile_id: user.id,
        application_id: insertedApplication.id,
        kind: "residence_permit",
        status: "pending_review",
        storage_path: residencePermitPath,
        original_filename: (formData.get("residencePermit") as File | null)?.name ?? null,
        mime_type: (formData.get("residencePermit") as File | null)?.type ?? null,
        file_size_bytes: (formData.get("residencePermit") as File | null)?.size ?? null,
      });
    }
    if (parentAuthorizationPath) {
      documentsToInsert.push({
        profile_id: user.id,
        application_id: insertedApplication.id,
        kind: "other",
        status: "pending_review",
        storage_path: parentAuthorizationPath,
        original_filename: `Autorisation parentale - ${(formData.get("parentAuthorization") as File | null)?.name ?? "document"}`,
        mime_type: (formData.get("parentAuthorization") as File | null)?.type ?? null,
        file_size_bytes: (formData.get("parentAuthorization") as File | null)?.size ?? null,
        admin_note: "Autorisation parentale signee a verifier.",
      });
    }

    if (documentsToInsert.length > 0) {
      await supabase.from("provider_documents").insert(documentsToInsert);
    }
  }

  const applicantName = `${parsed.data.firstName} ${parsed.data.lastName}`.trim();
  const template = emailTemplates.providerApplicationReceived(applicantName);
  try {
    await sendEmail({ to: parsed.data.email, subject: template.subject, html: template.html });
  } catch (error) {
    logEvent("error", {
      event: "provider_application.email_failed",
      message: "Provider application saved but confirmation email failed.",
      context: { reason: getErrorMessage(error), email: parsed.data.email },
    });
  }

  return jsonSuccess("Votre dossier prestataire a bien ete enregistre.");
}
