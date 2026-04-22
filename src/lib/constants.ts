export const serviceCategories = [
  {
    slug: "exterieur-jardin",
    label: "Exterieur / Jardin",
    description: "Entretien exterieur, jardin et petits travaux autour du domicile.",
    fromPrice: 20,
  },
  {
    slug: "entretien-saisonnier",
    label: "Entretien saisonnier",
    description: "Interventions saisonnieres: neige, feuilles, rangement exterieur.",
    fromPrice: 15,
  },
  {
    slug: "menage-nettoyage",
    label: "Menage / Nettoyage",
    description: "Nettoyage interieur, entretien courant et remise en ordre rapide.",
    fromPrice: 15,
  },
  {
    slug: "organisation-rangement",
    label: "Organisation / Rangement",
    description: "Tri, rangement et aide logistique pour maison, cave et demenagement.",
    fromPrice: 30,
  },
  {
    slug: "petits-services-maison",
    label: "Petits services maison",
    description: "Petites interventions pratiques a domicile, sans chantier lourd.",
    fromPrice: 15,
  },
  {
    slug: "auto-transport",
    label: "Auto / Transport",
    description: "Aide auto locale, transport ponctuel et accompagnement logistique.",
    fromPrice: 15,
  },
  {
    slug: "animaux",
    label: "Animaux",
    description: "Promenade, nourrissage, surveillance et accompagnement veterinaire.",
    fromPrice: 15,
  },
  {
    slug: "aide-quotidienne-seniors",
    label: "Aide quotidienne / Seniors",
    description: "Presence humaine, accompagnement et aides du quotidien.",
    fromPrice: 20,
  },
  {
    slug: "courses-livraison",
    label: "Courses / Livraison",
    description: "Courses, depot/retrait colis et livraisons locales rapides.",
    fromPrice: 20,
  },
] as const;

export const fullCatalogue = [
  {
    slug: "home-care",
    name: "Aide a domicile",
    subcategories: [
      {
        slug: "aide-quotidienne",
        name: "Aide quotidienne",
        tasks: [
          { title: "Preparation de repas", mode: "planned", tags: ["domicile", "repas"] },
          { title: "Menage leger", mode: "planned", tags: ["menage", "domicile"] },
          { title: "Aide lessive", mode: "planned", tags: ["domicile", "aide"] },
        ],
      },
    ],
  },
  {
    slug: "senior-visits",
    name: "Visite senior",
    subcategories: [
      {
        slug: "accompagnement",
        name: "Accompagnement",
        tasks: [
          { title: "Visite de courtoisie", mode: "planned", tags: ["senior", "presence"] },
          { title: "Accompagnement rendez-vous", mode: "planned", tags: ["senior", "mobilite"] },
          { title: "Appel de suivi", mode: "instant", tags: ["senior", "support"] },
        ],
      },
    ],
  },
  {
    slug: "pets",
    name: "Animaux",
    subcategories: [
      {
        slug: "soin-chien",
        name: "Soin chien",
        tasks: [
          { title: "Promenade 30 min", mode: "instant", tags: ["chien", "exterieur"] },
          { title: "Grande promenade", mode: "planned", tags: ["chien", "activite"] },
          { title: "Passage nourrissage", mode: "planned", tags: ["animal", "domicile"] },
        ],
      },
    ],
  },
  {
    slug: "handyman",
    name: "Bricolage",
    subcategories: [
      {
        slug: "depannages",
        name: "Petits depannages",
        tasks: [
          { title: "Pose d'etagere", mode: "planned", tags: ["bricolage", "domicile"] },
          { title: "Installation luminaire", mode: "planned", tags: ["electricite", "domicile"] },
          { title: "Montage meuble", mode: "planned", tags: ["mobilier", "domicile"] },
        ],
      },
    ],
  },
  {
    slug: "shopping",
    name: "Courses",
    subcategories: [
      {
        slug: "courses-quoti",
        name: "Courses",
        tasks: [
          { title: "Courses hebdomadaires", mode: "planned", tags: ["courses", "quotidien"] },
          { title: "Retrait pharmacie", mode: "instant", tags: ["pharmacie", "quotidien"] },
          { title: "Commission urgente", mode: "instant", tags: ["urgent", "quotidien"] },
        ],
      },
    ],
  },
  {
    slug: "outdoor",
    name: "Exterieur",
    subcategories: [
      {
        slug: "garden",
        name: "Jardin",
        tasks: [
          { title: "Tonte pelouse", mode: "planned", tags: ["jardin", "saisonnier"] },
          { title: "Ramassage feuilles", mode: "planned", tags: ["jardin", "entretien"] },
        ],
      },
    ],
  },
  {
    slug: "mobility",
    name: "Mobilite",
    subcategories: [
      {
        slug: "transport",
        name: "Transport",
        tasks: [
          { title: "Trajet rendez-vous", mode: "planned", tags: ["transport", "senior"] },
          { title: "Accompagnement scolaire", mode: "planned", tags: ["famille", "transport"] },
        ],
      },
    ],
  },
  {
    slug: "parking",
    name: "Parking",
    subcategories: [
      {
        slug: "jour-nuit",
        name: "Jour et nuit",
        tasks: [
          { title: "Parking jour", mode: "instant", tags: ["parking", "jour"] },
          { title: "Parking nuit", mode: "instant", tags: ["parking", "nuit"] },
          { title: "Parking employe", mode: "recurring", tags: ["parking", "employe"] },
          { title: "Parking longue duree", mode: "planned", tags: ["parking", "vacances"] },
          { title: "Stationnement van sans prise", mode: "planned", tags: ["parking", "van"] },
          { title: "Stationnement van avec prise", mode: "planned", tags: ["parking", "van", "energie"] },
        ],
      },
    ],
  },
] as const;

