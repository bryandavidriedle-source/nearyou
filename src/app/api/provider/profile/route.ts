import { z } from "zod";

import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { requireApiProviderAccess } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(2).max(80).optional(),
  lastName: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().min(8).max(30).optional(),
  addressLine: z.string().trim().max(200).optional(),
  postalCode: z.string().trim().max(20).optional(),
  city: z.string().trim().max(120).optional(),
  canton: z.string().trim().max(10).optional(),
  country: z.string().trim().max(60).optional(),
  interventionRadiusKm: z.number().int().min(1).max(100).optional(),
  category: z.string().trim().min(2).max(80).optional(),
  servicesDescription: z.string().trim().min(10).max(4000).optional(),
  yearsExperience: z.string().trim().max(30).optional(),
  availability: z.string().trim().max(200).optional(),
  legalStatus: z.enum(["independant", "entreprise"]).optional(),
  companyName: z.string().trim().max(120).optional().or(z.literal("")),
  ideNumber: z.string().trim().max(40).optional().or(z.literal("")),
  iban: z.string().trim().max(60).optional().or(z.literal("")),
  vatNumber: z.string().trim().max(40).optional().or(z.literal("")),
  languages: z.array(z.string().trim().min(2).max(40)).max(6).optional(),
  acceptsUrgency: z.boolean().optional(),
  birthDate: z.string().date().optional(),
  submitForReview: z.boolean().optional(),
}).superRefine((value, ctx) => {
  if (value.birthDate) {
    const birth = new Date(value.birthDate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      years -= 1;
    }
    if (years < 15) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthDate"],
        message: "Âge minimum requis: 15 ans.",
      });
    }
  }
});

export async function GET() {
  const auth = await requireApiProviderAccess();
  if (!auth) {
    return jsonError("Acces non autorise.", 403);
  }

  const supabase = getSupabaseAdminClient();

  const [profileRes, applicationRes, providerRes, documentsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, first_name, last_name, phone, city, role, account_status")
      .eq("id", auth.user.id)
      .maybeSingle(),
    supabase
      .from("provider_applications")
      .select("id, workflow_status, first_name, last_name, email, phone, birth_date, business_name, address_line, postal_code, city, canton, country, category, intervention_radius_km, services_description, years_experience, availability, legal_status, company_name, ide_number, iban, vat_number, languages, accepts_urgency, website_or_instagram, admin_note, reviewed_at, updated_at")
      .eq("profile_id", auth.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("providers")
      .select("id, display_name, hourly_from_chf, is_active")
      .eq("profile_id", auth.user.id)
      .maybeSingle(),
    supabase
      .from("provider_documents")
      .select("id, status")
      .eq("profile_id", auth.user.id),
  ]);

  if (profileRes.error) {
    return jsonError("Impossible de charger votre profil.", 500);
  }

  return Response.json({
    success: true,
    data: {
      profile: profileRes.data,
      application: applicationRes.data,
      provider: providerRes.data,
      documents: {
        total: (documentsRes.data ?? []).length,
        approved: (documentsRes.data ?? []).filter((item) => item.status === "approved").length,
        pending: (documentsRes.data ?? []).filter((item) => item.status === "pending_review" || item.status === "uploaded").length,
        needsResubmission: (documentsRes.data ?? []).filter((item) => item.status === "needs_resubmission" || item.status === "rejected").length,
      },
      providerAccessLevel: auth.providerAccessLevel,
      isSuspended: auth.isSuspended,
    },
  });
}

