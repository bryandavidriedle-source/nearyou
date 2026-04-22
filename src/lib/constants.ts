export const SERVICE_CATEGORIES = [
  {
    slug: "menage",
    label: "Ménage",
    description: "Entretien régulier, nettoyage complet et remise en ordre du logement.",
    fromPrice: 35,
  },
  {
    slug: "coiffure",
    label: "Coiffure",
    description: "Coiffure à domicile avec des prestataires locaux soigneusement sélectionnés.",
    fromPrice: 45,
  },
  {
    slug: "massage",
    label: "Massage",
    description: "Massage bien-être à domicile, en journée ou en soirée selon disponibilité.",
    fromPrice: 70,
  },
  {
    slug: "bricolage",
    label: "Bricolage",
    description: "Petits travaux de montage, fixation et dépannage domestique.",
    fromPrice: 40,
  },
  {
    slug: "exterieur-jardin",
    label: "Extérieur / Jardin",
    description: "Tonte, entretien et interventions ponctuelles autour de votre extérieur.",
    fromPrice: 35,
  },
  {
    slug: "garde-enfants",
    label: "Garde d'enfants",
    description: "Garde ponctuelle ou régulière, avec un parcours de validation strict.",
    fromPrice: 32,
  },
  {
    slug: "aide-domicile",
    label: "Aide à domicile",
    description: "Accompagnement pratique du quotidien pour particuliers et seniors.",
    fromPrice: 30,
  },
  {
    slug: "beaute",
    label: "Beauté",
    description: "Prestations beauté à domicile dans un cadre simple et rassurant.",
    fromPrice: 45,
  },
  {
    slug: "transport-accompagnement",
    label: "Transport / accompagnement",
    description: "Courses, accompagnement local et assistance de proximité en Suisse.",
    fromPrice: 30,
  },
] as const;

export const serviceCategories = SERVICE_CATEGORIES;
export const serviceCategoryLabels: string[] = serviceCategories.map((category) => category.label);

export const fullCatalogue = [
  {
    slug: "menage",
    name: "Ménage",
    subcategories: [
      {
        slug: "nettoyage-courant",
        name: "Nettoyage courant",
        tasks: [
          { title: "Ménage standard", mode: "planned", tags: ["ménage", "domicile"] },
          { title: "Nettoyage cuisine", mode: "planned", tags: ["cuisine", "hygiène"] },
          { title: "Nettoyage salle de bain", mode: "planned", tags: ["salle de bain", "entretien"] },
        ],
      },
    ],
  },
  {
    slug: "coiffure",
    name: "Coiffure",
    subcategories: [
      {
        slug: "coiffure-domicile",
        name: "Coiffure à domicile",
        tasks: [
          { title: "Coupe femme", mode: "planned", tags: ["coiffure", "domicile"] },
          { title: "Coupe homme", mode: "planned", tags: ["coiffure", "rapide"] },
          { title: "Brushing", mode: "planned", tags: ["coiffure", "beauté"] },
        ],
      },
    ],
  },
  {
    slug: "massage",
    name: "Massage",
    subcategories: [
      {
        slug: "bien-etre",
        name: "Bien-être",
        tasks: [
          { title: "Massage relaxant", mode: "planned", tags: ["massage", "détente"] },
          { title: "Massage dos et épaules", mode: "planned", tags: ["massage", "récupération"] },
          { title: "Massage express 30 min", mode: "instant", tags: ["massage", "rapide"] },
        ],
      },
    ],
  },
  {
    slug: "bricolage",
    name: "Bricolage",
    subcategories: [
      {
        slug: "petits-travaux",
        name: "Petits travaux",
        tasks: [
          { title: "Montage meuble simple", mode: "planned", tags: ["mobilier", "maison"] },
          { title: "Pose d'étagère", mode: "planned", tags: ["fixation", "maison"] },
          { title: "Remplacement ampoule", mode: "instant", tags: ["dépannage", "éclairage"] },
        ],
      },
    ],
  },
  {
    slug: "exterieur-jardin",
    name: "Extérieur / Jardin",
    subcategories: [
      {
        slug: "entretien-exterieur",
        name: "Entretien extérieur",
        tasks: [
          { title: "Tondre la pelouse", mode: "planned", tags: ["jardin", "extérieur"] },
          { title: "Ramasser les feuilles", mode: "planned", tags: ["jardin", "saisonnier"] },
          { title: "Nettoyer balcon", mode: "planned", tags: ["balcon", "extérieur"] },
        ],
      },
    ],
  },
  {
    slug: "garde-enfants",
    name: "Garde d'enfants",
    subcategories: [
      {
        slug: "garde-ponctuelle",
        name: "Garde ponctuelle",
        tasks: [
          { title: "Garde après l'école", mode: "planned", tags: ["enfants", "soirée"] },
          { title: "Garde en journée", mode: "planned", tags: ["enfants", "journée"] },
          { title: "Accompagnement activités", mode: "planned", tags: ["enfants", "accompagnement"] },
        ],
      },
    ],
  },
  {
    slug: "aide-domicile",
    name: "Aide à domicile",
    subcategories: [
      {
        slug: "accompagnement-quotidien",
        name: "Accompagnement quotidien",
        tasks: [
          { title: "Aide courses", mode: "planned", tags: ["courses", "quotidien"] },
          { title: "Compagnie senior", mode: "planned", tags: ["seniors", "présence"] },
          { title: "Aide administrative", mode: "planned", tags: ["documents", "assistance"] },
        ],
      },
    ],
  },
  {
    slug: "beaute",
    name: "Beauté",
    subcategories: [
      {
        slug: "soins-beaute",
        name: "Soins beauté",
        tasks: [
          { title: "Manucure", mode: "planned", tags: ["beauté", "mains"] },
          { title: "Maquillage événement", mode: "planned", tags: ["beauté", "événement"] },
          { title: "Soin visage", mode: "planned", tags: ["beauté", "soin"] },
        ],
      },
    ],
  },
  {
    slug: "transport-accompagnement",
    name: "Transport / accompagnement",
    subcategories: [
      {
        slug: "transport-local",
        name: "Transport local",
        tasks: [
          { title: "Accompagnement médical", mode: "planned", tags: ["transport", "seniors"] },
          { title: "Livraison locale", mode: "instant", tags: ["livraison", "proximité"] },
          { title: "Aller-retour administratif", mode: "planned", tags: ["transport", "services"] },
        ],
      },
    ],
  },
] as const;

