import { z } from "zod";

const phoneRegex = /^[+0-9()\-\s]{8,20}$/;

const sanitizedString = (min: number, message: string) =>
  z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length >= min, message)
    .transform((value) => value.replace(/<[^>]*>/g, ""));

const antiSpamFields = {
  website: z.string().trim().max(0).optional().or(z.literal("")),
  submittedAt: z.string().datetime().optional().or(z.literal("")),
  turnstileToken: z.string().trim().optional().or(z.literal("")),
};

function isAtLeastAge(dateString: string, age: number) {
  const birth = new Date(dateString);
  if (Number.isNaN(birth.getTime())) return false;
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    years -= 1;
  }
  return years >= age;
}

export const serviceRequestSchema = z.object({
  firstName: sanitizedString(2, "Prénom requis."),
  lastName: sanitizedString(2, "Nom requis."),
  email: z.string().email("Email invalide."),
  phone: z.string().trim().regex(phoneRegex, "Numéro de téléphone invalide."),
  city: sanitizedString(2, "Ville requise."),
  category: sanitizedString(2, "Catégorie requise."),
  serviceId: z.string().uuid().optional().or(z.literal("")),
  interventionAddress: sanitizedString(4, "Adresse d'intervention requise."),
  accessInstructions: z.string().trim().max(500).optional().or(z.literal("")),
  doorCode: z.string().trim().max(80).optional().or(z.literal("")),
  floor: z.string().trim().max(80).optional().or(z.literal("")),
  parkingInstructions: z.string().trim().max(250).optional().or(z.literal("")),
  gardenAccessInstructions: z.string().trim().max(250).optional().or(z.literal("")),
  materialsAvailable: z.boolean().default(false),
  requestedFor: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), "Date/heure demandee invalide."),
  description: sanitizedString(15, "Veuillez détailler votre besoin."),
  urgency: z.enum(["Faible", "Moyenne", "Elevee", "Élevée", "Low", "Medium", "High"]),
  budget: sanitizedString(1, "Budget requis."),
  consent: z.boolean().refine((v) => v, "Consentement requis."),
  ...antiSpamFields,
});

export const providerApplicationSchema = z.object({
  firstName: sanitizedString(2, "Prénom requis."),
  lastName: sanitizedString(2, "Nom requis."),
  businessName: sanitizedString(2, "Nom requis."),
  email: z.string().email("Email invalide."),
  phone: z.string().trim().regex(phoneRegex, "Numéro de téléphone invalide."),
  birthDate: z.string().date("Date de naissance invalide."),
  addressLine: sanitizedString(4, "Adresse requise."),
  postalCode: sanitizedString(4, "Code postal requis."),
  canton: sanitizedString(2, "Canton requis."),
  city: sanitizedString(2, "Ville requise."),
  country: sanitizedString(2, "Pays requis."),
  interventionRadiusKm: z.number().int().min(1).max(80),
  category: sanitizedString(2, "Catégorie requise."),
  legalStatus: z.enum(["independant", "entreprise"]),
  companyName: z.string().trim().max(100).optional().or(z.literal("")),
  ideNumber: z.string().trim().max(30).optional().or(z.literal("")),
  iban: z.string().trim().max(60).optional().or(z.literal("")),
  vatNumber: z.string().trim().max(40).optional().or(z.literal("")),
  languages: sanitizedString(2, "Langues requises."),
  acceptsUrgency: z.boolean().default(false),
  servicesDescription: sanitizedString(20, "Description trop courte."),
  yearsExperience: sanitizedString(1, "Expérience requise."),
  availability: sanitizedString(2, "Disponibilité requise."),
  idDocumentType: z.enum(["piece_identite", "titre_sejour_b", "titre_sejour_c"]),
  residencePermitType: z.enum(["B", "C"]).optional().or(z.literal("")),
  websiteOrInstagram: z.string().trim().optional().or(z.literal("")),
  legalResponsibilityAck: z.boolean().refine((v) => v, "Validation de responsabilité requise."),
  termsAck: z.boolean().refine((v) => v, "Acceptation des conditions requise."),
  consent: z.boolean().refine((v) => v, "Consentement requis."),
  ...antiSpamFields,
}).superRefine((value, ctx) => {
  if (!isAtLeastAge(value.birthDate, 16)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["birthDate"],
      message: "Age minimum requis: 16 ans pour devenir prestataire.",
    });
  }
});

export const contactMessageSchema = z.object({
  fullName: sanitizedString(2, "Nom complet requis."),
  email: z.string().email("Email invalide."),
  subject: sanitizedString(3, "Sujet requis."),
  message: sanitizedString(10, "Message trop court."),
  phone: z.string().trim().regex(phoneRegex, "Numéro invalide.").optional().or(z.literal("")),
  consent: z.boolean().refine((v) => v, "Consentement requis."),
  ...antiSpamFields,
});