export const providerAvailabilityOptions = [
  "Disponible maintenant",
  "Aujourd'hui",
  "Cette semaine",
  "Planifie",
] as const;

export const urgencyOptions = ["Faible", "Moyenne", "Elevee"] as const;

export const callbackCategories = [
  "Aide a domicile",
  "Visite senior",
  "Promenade chien",
  "Petits services",
  "Parking",
  "Besoin specifique",
] as const;

export const callbackSlots = ["matin", "apres-midi", "soir"] as const;

export const callbackContactModes = ["phone", "whatsapp"] as const;

export const howItWorksSteps = [
  {
    title: "Decrivez votre besoin",
    description: "Un formulaire simple ou un rappel en quelques etapes.",
  },
  {
    title: "Validation et matching local",
    description: "Nous priorisons des profils verifies et proches de chez vous.",
  },
  {
    title: "Reservation et suivi",
    description: "Confirmation claire, suivi client et relances automatisees.",
  },
] as const;

export const benefits = [
  "Mise en relation locale rapide",
  "Profils prestataires verifies manuellement",
  "Tarifs affiches des le depart",
  "Assistance humaine par telephone",
  "Pilotage admin complet",
] as const;

export const faqItems = [
  {
    question: "Pourquoi les prix affiches commencent-ils par 'des XX CHF' ?",
    answer:
      "Les montants affiches sont des prix de depart. Le prix final depend de la taille reelle de la mission, de l'acces, de l'urgence et du temps passe.",
  },
  {
    question: "Un supplement peut-il etre ajoute sans mon accord ?",
    answer:
      "Non. Tout supplement demande par le prestataire doit etre justifie et explicitement approuve par le client avant application.",
  },
  {
    question: "Quel est l'age minimum pour proposer ses services ?",
    answer:
      "Un prestataire doit avoir au moins 16 ans. La date de naissance est verifiee pendant l'onboarding et un dossier sous 16 ans est bloque.",
  },
  {
    question: "NearYou est-il l'employeur des prestataires ?",
    answer:
      "Non. NearYou agit comme plateforme d'intermediation en Suisse: les prestataires restent independants et responsables de leurs obligations.",
  },
  {
    question: "Comment sont verifies les prestataires ?",
    answer:
      "Chaque dossier est controle manuellement avec verification documentaire (identite, assurance et elements de conformite selon le service).",
  },
] as const;

export const siteConfig = {
  name: "NearYou",
  description: "Plateforme suisse premium de services a domicile.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@nearyou.ch",
};