export const providerAvailabilityOptions = [
  "Disponible maintenant",
  "Aujourd'hui",
  "Cette semaine",
  "Planifié",
] as const;

export const urgencyOptions = ["Faible", "Moyenne", "Élevée"] as const;

export const callbackCategories = [
  "Ménage",
  "Aide à domicile",
  "Transport / accompagnement",
  "Bricolage",
  "Garde d'enfants",
  "Besoin spécifique",
] as const;

export const callbackSlots = ["matin", "après-midi", "soir"] as const;

export const callbackContactModes = ["phone", "whatsapp"] as const;

export const howItWorksSteps = [
  {
    title: "Décrivez votre besoin",
    description: "Un formulaire rapide avec les informations utiles dès le départ.",
  },
  {
    title: "Matching local vérifié",
    description: "Nous proposons des prestataires locaux validés manuellement.",
  },
  {
    title: "Réservation et suivi",
    description: "Confirmation claire, statuts lisibles et support humain.",
  },
] as const;

export const benefits = [
  "Mise en relation locale rapide",
  "Prestataires vérifiés manuellement",
  "Tarifs indicatifs transparents",
  "Support humain par téléphone",
  "Backoffice administrable au quotidien",
] as const;

export const faqItems = [
  {
    question: "Pourquoi les prix affichés commencent-ils par “dès XX CHF” ?",
    answer:
      "Les prix affichés sont des montants de départ. Le prix final peut varier selon la taille réelle de la mission, l'accès, l'urgence et le temps passé.",
  },
  {
    question: "Un supplément peut-il être ajouté sans mon accord ?",
    answer:
      "Non. Tout supplément demandé par un prestataire doit être justifié et approuvé explicitement par le client avant application.",
  },
  {
    question: "Quel est l'âge minimum pour devenir prestataire ?",
    answer:
      "Un prestataire doit avoir au moins 16 ans. Les candidatures en dessous de cet âge sont bloquées automatiquement.",
  },
  {
    question: "NearYou est-il l'employeur des prestataires ?",
    answer:
      "Non. NearYou agit comme plateforme d'intermédiation en Suisse. Les prestataires restent indépendants et responsables de leurs obligations.",
  },
  {
    question: "Comment sont validés les prestataires ?",
    answer:
      "Chaque dossier est relu manuellement avec vérification documentaire selon le type de service proposé.",
  },
] as const;

export const siteConfig = {
  name: "NearYou",
  description: "Plateforme suisse premium de services locaux à domicile.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@nearyou.ch",
};