export const callRequestSchema = z.object({
  firstName: sanitizedString(2, "Prénom requis."),
  lastName: sanitizedString(2, "Nom requis."),
  phone: z.string().trim().regex(phoneRegex, "Numéro de téléphone invalide."),
  city: sanitizedString(2, "Ville requise."),
  category: sanitizedString(2, "Catégorie requise."),
  preferredSlot: z.enum(["morning", "afternoon", "evening", "matin", "apres-midi", "soir"]),
  contactMode: z.enum(["phone", "whatsapp"]),
  note: z.string().trim().max(500).optional().or(z.literal("")),
  consent: z.boolean().refine((v) => v, "Consentement requis."),
  source: z.enum(["web", "phone", "partner_cafe"]),
  ...antiSpamFields,
});

export const bookingIntentSchema = z.object({
  missionId: z.string().trim().min(1),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  isGuest: z.boolean(),
  contactEmail: z.string().email(),
  contactPhone: z.string().trim().regex(phoneRegex),
  reservationSource: z.enum(["app", "partner_cafe", "partner_pharmacy", "hotline"]),
  details: z.string().trim().max(500).optional().or(z.literal("")),
  consent: z.boolean().refine((v) => v, "Consentement requis."),
  ...antiSpamFields,
}).superRefine((value, ctx) => {
  const start = Date.parse(value.startAt);
  const end = Date.parse(value.endAt);
  if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endAt"],
      message: "La fin doit être après le début.",
    });
  }

  if (!Number.isNaN(start) && start < Date.now() - 5 * 60_000) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["startAt"],
      message: "Le créneau doit être dans le futur.",
    });
  }
});

export const callRequestStatusSchema = z.object({
  status: z.enum(["new", "reviewing", "contacted", "closed"]),
});

export const serviceRequestStatusSchema = z.object({
  status: z.enum(["new", "reviewing", "contacted", "closed"]),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});

export const providerApplicationStatusSchema = z.object({
  workflowStatus: z.enum(["draft", "submitted", "pending_review", "approved", "rejected", "needs_info", "suspended"]),
  adminNote: z.string().trim().max(500).optional().or(z.literal("")),
});

export const providerRequestStatusSchema = z.object({
  providerStatus: z.enum(["new", "pending_assignment", "assigned", "accepted", "declined", "in_progress", "completed", "cancelled", "disputed"]),
  note: z.string().trim().max(300).optional().or(z.literal("")),
  assignedProviderProfileId: z.string().uuid().optional().or(z.literal("")),
  scheduledFor: z.string().datetime().optional().or(z.literal("")),
});

export const providerDocumentReviewSchema = z.object({
  status: z.enum(["uploaded", "pending_review", "approved", "rejected", "needs_resubmission"]),
  adminNote: z.string().trim().max(500).optional().or(z.literal("")),
});

export const providerServiceCapabilitySchema = z.object({
  serviceId: z.string().uuid(),
  minPriceChf: z.number().min(0),
  isActive: z.boolean().default(true),
});

export const providerServicesPayloadSchema = z.object({
  services: z.array(providerServiceCapabilitySchema).max(200),
});

export const providerPayoutSchema = z.object({
  accountHolderName: z.string().trim().min(3).max(120),
  iban: z.string().trim().min(12).max(64),
  bankName: z.string().trim().max(120).optional().or(z.literal("")),
  currency: z.enum(["CHF", "EUR"]).default("CHF"),
});

export const serviceRequestSupplementCreateSchema = z.object({
  amountChf: z.number().min(1).max(10000),
  reason: z.string().trim().min(8).max(500),
});

export const serviceRequestSupplementDecisionSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});

export const serviceRequestTipSchema = z.object({
  amountChf: z.number().min(1).max(1000),
  message: z.string().trim().max(300).optional().or(z.literal("")),
});

export const providerAvailabilitySchema = z.object({
  rules: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      isActive: z.boolean().default(true),
    }),
  ),
  blocks: z.array(
    z.object({
      startsAt: z.string().datetime(),
      endsAt: z.string().datetime(),
      reason: z.string().trim().max(200).optional().or(z.literal("")),
    }),
  ),
});

export const aiChatSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: sanitizedString(2, "Message requis."),
});

export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;
export type ServiceRequestFormInput = z.input<typeof serviceRequestSchema>;
export type ProviderApplicationInput = z.input<typeof providerApplicationSchema>;
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
export type CallRequestInput = z.infer<typeof callRequestSchema>;
export type BookingIntentInput = z.infer<typeof bookingIntentSchema>;
export type ProviderAvailabilityInput = z.infer<typeof providerAvailabilitySchema>;