export async function PATCH(request: Request) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await requireApiProviderAccess();
  if (!auth) {
    return jsonError("Acces non autorise.", 403);
  }
  if (auth.isSuspended) {
    return jsonError("Compte prestataire suspendu: modifications indisponibles.", 403);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Donnees invalides.", 400, parsed.error.flatten().fieldErrors);
  }

  const supabase = getSupabaseAdminClient();

  const profilePatch: Record<string, string> = {};
  if (parsed.data.firstName) profilePatch.first_name = parsed.data.firstName;
  if (parsed.data.lastName) profilePatch.last_name = parsed.data.lastName;
  if (parsed.data.phone) profilePatch.phone = parsed.data.phone;
  if (parsed.data.city) profilePatch.city = parsed.data.city;

  if (Object.keys(profilePatch).length > 0) {
    const { error } = await supabase.from("profiles").update(profilePatch).eq("id", auth.user.id);
    if (error) {
      return jsonError("Impossible de mettre a jour le profil.", 500);
    }
  }

  const { data: latestApplication } = await supabase
    .from("provider_applications")
    .select("id, workflow_status")
    .eq("profile_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const applicationPatch: Record<string, string | number | boolean | string[] | null> = {};
  if (parsed.data.firstName) applicationPatch.first_name = parsed.data.firstName;
  if (parsed.data.lastName) applicationPatch.last_name = parsed.data.lastName;
  if (parsed.data.phone) applicationPatch.phone = parsed.data.phone;
  if (parsed.data.addressLine) applicationPatch.address_line = parsed.data.addressLine;
  if (parsed.data.postalCode) applicationPatch.postal_code = parsed.data.postalCode;
  if (parsed.data.city) applicationPatch.city = parsed.data.city;
  if (parsed.data.canton) applicationPatch.canton = parsed.data.canton;
  if (parsed.data.interventionRadiusKm) applicationPatch.intervention_radius_km = parsed.data.interventionRadiusKm;
  if (parsed.data.category) applicationPatch.category = parsed.data.category;
  if (parsed.data.servicesDescription) applicationPatch.services_description = parsed.data.servicesDescription;
  if (parsed.data.yearsExperience) applicationPatch.years_experience = parsed.data.yearsExperience;
  if (parsed.data.availability) applicationPatch.availability = parsed.data.availability;
  if (parsed.data.legalStatus) applicationPatch.legal_status = parsed.data.legalStatus;
  if (parsed.data.companyName !== undefined) applicationPatch.company_name = parsed.data.companyName || null;
  if (parsed.data.ideNumber !== undefined) applicationPatch.ide_number = parsed.data.ideNumber || null;
  if (parsed.data.country !== undefined) applicationPatch.country = parsed.data.country || null;
  if (parsed.data.iban !== undefined) applicationPatch.iban = parsed.data.iban || null;
  if (parsed.data.vatNumber !== undefined) applicationPatch.vat_number = parsed.data.vatNumber || null;
  if (parsed.data.languages !== undefined) applicationPatch.languages = parsed.data.languages;
  if (parsed.data.acceptsUrgency !== undefined) applicationPatch.accepts_urgency = parsed.data.acceptsUrgency;
  if (parsed.data.birthDate !== undefined) applicationPatch.birth_date = parsed.data.birthDate;

  const nextWorkflowStatus =
    parsed.data.submitForReview
      ? "pending_review"
      : latestApplication?.workflow_status === "needs_info"
        ? "submitted"
        : undefined;

  if (nextWorkflowStatus) {
    applicationPatch.workflow_status = nextWorkflowStatus;
  }

  if (latestApplication) {
    if (Object.keys(applicationPatch).length > 0) {
      const { error } = await supabase
        .from("provider_applications")
        .update(applicationPatch)
        .eq("id", latestApplication.id);

      if (error) {
        return jsonError("Impossible de mettre a jour le dossier prestataire.", 500);
      }
    }
  } else {
    const { data: userData } = await supabase.auth.admin.getUserById(auth.user.id);
    const userEmail = userData.user?.email ?? null;

    const insertPayload = {
      profile_id: auth.user.id,
      status: "new",
      workflow_status: parsed.data.submitForReview ? "pending_review" : "draft",
      first_name: parsed.data.firstName ?? auth.profile?.first_name ?? null,
      last_name: parsed.data.lastName ?? auth.profile?.last_name ?? null,
      business_name: `${parsed.data.firstName ?? auth.profile?.first_name ?? ""} ${parsed.data.lastName ?? auth.profile?.last_name ?? ""}`.trim() || "Prestataire PrèsDeToi",
      email: userEmail,
      phone: parsed.data.phone ?? null,
      address_line: parsed.data.addressLine ?? null,
      postal_code: parsed.data.postalCode ?? null,
      canton: parsed.data.canton ?? null,
      city: parsed.data.city ?? auth.profile?.city ?? null,
      category: parsed.data.category ?? "À définir",
      intervention_radius_km: parsed.data.interventionRadiusKm ?? 20,
      services_description: parsed.data.servicesDescription ?? "Description à compléter",
      years_experience: parsed.data.yearsExperience ?? "0",
      availability: parsed.data.availability ?? "À définir",
      legal_status: parsed.data.legalStatus ?? "independant",
      birth_date: parsed.data.birthDate ?? null,
      company_name: parsed.data.companyName || null,
      ide_number: parsed.data.ideNumber || null,
      country: parsed.data.country || "Suisse",
      iban: parsed.data.iban || null,
      vat_number: parsed.data.vatNumber || null,
      languages: parsed.data.languages ?? ["fr"],
      accepts_urgency: parsed.data.acceptsUrgency ?? false,
      legal_responsibility_ack: true,
      terms_ack: true,
      consent: true,
    };

    const { error } = await supabase.from("provider_applications").insert(insertPayload);
    if (error) {
      return jsonError("Impossible de creer le dossier prestataire.", 500);
    }
  }

  return jsonSuccess("Profil prestataire mis a jour.");
}

