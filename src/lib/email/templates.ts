export const emailTemplates = {
  welcomeAccount: (firstName: string) => ({
    subject: "Bienvenue sur NearYou",
    html: `<p>Bonjour ${firstName},</p><p>Votre compte NearYou est actif. Vous pouvez dès maintenant réserver un service local en Suisse.</p>`,
  }),
  bookingConfirmation: (service: string, when: string) => ({
    subject: "Confirmation de réservation NearYou",
    html: `<p>Votre réservation est confirmée.</p><p>Service: <strong>${service}</strong><br/>Quand: <strong>${when}</strong></p>`,
  }),
  bookingReminder: (service: string, when: string) => ({
    subject: "Rappel de votre réservation NearYou",
    html: `<p>Rappel: votre service <strong>${service}</strong> est prévu le ${when}.</p>`,
  }),
  reviewRequest: (service: string) => ({
    subject: "Votre avis nous aide",
    html: `<p>Merci d'avoir utilisé NearYou pour ${service}. Pouvez-vous laisser une note ?</p>`,
  }),
  providerApplicationReceived: (name: string) => ({
    subject: "Candidature prestataire reçue",
    html: `<p>Bonjour ${name},</p><p>Nous avons bien reçu votre candidature prestataire NearYou. Notre équipe vous contacte rapidement.</p>`,
  }),
};
