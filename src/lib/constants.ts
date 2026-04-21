export const serviceCategories = [
  {
    slug: "home-help",
    label: "Home help",
    description: "Daily support at home, fast and friendly.",
    fromPrice: 35,
  },
  {
    slug: "senior-visit",
    label: "Visit a loved one",
    description: "Trusted visits for elderly care and companionship.",
    fromPrice: 29,
  },
  {
    slug: "dog-walking",
    label: "Dog walking",
    description: "Reliable dog walkers available today.",
    fromPrice: 22,
  },
  {
    slug: "small-services",
    label: "Small services",
    description: "Errands, simple tasks, practical daily help.",
    fromPrice: 25,
  },
  {
    slug: "parking",
    label: "Parking",
    description: "Day, night, employee, camper, with or without power.",
    fromPrice: 12,
  },
] as const;

export const fullCatalogue = [
  {
    slug: "home-care",
    name: "Aide a domicile",
    subcategories: [
      {
        slug: "daily-help",
        name: "Daily help",
        tasks: [
          { title: "Meal prep", mode: "planned", tags: ["home", "daily"] },
          { title: "Light cleaning", mode: "planned", tags: ["cleaning", "home"] },
          { title: "Laundry support", mode: "planned", tags: ["home", "care"] },
        ],
      },
    ],
  },
  {
    slug: "senior-visits",
    name: "Visite senior",
    subcategories: [
      {
        slug: "companionship",
        name: "Companionship",
        tasks: [
          { title: "Friendly visit", mode: "planned", tags: ["senior", "companionship"] },
          { title: "Medical appointment escort", mode: "planned", tags: ["senior", "mobility"] },
          { title: "Check-in call", mode: "instant", tags: ["senior", "support"] },
        ],
      },
    ],
  },
  {
    slug: "pets",
    name: "Animaux",
    subcategories: [
      {
        slug: "dog-care",
        name: "Dog care",
        tasks: [
          { title: "30 min dog walk", mode: "instant", tags: ["dog", "outdoor"] },
          { title: "Long walk", mode: "planned", tags: ["dog", "sport"] },
          { title: "Pet feeding visit", mode: "planned", tags: ["pet", "home"] },
        ],
      },
    ],
  },
  {
    slug: "handyman",
    name: "Bricolage",
    subcategories: [
      {
        slug: "small-fixes",
        name: "Small fixes",
        tasks: [
          { title: "Shelf mounting", mode: "planned", tags: ["fix", "home"] },
          { title: "Lamp installation", mode: "planned", tags: ["electric", "home"] },
          { title: "Furniture assembly", mode: "planned", tags: ["furniture", "home"] },
        ],
      },
    ],
  },
  {
    slug: "shopping",
    name: "Courses",
    subcategories: [
      {
        slug: "grocery-help",
        name: "Grocery",
        tasks: [
          { title: "Weekly groceries", mode: "planned", tags: ["shopping", "errands"] },
          { title: "Pharmacy pickup", mode: "instant", tags: ["pharmacy", "errands"] },
          { title: "Same-day errands", mode: "instant", tags: ["urgent", "errands"] },
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
        name: "Garden",
        tasks: [
          { title: "Lawn mowing", mode: "planned", tags: ["garden", "seasonal"] },
          { title: "Leaf cleanup", mode: "planned", tags: ["garden", "cleaning"] },
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
          { title: "Ride to appointment", mode: "planned", tags: ["transport", "senior"] },
          { title: "School pickup", mode: "planned", tags: ["family", "transport"] },
        ],
      },
    ],
  },
  {
    slug: "parking",
    name: "Parking",
    subcategories: [
      {
        slug: "daily-night",
        name: "Day and night",
        tasks: [
          { title: "Day parking", mode: "instant", tags: ["parking", "day"] },
          { title: "Night parking", mode: "instant", tags: ["parking", "night"] },
          { title: "Employee parking", mode: "recurring", tags: ["parking", "employee"] },
          { title: "Vacation parking", mode: "planned", tags: ["parking", "vacation"] },
          { title: "Camping/van no power", mode: "planned", tags: ["parking", "van"] },
          { title: "Camping/van with power", mode: "planned", tags: ["parking", "van", "power"] },
        ],
      },
    ],
  },
] as const;

export const providerAvailabilityOptions = [
  "Available now",
  "Today",
  "This week",
  "Planned",
] as const;

export const urgencyOptions = ["Low", "Medium", "High"] as const;

export const callbackCategories = [
  "Home help",
  "Senior visit",
  "Dog walking",
  "Small services",
  "Parking",
  "Custom request",
] as const;

export const callbackSlots = ["morning", "afternoon", "evening"] as const;

export const callbackContactModes = ["phone", "whatsapp"] as const;

export const howItWorksSteps = [
  {
    title: "Share your need",
    description: "Tell us what you need in a few taps.",
  },
  {
    title: "Match nearby help",
    description: "We show trusted local people and parking options.",
  },
  {
    title: "Book quickly",
    description: "Reserve in seconds and finalize safely in platform.",
  },
] as const;

export const benefits = [
  "Fast local matching",
  "Trusted provider profiles",
  "Visible from-pricing",
  "Phone support for seniors",
  "Partner cafes and pharmacies",
] as const;

export const faqItems = [
  {
    question: "Can I book as a guest?",
    answer: "Yes, guest flow is enabled and account can be finalized at the end.",
  },
  {
    question: "Are payments secure?",
    answer: "Payment status is managed in platform with pending, paid and released flow.",
  },
  {
    question: "Can I reserve parking for a van?",
    answer: "Yes, van/camping parking is included with and without power options.",
  },
] as const;

export const siteConfig = {
  name: "NEARYOU",
  description: "Find trusted help near you in seconds.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@nearyou.ch",
};
