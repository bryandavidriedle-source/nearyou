export type ServiceTask = {
  title: string;
  mode: "planned" | "instant";
  tags: string[];
};

export type ServiceSubcategory = {
  slug: string;
  name: string;
  tasks: ServiceTask[];
};

export type ServiceCategory = {
  slug: string;
  label: string;
  description: string;
  fromPrice: number;
  icon: string;
  subcategories: ServiceSubcategory[];
};

export type SwissCityTarget = {
  slug: string;
  name: string;
  canton: string;
  postalCode: string;
};

export const SWISS_CITY_TARGETS: SwissCityTarget[] = [
  { slug: "st-prex", name: "St-Prex", canton: "VD", postalCode: "1162" },
  { slug: "lausanne", name: "Lausanne", canton: "VD", postalCode: "1003" },
  { slug: "morges", name: "Morges", canton: "VD", postalCode: "1110" },
  { slug: "nyon", name: "Nyon", canton: "VD", postalCode: "1260" },
  { slug: "rolle", name: "Rolle", canton: "VD", postalCode: "1180" },
  { slug: "geneve", name: "Genève", canton: "GE", postalCode: "1201" },
  { slug: "fribourg", name: "Fribourg", canton: "FR", postalCode: "1700" },
  { slug: "yverdon-les-bains", name: "Yverdon-les-Bains", canton: "VD", postalCode: "1400" },
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    slug: "menage",
    label: "Ménage",
    description: "Entretien régulier, nettoyage complet et remise en ordre du logement.",
    fromPrice: 35,
    icon: "sparkles",
    subcategories: [
      {
        slug: "menage-courant",
        name: "Ménage courant",
        tasks: [
          { title: "Ménage appartement", mode: "planned", tags: ["ménage", "domicile"] },
          { title: "Nettoyage cuisine", mode: "planned", tags: ["cuisine", "hygiène"] },
          { title: "Nettoyage salle de bain", mode: "planned", tags: ["salle de bain"] },
        ],
      },
    ],
  },
  {
    slug: "jardinage",
    label: "Jardinage",
    description: "Entretien extérieur, tonte et interventions ponctuelles saisonnières.",
    fromPrice: 40,
    icon: "trees",
    subcategories: [
      {
        slug: "jardin-entretien",
        name: "Entretien jardin",
        tasks: [
          { title: "Tondre la pelouse", mode: "planned", tags: ["jardin", "extérieur"] },
          { title: "Désherber", mode: "planned", tags: ["jardin", "saisonnier"] },
          { title: "Ramasser les feuilles", mode: "planned", tags: ["jardin", "automne"] },
        ],
      },
    ],
  },
  {
    slug: "bricolage",
    label: "Bricolage",
    description: "Petits travaux, réparations simples et dépannages du quotidien.",
    fromPrice: 45,
    icon: "wrench",
    subcategories: [
      {
        slug: "petits-travaux",
        name: "Petits travaux",
        tasks: [
          { title: "Fixer une étagère", mode: "planned", tags: ["perçage", "maison"] },
          { title: "Remplacer une ampoule", mode: "instant", tags: ["dépannage"] },
          { title: "Petite réparation domestique", mode: "planned", tags: ["réparation"] },
        ],
      },
    ],
  },
  {
    slug: "demenagement",
    label: "Déménagement",
    description: "Aide logistique locale pour porter, trier et organiser.",
    fromPrice: 50,
    icon: "truck",
    subcategories: [
      {
        slug: "aide-demenagement",
        name: "Aide déménagement",
        tasks: [
          { title: "Porter des cartons", mode: "planned", tags: ["cartons", "logistique"] },
          { title: "Aide chargement", mode: "planned", tags: ["chargement", "transport"] },
          { title: "Déballer et ranger", mode: "planned", tags: ["rangement"] },
        ],
      },
    ],
  },
  {
    slug: "aide-transport",
    label: "Aide au transport",
    description: "Accompagnement local pour trajets du quotidien et courses utiles.",
    fromPrice: 30,
    icon: "car",
    subcategories: [
      {
        slug: "transport-local",
        name: "Transport local",
        tasks: [
          { title: "Accompagnement rendez-vous", mode: "planned", tags: ["accompagnement"] },
          { title: "Aide déplacement local", mode: "planned", tags: ["trajet", "ville"] },
          { title: "Transport court", mode: "instant", tags: ["rapide"] },
        ],
      },
    ],
  },
  {
    slug: "aide-seniors",
    label: "Aide seniors",
    description: "Présence de proximité et assistance pratique pour la vie quotidienne.",
    fromPrice: 35,
    icon: "heart-handshake",
    subcategories: [
      {
        slug: "accompagnement-senior",
        name: "Accompagnement senior",
        tasks: [
          { title: "Tenir compagnie", mode: "planned", tags: ["présence", "seniors"] },
          { title: "Accompagnement pharmacie", mode: "planned", tags: ["seniors", "courses"] },
          { title: "Promenade accompagnée", mode: "planned", tags: ["seniors", "extérieur"] },
        ],
      },
    ],
  },
  {
    slug: "accompagnement",
    label: "Accompagnement",
    description: "Aide humaine ponctuelle pour visites, démarches et rendez-vous.",
    fromPrice: 30,
    icon: "users",
    subcategories: [
      {
        slug: "presence-locale",
        name: "Présence locale",
        tasks: [
          { title: "Accompagnement administratif", mode: "planned", tags: ["administratif"] },
          { title: "Accompagnement médical", mode: "planned", tags: ["santé"] },
          { title: "Accompagnement événement", mode: "planned", tags: ["événement"] },
        ],
      },
    ],
  },
  {
    slug: "visites",
    label: "Visites",
    description: "Visites à domicile, vérification ponctuelle et présence de confiance.",
    fromPrice: 28,
    icon: "house",
    subcategories: [
      {
        slug: "visites-domicile",
        name: "Visites domicile",
        tasks: [
          { title: "Visite de présence", mode: "planned", tags: ["présence"] },
          { title: "Vérification domicile", mode: "planned", tags: ["contrôle"] },
          { title: "Passage ponctuel", mode: "instant", tags: ["rapide"] },
        ],
      },
    ],
  },
  {
    slug: "promenade-chien",
    label: "Promenade chien",
    description: "Balades locales pour chiens avec suivi simple et fiable.",
    fromPrice: 25,
    icon: "paw-print",
    subcategories: [
      {
        slug: "chiens",
        name: "Chiens",
        tasks: [
          { title: "Promenade 30 minutes", mode: "planned", tags: ["chien", "balade"] },
          { title: "Promenade 1 heure", mode: "planned", tags: ["chien", "extérieur"] },
          { title: "Sortie urgente", mode: "instant", tags: ["chien", "urgence"] },
        ],
      },
    ],
  },
  {
    slug: "garde-animaux",
    label: "Garde animaux",
    description: "Garde et soins de proximité pour animaux de compagnie.",
    fromPrice: 30,
    icon: "cat",
    subcategories: [
      {
        slug: "soins-animaux",
        name: "Soins animaux",
        tasks: [
          { title: "Nourrir les animaux", mode: "planned", tags: ["animaux"] },
          { title: "Nettoyer litière", mode: "planned", tags: ["animaux", "hygiène"] },
          { title: "Garde courte durée", mode: "planned", tags: ["garde"] },
        ],
      },
    ],
  },
  {
    slug: "informatique",
    label: "Informatique",
    description: "Assistance digitale locale: installation, dépannage et support.",
    fromPrice: 45,
    icon: "laptop",
    subcategories: [
      {
        slug: "support-digital",
        name: "Support digital",
        tasks: [
          { title: "Installer imprimante", mode: "planned", tags: ["installation"] },
          { title: "Configurer smartphone", mode: "planned", tags: ["mobile"] },
          { title: "Aide internet / wifi", mode: "instant", tags: ["dépannage"] },
        ],
      },
    ],
  },
  {
    slug: "cours-particuliers",
    label: "Cours particuliers",
    description: "Soutien personnalisé à domicile ou en ligne selon disponibilité.",
    fromPrice: 40,
    icon: "book-open",
    subcategories: [
      {
        slug: "soutien",
        name: "Soutien scolaire",
        tasks: [
          { title: "Aide aux devoirs", mode: "planned", tags: ["école"] },
          { title: "Cours de langues", mode: "planned", tags: ["langues"] },
          { title: "Cours informatique débutant", mode: "planned", tags: ["digital"] },
        ],
      },
    ],
  },
  {
    slug: "aide-administrative",
    label: "Aide administrative",
    description: "Aide aux documents, classement, démarches et formulaires.",
    fromPrice: 35,
    icon: "file-text",
    subcategories: [
      {
        slug: "documents",
        name: "Documents et démarches",
        tasks: [
          { title: "Classer des documents", mode: "planned", tags: ["documents"] },
          { title: "Aide formulaire", mode: "planned", tags: ["administratif"] },
          { title: "Accompagnement poste", mode: "instant", tags: ["démarches"] },
        ],
      },
    ],
  },
  {
    slug: "petits-travaux",
    label: "Petits travaux",
    description: "Interventions techniques légères et ajustements du quotidien.",
    fromPrice: 40,
    icon: "hammer",
    subcategories: [
      {
        slug: "maintenance-legere",
        name: "Maintenance légère",
        tasks: [
          { title: "Fixation murale", mode: "planned", tags: ["mur"] },
          { title: "Joint silicone", mode: "planned", tags: ["salle de bain"] },
          { title: "Petit dépannage", mode: "instant", tags: ["dépannage"] },
        ],
      },
    ],
  },
  {
    slug: "montage-meubles",
    label: "Montage meubles",
    description: "Montage, démontage et installation de mobilier à domicile.",
    fromPrice: 45,
    icon: "sofa",
    subcategories: [
      {
        slug: "mobilier",
        name: "Mobilier",
        tasks: [
          { title: "Montage meuble simple", mode: "planned", tags: ["meuble"] },
          { title: "Montage lit", mode: "planned", tags: ["chambre"] },
          { title: "Démontage meuble", mode: "planned", tags: ["meuble"] },
        ],
      },
    ],
  },
  {
    slug: "nettoyage-exterieur",
    label: "Nettoyage extérieur",
    description: "Balcon, terrasse, allées et surfaces extérieures.",
    fromPrice: 35,
    icon: "sun",
    subcategories: [
      {
        slug: "surfaces-exterieures",
        name: "Surfaces extérieures",
        tasks: [
          { title: "Nettoyer balcon", mode: "planned", tags: ["balcon"] },
          { title: "Balayer terrasse", mode: "planned", tags: ["terrasse"] },
          { title: "Nettoyer allée", mode: "planned", tags: ["allée"] },
        ],
      },
    ],
  },
  {
    slug: "livraison-locale",
    label: "Livraison locale",
    description: "Courses, dépôts et livraisons rapides dans votre zone.",
    fromPrice: 25,
    icon: "shopping-cart",
    subcategories: [
      {
        slug: "courses-et-livraisons",
        name: "Courses et livraisons",
        tasks: [
          { title: "Faire des courses", mode: "planned", tags: ["courses"] },
          { title: "Déposer un colis", mode: "instant", tags: ["colis"] },
          { title: "Livraison locale rapide", mode: "instant", tags: ["livraison"] },
        ],
      },
    ],
  },
  {
    slug: "aide-evenementielle",
    label: "Aide événementielle",
    description: "Soutien ponctuel avant, pendant et après un événement.",
    fromPrice: 40,
    icon: "party-popper",
    subcategories: [
      {
        slug: "evenements",
        name: "Événements",
        tasks: [
          { title: "Aide installation salle", mode: "planned", tags: ["événement"] },
          { title: "Accueil invités", mode: "planned", tags: ["événement"] },
          { title: "Rangement après événement", mode: "planned", tags: ["logistique"] },
        ],
      },
    ],
  },
  {
    slug: "services-entreprises",
    label: "Services aux entreprises",
    description: "Interventions locales pour bureaux, commerces et structures petites et moyennes.",
    fromPrice: 55,
    icon: "briefcase",
    subcategories: [
      {
        slug: "office-services",
        name: "Services office",
        tasks: [
          { title: "Petit entretien bureau", mode: "planned", tags: ["bureau"] },
          { title: "Support logistique réunion", mode: "planned", tags: ["entreprise"] },
          { title: "Livraison locale pro", mode: "instant", tags: ["entreprise"] },
        ],
      },
    ],
  },
  {
    slug: "conciergerie",
    label: "Conciergerie",
    description: "Services de gestion du quotidien pour particuliers et professionnels.",
    fromPrice: 45,
    icon: "key-round",
    subcategories: [
      {
        slug: "gestion-quotidienne",
        name: "Gestion quotidienne",
        tasks: [
          { title: "Remise de clés", mode: "planned", tags: ["clés"] },
          { title: "Vérification logement", mode: "planned", tags: ["logement"] },
          { title: "Coordination intervention", mode: "planned", tags: ["coordination"] },
        ],
      },
    ],
  },
  {
    slug: "missions-diverses",
    label: "Missions diverses",
    description: "Demandes spécifiques hors catégories standards, sous validation.",
    fromPrice: 30,
    icon: "sparkle",
    subcategories: [
      {
        slug: "sur-mesure",
        name: "Sur mesure",
        tasks: [
          { title: "Mission ponctuelle personnalisée", mode: "planned", tags: ["sur mesure"] },
          { title: "Besoin express local", mode: "instant", tags: ["urgent"] },
          { title: "Aide polyvalente", mode: "planned", tags: ["polyvalent"] },
        ],
      },
    ],
  },
];

export function findCategoryBySlug(slug: string) {
  return SERVICE_CATEGORIES.find((category) => category.slug === slug);
}

export function findCityBySlug(slug: string) {
  return SWISS_CITY_TARGETS.find((city) => city.slug === slug);
}
