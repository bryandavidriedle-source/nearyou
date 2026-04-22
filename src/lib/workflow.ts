export const providerWorkflowStatuses = [
  "draft",
  "submitted",
  "pending_review",
  "needs_info",
  "approved",
  "rejected",
  "suspended",
] as const;

export type ProviderWorkflowStatus = (typeof providerWorkflowStatuses)[number];

export const providerWorkflowLabels: Record<ProviderWorkflowStatus, string> = {
  draft: "Brouillon",
  submitted: "Soumis",
  pending_review: "En attente de validation",
  needs_info: "Informations complementaires",
  approved: "Approuve",
  rejected: "Refuse",
  suspended: "Suspendu",
};

export const providerRequestStatuses = [
  "new",
  "pending_assignment",
  "assigned",
  "accepted",
  "declined",
  "in_progress",
  "completed",
  "cancelled",
  "disputed",
] as const;

export type ProviderRequestStatus = (typeof providerRequestStatuses)[number];

export const providerRequestLabels: Record<ProviderRequestStatus, string> = {
  new: "Nouvelle",
  pending_assignment: "En attente d'attribution",
  assigned: "Assignee",
  accepted: "Acceptee",
  declined: "Refusee",
  in_progress: "En cours",
  completed: "Terminee",
  cancelled: "Annulee",
  disputed: "Litige",
};

export const providerDocumentKinds = [
  "identity",
  "residence_permit",
  "insurance_rc",
  "activity_proof",
  "other",
] as const;

export type ProviderDocumentKind = (typeof providerDocumentKinds)[number];

export const providerDocumentKindLabels: Record<ProviderDocumentKind, string> = {
  identity: "Piece d'identite",
  residence_permit: "Permis B/C",
  insurance_rc: "Assurance RC",
  activity_proof: "Justificatif d'activite",
  other: "Autre",
};

export const providerDocumentStatuses = [
  "uploaded",
  "pending_review",
  "approved",
  "rejected",
  "needs_resubmission",
] as const;

export type ProviderDocumentStatus = (typeof providerDocumentStatuses)[number];

export const providerDocumentStatusLabels: Record<ProviderDocumentStatus, string> = {
  uploaded: "Televerse",
  pending_review: "En verification",
  approved: "Valide",
  rejected: "Refuse",
  needs_resubmission: "A renvoyer",
};

export const providerPaymentStatuses = [
  "pending",
  "scheduled",
  "paid",
  "failed",
  "disputed",
] as const;

export type ProviderPaymentStatus = (typeof providerPaymentStatuses)[number];

export const providerPaymentStatusLabels: Record<ProviderPaymentStatus, string> = {
  pending: "En attente",
  scheduled: "Programme",
  paid: "Paye",
  failed: "Echec",
  disputed: "Litige",
};
