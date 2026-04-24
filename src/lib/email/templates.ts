export const emailTemplates = {
  welcomeAccount: (firstName: string) => ({
    subject: "Bienvenue sur PrèsDeToi",
    html: `<p>Bonjour ${firstName},</p><p>Votre compte PrèsDeToi est actif. Vous pouvez des maintenant reserver un service local en Suisse.</p>`,
  }),
  bookingConfirmation: (service: string, when: string) => ({
    subject: "Confirmation de reservation PrèsDeToi",
    html: `<p>Votre reservation est confirmee.</p><p>Service: <strong>${service}</strong><br/>Quand: <strong>${when}</strong></p>`,
  }),
  bookingReminder: (service: string, when: string) => ({
    subject: "Rappel de votre reservation PrèsDeToi",
    html: `<p>Rappel: votre service <strong>${service}</strong> est prevu le ${when}.</p>`,
  }),
  reviewRequest: (service: string) => ({
    subject: "Votre avis nous aide",
    html: `<p>Merci d'avoir utilise PrèsDeToi pour ${service}. Pouvez-vous laisser une note ?</p>`,
  }),
  providerApplicationReceived: (name: string) => ({
    subject: "Dossier prestataire recu",
    html: `<p>Bonjour ${name},</p><p>Nous avons bien recu votre dossier prestataire PrèsDeToi.</p><p>Statut actuel: <strong>En attente de validation manuelle</strong>.</p>`,
  }),
  providerApplicationPendingReview: (name: string) => ({
    subject: "Votre dossier est en cours de verification",
    html: `<p>Bonjour ${name},</p><p>Votre dossier est actuellement en cours d'analyse par notre equipe.</p>`,
  }),
  providerApplicationApproved: (name: string) => ({
    subject: "Votre dossier prestataire est approuve",
    html: `<p>Bonjour ${name},</p><p>Bonne nouvelle: votre dossier prestataire est approuve.</p><p>Votre profil pourra etre active selon la configuration de la plateforme.</p>`,
  }),
  providerApplicationRejected: (name: string) => ({
    subject: "Votre dossier prestataire n'a pas ete valide",
    html: `<p>Bonjour ${name},</p><p>Votre dossier n'a pas pu etre valide en l'etat.</p><p>Vous pouvez deposer un nouveau dossier avec des elements complementaires.</p>`,
  }),
  providerApplicationNeedsInfo: (name: string, note?: string) => ({
    subject: "Complement requis pour votre dossier prestataire",
    html: `<p>Bonjour ${name},</p><p>Un complement d'information est requis pour poursuivre l'analyse de votre dossier.</p>${note ? `<p><strong>Note admin:</strong> ${note}</p>` : ""}`,
  }),
  serviceRequestStatusChanged: (statusLabel: string, category: string) => ({
    subject: "Mise a jour de votre demande PrèsDeToi",
    html: `<p>Votre demande <strong>${category}</strong> a ete mise a jour.</p><p>Nouveau statut: <strong>${statusLabel}</strong>.</p>`,
  }),
  callbackRequestReceived: (firstName: string) => ({
    subject: "Demande de rappel bien recue",
    html: `<p>Bonjour ${firstName},</p><p>Votre demande de rappel a bien ete prise en compte. Notre equipe vous contacte au plus vite.</p>`,
  }),
};

