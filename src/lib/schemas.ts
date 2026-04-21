import { z } from "zod";

const phoneRegex = /^[+0-9()\-\s]{8,20}$/;

const sanitizedString = (min: number, message: string) =>
  z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length >= min, message)
    .transform((value) => value.replace(/<[^>]*>/g, ""));

export const serviceRequestSchema = z.object({
  firstName: sanitizedString(2, "Prénom requis."),
  lastName: sanitizedString(2, "Nom requis."),
  email: z.string().email("Email invalide."),
  phone: z.string().trim().regex(phoneRegex, "Numéro de téléphone invalide."),
  city: sanitizedString(2, "Ville requise."),
  category: sanitizedString(2, "Catégorie requise."),
  description: sanitizedString(15, "Veuillez détailler votre besoin."),
  urgency: z.enum(["Faible", "Moyenne", "Élevée", "Low", "Medium", "High"]),
  budget: sanitizedString(1, "Budget requis."),
  consent: z.boolean().refine((v) => v, "Consentement requis."),
});

export const providerApplicationSchema = z.object({
  firstName: sanitizedString(2, "Prénom requis."),
  lastName: sanitizedString(2, "Nom requis."),
  businessName: sanitizedString(2, "Nom requis."),
  email: z.string().email("Email invalide."),
  phone: z.string().trim().regex(phoneRegex, "Numéro de téléphone invalide."),
  addressLine: sanitizedString(4, "Adresse requise."),
  postalCode: sanitizedString(4, "Code postal requis."),
  canton: sanitizedString(2, "Canton requis."),
  city: sanitizedString(2, "Ville requise."),
  interventionRadiusKm: z.number().int().min(1).max(80),
  category: sanitizedString(2, "Catégorie requise."),
  legalStatus: z.enum(["independant", "entreprise"]),
  companyName: z.string().trim().max(100).optional().or(z.literal("")),
  ideNumber: z.string().trim().max(30).optional().or(z.literal("")),
  servicesDescription: sanitizedString(20, "Description trop courte."),
  yearsExperience: sanitizedString(1, "Expérience requise."),
  availability: sanitizedString(2, "Disponibilité requise."),
  idDocumentType: z.enum(["piece_identite", "titre_sejour_b", "titre_sejour_c"]),
  residencePermitType: z.enum(["B", "C"]).optional().or(z.literal("")),
  websiteOrInstagram: z.string().trim().optional().or(z.literal("")),
  legalResponsibilityAck: z.boolean().refine((v) => v, "Validation de responsabilité requise."),
  termsAck: z.boolean().refine((v) => v, "Acceptation des conditions requise."),
  consent: z.boolean().refine((v) => v, "Consentement requis."),
});

export const contactMessageSchema = z.object({
  fullName: sanitizedString(2, "Nom complet requis."),
  email: z.string().email("Email invalide."),
  subject: sanitizedString(3, "Sujet requis."),
  message: sanitizedString(10, "Message trop court."),
  phone: z.string().trim().regex(phoneRegex, "Numéro invalide.").optional().or(z.literal("")),
  consent: z.boolean().refine((v) => v, "Consentement requis."),
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
});

export const callRequestStatusSchema = z.object({
  status: z.enum(["new", "reviewing", "contacted", "closed"]),
});

export const serviceRequestStatusSchema = z.object({
  status: z.enum(["new", "reviewing", "contacted", "closed"]),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});

export const aiChatSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: sanitizedString(2, "Message requis."),
});

export type ServiceRequestInput = z.infer<typeof serviceRequestSchema>;
export type ProviderApplicationInput = z.infer<typeof providerApplicationSchema>;
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
export type CallRequestInput = z.infer<typeof callRequestSchema>;
export type BookingIntentInput = z.infer<typeof bookingIntentSchema>;
