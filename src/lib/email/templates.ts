export const emailTemplates = {
  welcomeAccount: (firstName: string) => ({
    subject: "Bienvenue sur PresDeToi",
    html: `<p>Bonjour ${firstName},</p><p>Votre compte PresDeToi est actif. Vous pouvez dès maintenant réserver un service local en Suisse.</p>`,
  }),
  bookingConfirmation: (service: string, when: string) => ({
    subject: "Confirmation de réservation PresDeToi",
    html: `<p>Votre réservation est confirmée.</p><p>Service: <strong>${service}</strong><br/>Quand: <strong>${when}</strong></p>`,
  }),
  bookingReminder: (service: string, when: string) => ({
    subject: "Rappel de votre réservation PresDeToi",
    html: `<p>Rappel: votre service <strong>${service}</strong> est prévu le ${when}.</p>`,
  }),
  reviewRequest: (service: string) => ({
    subject: "Votre avis nous aide",
    html: `<p>Merci d'avoir utilisé PresDeToi pour ${service}. Pouvez-vous laisser une note ?</p>`,
  }),
  providerApplicationReceived: (name: string) => ({
    subject: "Dossier prestataire reçu",
    html: `<p>Bonjour ${name},</p><p>Nous avons bien reçu votre dossier prestataire PresDeToi.</p><p>Statut actuel: <strong>En attente de validation manuelle</strong>.</p>`,
  }),
  providerApplicationPendingReview: (name: string) => ({
    subject: "Votre dossier est en cours de vérification",
    html: `<p>Bonjour ${name},</p><p>Votre dossier est actuellement en cours d'analyse par notre équipe.</p>`,
  }),
  providerApplicationApproved: (name: string) => ({
    subject: "Votre dossier prestataire est approuvé",
    html: `<p>Bonjour ${name},</p><p>Bonne nouvelle: votre dossier prestataire est approuvé.</p><p>Votre profil pourra être activé selon la configuration de la plateforme.</p>`,
  }),
  providerApplicationRejected: (name: string) => ({
    subject: "Votre dossier prestataire n'a pas été validé",
    html: `<p>Bonjour ${name},</p><p>Votre dossier n'a pas pu être validé en l'état.</p><p>Vous pouvez déposer un nouveau dossier avec des éléments complémentaires.</p>`,
  }),
  providerApplicationNeedsInfo: (name: string, note?: string) => ({
    subject: "Complément requis pour votre dossier prestataire",
    html: `<p>Bonjour ${name},</p><p>Un complément d'information est requis pour poursuivre l'analyse de votre dossier.</p>${note ? `<p><strong>Note admin:</strong> ${note}</p>` : ""}`,
  }),
  serviceRequestStatusChanged: (statusLabel: string, category: string) => ({
    subject: "Mise à jour de votre demande PresDeToi",
    html: `<p>Votre demande <strong>${category}</strong> a été mise à jour.</p><p>Nouveau statut: <strong>${statusLabel}</strong>.</p>`,
  }),
  callbackRequestReceived: (firstName: string) => ({
    subject: "Demande de rappel bien reçue",
    html: `<p>Bonjour ${firstName},</p><p>Votre demande de rappel a bien été prise en compte. Notre équipe vous contacte au plus vite.</p>`,
  }),
};
