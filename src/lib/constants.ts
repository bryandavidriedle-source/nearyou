import { SERVICE_CATEGORIES, SWISS_CITY_TARGETS } from "@/lib/catalog";

export const serviceCategories = SERVICE_CATEGORIES.map((category) => ({
  slug: category.slug,
  label: category.label,
  description: category.description,
  fromPrice: category.fromPrice,
  icon: category.icon,
}));

export const SERVICE_CATEGORIES_LIST = serviceCategories;
const legacyCategoryLabels = [
  "Extérieur / Jardin",
  "Exterieur / Jardin",
  "Entretien saisonnier",
  "Ménage / Nettoyage",
  "Menage / Nettoyage",
  "Organisation / Rangement",
  "Petits services maison",
  "Auto / Transport",
  "Animaux",
  "Aide quotidienne / Seniors",
  "Courses / Livraison",
];
export const serviceCategoryLabels: string[] = [
  ...new Set([...serviceCategories.map((category) => category.label), ...legacyCategoryLabels]),
];

export const fullCatalogue = SERVICE_CATEGORIES.map((category) => ({
  slug: category.slug,
  name: category.label,
  subcategories: category.subcategories,
}));

export const swissCityTargets = SWISS_CITY_TARGETS;
export const swissCityNames = swissCityTargets.map((city) => city.name);

export const providerAvailabilityOptions = [
  "Disponible maintenant",
  "Aujourd'hui",
  "Cette semaine",
  "Planifié",
] as const;

export const urgencyOptions = ["Faible", "Moyenne", "Élevée"] as const;

export const callbackCategories = [
  "Ménage",
  "Jardinage",
  "Bricolage",
  "Aide seniors",
  "Livraison locale",
  "Mission diverse",
] as const;

export const callbackSlots = ["matin", "après-midi", "soir"] as const;
export const callbackContactModes = ["phone", "whatsapp"] as const;

export const howItWorksSteps = [
  {
    title: "Choisissez un service",
    description: "Sélectionnez une catégorie puis comparez des prestataires proches de chez vous.",
  },
  {
    title: "Comparez les profils",
    description: "Consultez les notes, badges de confiance, tarifs dès CHF et disponibilités.",
  },
  {
    title: "Réservez en sécurité",
    description: "Confirmez votre demande avec un parcours clair et un paiement sécurisé.",
  },
] as const;

export const benefits = [
  "Prestataires validés manuellement avant publication",
  "Paiement sécurisé Stripe en CHF",
  "Avis modérés et support humain local",
  "Plateforme suisse d'intermédiation, transparente et simple",
  "Architecture prête pour extension TWINT",
] as const;

export const faqItems = [
  {
    question: "Pourquoi les prix affichés commencent-ils par “dès XX CHF” ?",
    answer:
      "Les prix affichés sont des prix de départ. Le prix final dépend du volume réel, de la complexité, de l'accès, de l'urgence et du temps passé.",
  },
  {
    question: "Un supplément peut-il être appliqué sans mon accord ?",
    answer:
      "Non. Tout supplément demandé doit être justifié et validé explicitement par le client avant application.",
  },
  {
    question: "Quel est l'âge minimum pour devenir prestataire ?",
    answer:
      "L'âge minimum est de 15 ans. Entre 15 et 17 ans, seules des missions simples et autorisées sont accessibles après validation renforcée.",
  },
  {
    question: "PrèsDeToi est-il l'employeur des prestataires ?",
    answer:
      "Non. PrèsDeToi est une plateforme d'intermédiation. Les prestataires restent indépendants et responsables de leurs obligations.",
  },
  {
    question: "Comment les prestataires sont-ils validés ?",
    answer:
      "Chaque dossier passe en revue manuelle: identité, documents, conformité activité et cohérence des informations.",
  },
] as const;
