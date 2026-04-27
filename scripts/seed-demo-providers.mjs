import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const DEMO_PASSWORD = "PresDeToi_demo_2026!";

const PRODUCTION_HOSTS = new Set([
  "xn--prsdetoi-20a.com",
  "www.xn--prsdetoi-20a.com",
  "presdetoi.com",
  "www.presdetoi.com",
]);

const CITY_COORDS = {
  "St-Prex": { lat: 46.4791, lng: 6.4591 },
  Morges: { lat: 46.5111, lng: 6.4988 },
  Aubonne: { lat: 46.495, lng: 6.3917 },
  Rolle: { lat: 46.4582, lng: 6.3344 },
  Lausanne: { lat: 46.5197, lng: 6.6323 },
  Nyon: { lat: 46.3833, lng: 6.2396 },
};

const AVATAR_URLS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
];

function hostnameFromUrl(value) {
  if (!value) return null;
  try {
    return new URL(value.startsWith("http") ? value : `https://${value}`).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function assertDemoSeedAllowed() {
  const appEnv = (process.env.APP_ENV ?? process.env.NEXT_PUBLIC_APP_ENV ?? "").toLowerCase();
  const vercelEnv = (process.env.VERCEL_ENV ?? "").toLowerCase();
  const siteHost = hostnameFromUrl(process.env.NEXT_PUBLIC_SITE_URL);
  const vercelHost = hostnameFromUrl(process.env.VERCEL_URL);
  const isProduction =
    appEnv === "production" ||
    vercelEnv === "production" ||
    (siteHost ? PRODUCTION_HOSTS.has(siteHost) : false) ||
    (vercelHost ? PRODUCTION_HOSTS.has(vercelHost) : false) ||
    (!appEnv && !vercelEnv && process.env.NODE_ENV === "production");

  if (isProduction) {
    throw new Error("Seed démo bloqué: environnement de production détecté.");
  }

  if (process.env.DEMO_SEED_ENABLED !== "true") {
    throw new Error("Seed démo désactivé. Définissez DEMO_SEED_ENABLED=true en local/staging uniquement.");
  }
}

const providersSeed = [
  {
    key: "menage-regulier",
    firstName: "Camille",
    lastName: "Reynaud",
    age: 31,
    city: "St-Prex",
    postalCode: "1162",
    canton: "VD",
    providerType: "independant",
    category: "Ménage",
    headline: "Ménage régulier soigné pour familles actives",
    description: "Je propose un ménage régulier, discret et fiable, avec un suivi simple de vos priorités.",
    yearsExperience: 6,
    hourlyFrom: 39,
    radiusKm: 15,
    rating: 4.9,
    completed: 142,
    tags: ["menage", "nettoyage", "ponctuel", "st-prex"],
    serviceKeywords: ["menage", "aspirateur", "laver", "nettoyage cuisine"],
  },
  {
    key: "nettoyage-fin-bail",
    firstName: "Ana",
    lastName: "Martins",
    age: 36,
    city: "Morges",
    postalCode: "1110",
    canton: "VD",
    providerType: "entreprise",
    category: "Ménage",
    headline: "Nettoyage fin de bail et remise en état",
    description: "Spécialisée fin de bail, état des lieux et nettoyage complet des surfaces sensibles.",
    yearsExperience: 8,
    hourlyFrom: 47,
    radiusKm: 20,
    rating: 4.8,
    completed: 188,
    tags: ["fin de bail", "menage", "vitres", "etat des lieux"],
    serviceKeywords: ["fin de bail", "nettoyer vitres", "nettoyage"],
  },
  {
    key: "jardinage-pro",
    firstName: "Nicolas",
    lastName: "Perrenoud",
    age: 42,
    city: "Aubonne",
    postalCode: "1170",
    canton: "VD",
    providerType: "independant",
    category: "Jardinage",
    headline: "Entretien jardin de saison",
    description: "Tonte, désherbage, ramassage feuilles et petits travaux extérieurs autour de chez vous.",
    yearsExperience: 11,
    hourlyFrom: 45,
    radiusKm: 25,
    rating: 4.8,
    completed: 156,
    tags: ["jardin", "tonte", "haie", "saisonnier"],
    serviceKeywords: ["jardin", "tondre", "desherber", "ramasser feuilles"],
  },
  {
    key: "tonte-haies",
    firstName: "Yassine",
    lastName: "Bouraoui",
    age: 29,
    city: "Rolle",
    postalCode: "1180",
    canton: "VD",
    providerType: "particulier",
    category: "Jardinage",
    headline: "Tonte et tailles rapides",
    description: "Interventions rapides pour pelouses et haies, avec passage urgent possible selon planning.",
    yearsExperience: 4,
    hourlyFrom: 40,
    radiusKm: 18,
    rating: 4.7,
    completed: 94,
    tags: ["tonte", "haie", "disponible maintenant"],
    serviceKeywords: ["tondre", "haie", "jardin"],
  },
  {
    key: "bricolage-maison",
    firstName: "Sami",
    lastName: "Keller",
    age: 34,
    city: "Lausanne",
    postalCode: "1003",
    canton: "VD",
    providerType: "independant",
    category: "Bricolage",
    headline: "Petits travaux propres et efficaces",
    description: "Fixations murales, petites réparations, installation d'accessoires et dépannage courant.",
    yearsExperience: 9,
    hourlyFrom: 49,
    radiusKm: 22,
    rating: 4.8,
    completed: 167,
    tags: ["bricolage", "reparation", "fixation", "maison"],
    serviceKeywords: ["bricolage", "fixer", "petits travaux", "reparation"],
  },
  {
    key: "montage-meubles",
    firstName: "Lucas",
    lastName: "Meyer",
    age: 27,
    city: "Nyon",
    postalCode: "1260",
    canton: "VD",
    providerType: "particulier",
    category: "Montage meubles",
    headline: "Montage meubles IKEA et rangements",
    description: "Montage/démontage de meubles, armoires, lits et optimisation d'espace.",
    yearsExperience: 5,
    hourlyFrom: 46,
    radiusKm: 20,
    rating: 4.9,
    completed: 131,
    tags: ["montage meuble", "ikea", "armoire", "lit"],
    serviceKeywords: ["montage meuble", "armoire", "ikea", "demonter meuble"],
  },
  {
    key: "informatique-senior",
    firstName: "Julie",
    lastName: "Fischer",
    age: 33,
    city: "Lausanne",
    postalCode: "1004",
    canton: "VD",
    providerType: "independant",
    category: "Informatique",
    headline: "Cours informatique pour seniors",
    description: "Accompagnement patient pour téléphone, e-mail, tablette, iPhone et sécurité numérique.",
    yearsExperience: 7,
    hourlyFrom: 55,
    radiusKm: 18,
    rating: 5.0,
    completed: 103,
    tags: ["informatique", "senior", "iphone", "telephone"],
    serviceKeywords: ["informatique", "ordinateur", "senior", "telephone", "iphone"],
  },
  {
    key: "promenade-chien",
    firstName: "Yann",
    lastName: "Dubois",
    age: 25,
    city: "Morges",
    postalCode: "1110",
    canton: "VD",
    providerType: "particulier",
    category: "Promenade chien",
    headline: "Balades fiables et adaptées au chien",
    description: "Promenades quotidiennes 30 à 60 minutes avec photos et retour message après mission.",
    yearsExperience: 3,
    hourlyFrom: 30,
    radiusKm: 12,
    rating: 4.8,
    completed: 118,
    tags: ["chien", "promenade", "animaux", "disponible maintenant"],
    serviceKeywords: ["promenade chien", "chien", "balade"],
  },
  {
    key: "garde-animaux",
    firstName: "Ines",
    lastName: "Kunz",
    age: 30,
    city: "Rolle",
    postalCode: "1180",
    canton: "VD",
    providerType: "particulier",
    category: "Garde animaux",
    headline: "Garde animaux à domicile",
    description: "Visites et garde courte durée pour chiens/chats avec protocole simple et rassurant.",
    yearsExperience: 6,
    hourlyFrom: 34,
    radiusKm: 16,
    rating: 4.9,
    completed: 127,
    tags: ["garde animaux", "chat", "chien", "visites"],
    serviceKeywords: ["garde", "animaux", "nourrir", "litiere"],
  },
  {
    key: "aide-courses",
    firstName: "Maya",
    lastName: "Torres",
    age: 23,
    city: "St-Prex",
    postalCode: "1162",
    canton: "VD",
    providerType: "particulier",
    category: "Livraison locale",
    headline: "Aide courses et livraisons de proximité",
    description: "Courses alimentaires, pharmacie, poste et livraisons locales avec suivi en temps réel.",
    yearsExperience: 2,
    hourlyFrom: 29,
    radiusKm: 15,
    rating: 4.7,
    completed: 81,
    tags: ["courses", "livraison", "pharmacie", "poste"],
    serviceKeywords: ["faire courses", "livraison", "poste", "colis"],
  },
  {
    key: "accompagnement-senior",
    firstName: "Claire",
    lastName: "Vuillermet",
    age: 45,
    city: "Nyon",
    postalCode: "1260",
    canton: "VD",
    providerType: "independant",
    category: "Aide seniors",
    headline: "Accompagnement senior humain et rassurant",
    description: "Accompagnement rendez-vous, démarches et présence bienveillante pour proches seniors.",
    yearsExperience: 10,
    hourlyFrom: 44,
    radiusKm: 20,
    rating: 5.0,
    completed: 176,
    tags: ["senior", "accompagnement", "courses senior", "rdv medical"],
    serviceKeywords: ["accompagner", "senior", "courses", "medecin"],
  },
  {
    key: "demenagement-leger",
    firstName: "Noe",
    lastName: "Pinto",
    age: 28,
    city: "Aubonne",
    postalCode: "1170",
    canton: "VD",
    providerType: "particulier",
    category: "Déménagement",
    headline: "Déménagement léger et manutention",
    description: "Aide pour cartons, chargement léger, organisation rapide et ponctuelle.",
    yearsExperience: 5,
    hourlyFrom: 41,
    radiusKm: 18,
    rating: 4.7,
    completed: 92,
    tags: ["demenagement", "cartons", "chargement", "transport"],
    serviceKeywords: ["demenagement", "cartons", "porter"],
  },
  {
    key: "livraison-locale-express",
    firstName: "Farid",
    lastName: "Rossi",
    age: 39,
    city: "Lausanne",
    postalCode: "1006",
    canton: "VD",
    providerType: "entreprise",
    category: "Livraison locale",
    headline: "Livraison locale express",
    description: "Livraisons rapides d'objets, repas et documents dans l'arc lémanique.",
    yearsExperience: 12,
    hourlyFrom: 38,
    radiusKm: 30,
    rating: 4.8,
    completed: 219,
    tags: ["livraison", "express", "documents", "transport"],
    serviceKeywords: ["livraison", "rapide", "deposer documents", "colis"],
  },
  {
    key: "cours-particuliers",
    firstName: "Elise",
    lastName: "Monnier",
    age: 26,
    city: "Morges",
    postalCode: "1110",
    canton: "VD",
    providerType: "independant",
    category: "Cours particuliers",
    headline: "Cours particuliers à domicile",
    description: "Soutien scolaire personnalisé et méthodologie adaptée collège/lycée.",
    yearsExperience: 4,
    hourlyFrom: 52,
    radiusKm: 14,
    rating: 4.9,
    completed: 88,
    tags: ["cours", "soutien scolaire", "devoirs", "langues"],
    serviceKeywords: ["cours", "devoirs", "soutien", "langues"],
  },
  {
    key: "aide-administrative",
    firstName: "Patricia",
    lastName: "Humbert",
    age: 41,
    city: "St-Prex",
    postalCode: "1162",
    canton: "VD",
    providerType: "entreprise",
    category: "Aide administrative",
    headline: "Aide administrative claire et efficace",
    description: "Classement, formulaires, courriers et démarches administratives suisses du quotidien.",
    yearsExperience: 15,
    hourlyFrom: 48,
    radiusKm: 20,
    rating: 4.9,
    completed: 164,
    tags: ["administratif", "formulaires", "courrier", "demarches"],
    serviceKeywords: ["administratif", "formulaire", "courrier", "classement"],
  },
];

const reviewComments = [
  "Très ponctuel, travail propre et rapide.",
  "Personne très rassurante, je recommande.",
  "Service impeccable, communication facile.",
  "Très patient avec ma maman, merci beaucoup.",
  "Le jardin est nickel, super efficace.",
  "Intervention claire et sans stress, parfait.",
  "Excellent suivi, je referai appel à ce prestataire.",
];

const clientProfiles = [
  { firstName: "Sophie", lastName: "Perrin", city: "St-Prex" },
  { firstName: "Marc", lastName: "Bianchi", city: "Morges" },
  { firstName: "Nadia", lastName: "Lemoine", city: "Rolle" },
  { firstName: "Thierry", lastName: "Perret", city: "Nyon" },
  { firstName: "Lea", lastName: "Garcia", city: "Lausanne" },
  { firstName: "Olivier", lastName: "Dufour", city: "Aubonne" },
  { firstName: "Myriam", lastName: "Rossier", city: "St-Prex" },
  { firstName: "Julien", lastName: "Morin", city: "Morges" },
];

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Variable manquante: ${name}`);
  return value;
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function computeBirthDateFromAge(age) {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear() - age, 5, 15)).toISOString().slice(0, 10);
}

function randomPhone(index) {
  const suffix = String(1000 + index).slice(-4);
  return `+41 79 55${suffix.slice(0, 2)} ${suffix.slice(2)}`;
}

async function loadAuthUsersMap(supabase) {
  const userMap = new Map();
  let page = 1;
  const perPage = 500;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users ?? [];
    for (const user of users) {
      if (user.email) userMap.set(user.email.toLowerCase(), user.id);
    }
    if (users.length < perPage) break;
    page += 1;
  }
  return userMap;
}

async function ensureAuthUser(supabase, usersMap, { email, firstName, lastName, role }) {
  const key = email.toLowerCase();
  const existingId = usersMap.get(key);
  if (existingId) return existingId;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      account_type: role,
      is_demo_seed: true,
    },
  });

  if (error || !data.user) {
    throw error ?? new Error(`Impossible de créer le compte ${email}`);
  }

  usersMap.set(key, data.user.id);
  return data.user.id;
}

function stripUndefined(input) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
}

async function upsertProfileSafe(supabase, payload) {
  const variants = [
    payload,
    { ...payload, account_status: undefined },
    { ...payload, birth_date: undefined, account_status: undefined },
    {
      id: payload.id,
      role: payload.role,
      first_name: payload.first_name,
      last_name: payload.last_name,
      phone: payload.phone ?? null,
      city: payload.city ?? null,
    },
    {
      id: payload.id,
      role: payload.role,
      first_name: payload.first_name,
      last_name: payload.last_name,
    },
  ].map(stripUndefined);

  let lastError = null;
  for (const variant of variants) {
    const { error } = await supabase.from("profiles").upsert(variant, { onConflict: "id" });
    if (!error) return;
    lastError = error;
  }

  throw lastError ?? new Error("Impossible de mettre à jour le profil");
}

async function ensureProviderApplicationApproved(supabase, profileId, payload) {
  try {
    const { data: latestApp, error: latestAppError } = await supabase
      .from("provider_applications")
      .select("id")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestAppError) {
      console.warn(`[seed] provider_applications inaccessible pour ${profileId}: ${latestAppError.message}`);
      return;
    }

    const updateVariants = [
      payload,
      { workflow_status: "approved", status: "new" },
      { workflow_status: "approved" },
    ].map(stripUndefined);

    const insertVariants = [
      { profile_id: profileId, ...payload },
      { profile_id: profileId, workflow_status: "approved", status: "new" },
      { profile_id: profileId, workflow_status: "approved" },
    ].map(stripUndefined);

    if (latestApp?.id) {
      for (const variant of updateVariants) {
        const { error } = await supabase.from("provider_applications").update(variant).eq("id", latestApp.id);
        if (!error) return;
      }
      console.warn(`[seed] impossible de mettre provider_application en approved pour ${profileId}`);
      return;
    }

    for (const variant of insertVariants) {
      const { error } = await supabase.from("provider_applications").insert(variant);
      if (!error) return;
    }

    console.warn(`[seed] impossible d'insérer provider_application pour ${profileId}`);
  } catch (error) {
    console.warn(`[seed] provider_applications ignoré pour ${profileId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function pickServiceIds(services, keywords, limit = 5) {
  const normalizedKeywords = keywords.map((keyword) => slugify(keyword));
  const scored = services
    .map((service) => {
      const haystack = `${service.slug} ${service.title}`.toLowerCase();
      let score = 0;
      for (const keyword of normalizedKeywords) {
        if (haystack.includes(keyword)) score += 2;
        const shortKeyword = keyword.replace(/-/g, " ");
        if (haystack.includes(shortKeyword)) score += 1;
      }
      return { id: service.id, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((entry) => entry.id);
}

async function main() {
  assertDemoSeedAllowed();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? required("SUPABASE_URL");
  const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const usersMap = await loadAuthUsersMap(supabase);
  const { data: servicesData, error: servicesError } = await supabase
    .from("services")
    .select("id, slug, title")
    .eq("active", true);
  if (servicesError) throw servicesError;
  const services = servicesData ?? [];

  for (let providerIndex = 0; providerIndex < providersSeed.length; providerIndex += 1) {
    const provider = providersSeed[providerIndex];
    const providerEmail = `demo.provider.${provider.key}@presdetoi.local`;
    const providerProfileId = await ensureAuthUser(supabase, usersMap, {
      email: providerEmail,
      firstName: provider.firstName,
      lastName: provider.lastName,
      role: "provider",
    });

    const birthDate = computeBirthDateFromAge(provider.age);
    const phone = randomPhone(providerIndex + 10);
    const displayName = `${provider.firstName} ${provider.lastName}`;
    const avatarUrl = provider.avatarUrl ?? AVATAR_URLS[providerIndex % AVATAR_URLS.length];
    const coords = CITY_COORDS[provider.city] ?? CITY_COORDS["St-Prex"];

    await upsertProfileSafe(supabase, {
      id: providerProfileId,
      role: "provider",
      first_name: provider.firstName,
      last_name: provider.lastName,
      phone,
      city: provider.city,
      bio: provider.description,
      avatar_url: avatarUrl,
      birth_date: birthDate,
      language: "fr",
      account_status: "active",
    });

    await ensureProviderApplicationApproved(supabase, providerProfileId, {
      workflow_status: "approved",
      status: "new",
      first_name: provider.firstName,
      last_name: provider.lastName,
      business_name: displayName,
      email: providerEmail,
      phone,
      address_line: `Rue du Port ${providerIndex + 5}`,
      postal_code: provider.postalCode,
      city: provider.city,
      canton: provider.canton,
      country: "Suisse",
      category: provider.category,
      intervention_radius_km: provider.radiusKm,
      legal_status: provider.providerType,
      company_name: provider.providerType === "entreprise" ? `${provider.lastName} Services Sàrl` : null,
      iban: `CH93 0076 2011 6238 529${providerIndex}`,
      services_description: provider.headline,
      years_experience: String(provider.yearsExperience),
      availability: "Lundi au samedi, selon créneaux",
      legal_responsibility_ack: true,
      terms_ack: true,
      consent: true,
      languages: ["fr"],
      accepts_urgency: true,
      birth_date: birthDate,
      reviewed_at: new Date().toISOString(),
    });

    const providerPayload = {
      profile_id: providerProfileId,
      display_name: displayName,
      rating: provider.rating,
      completed_missions: provider.completed,
      verified: true,
      top_provider: provider.rating >= 4.8,
      hourly_from_chf: provider.hourlyFrom,
      is_active: true,
      provider_type: provider.providerType,
      intervention_radius_km: provider.radiusKm,
      available_now: provider.tags.includes("disponible maintenant"),
      search_tags: provider.tags,
      latitude: coords.lat,
      longitude: coords.lng,
      is_demo: true,
      demo_label: "Profil exemple",
    };

    let providerUpsert = await supabase
      .from("providers")
      .upsert(providerPayload, { onConflict: "profile_id" })
      .select("id")
      .single();

    if (providerUpsert.error) {
      const fallbackPayload = {
        profile_id: providerProfileId,
        display_name: displayName,
        rating: provider.rating,
        completed_missions: provider.completed,
        verified: true,
        top_provider: provider.rating >= 4.8,
        hourly_from_chf: provider.hourlyFrom,
        is_active: true,
      };
      providerUpsert = await supabase
        .from("providers")
        .upsert(fallbackPayload, { onConflict: "profile_id" })
        .select("id")
        .single();
    }

    const { data: providerRow, error: providerUpsertError } = providerUpsert;
    if (providerUpsertError || !providerRow) throw providerUpsertError ?? new Error("Provider row missing after upsert");

    try {
      await supabase.from("provider_availability_rules").delete().eq("profile_id", providerProfileId);
      await supabase.from("provider_availability_rules").insert([
        { profile_id: providerProfileId, day_of_week: 1, start_time: "08:00:00", end_time: "18:00:00", is_active: true },
        { profile_id: providerProfileId, day_of_week: 2, start_time: "08:00:00", end_time: "18:00:00", is_active: true },
        { profile_id: providerProfileId, day_of_week: 3, start_time: "08:00:00", end_time: "18:00:00", is_active: true },
        { profile_id: providerProfileId, day_of_week: 4, start_time: "08:00:00", end_time: "18:00:00", is_active: true },
        { profile_id: providerProfileId, day_of_week: 5, start_time: "08:00:00", end_time: "18:00:00", is_active: true },
        { profile_id: providerProfileId, day_of_week: 6, start_time: "09:00:00", end_time: "14:00:00", is_active: true },
      ]);
    } catch (error) {
      console.warn(`[seed] disponibilités ignorées pour ${displayName}: ${error instanceof Error ? error.message : String(error)}`);
    }

    try {
      await supabase.from("provider_services").delete().eq("profile_id", providerProfileId);
    } catch {
      // table or column can be absent on partially migrated projects
    }
    const selectedServiceIds = pickServiceIds(services, provider.serviceKeywords, 6);
    if (selectedServiceIds.length > 0) {
      const providerServicesRows = selectedServiceIds.map((serviceId, index) => ({
        profile_id: providerProfileId,
        service_id: serviceId,
        min_price_chf: provider.hourlyFrom + index * 2,
        is_active: true,
      }));
      const { error: providerServicesError } = await supabase.from("provider_services").insert(providerServicesRows);
      if (providerServicesError) {
        console.warn(`[seed] provider_services ignoré pour ${displayName}: ${providerServicesError.message}`);
      }
    }

    await supabase
      .from("bookings")
      .delete()
      .eq("provider_id", providerRow.id)
      .ilike("notes", "Mission de test -%");

    const reviewCount = 3 + (providerIndex % 4);
    for (let reviewIndex = 0; reviewIndex < reviewCount; reviewIndex += 1) {
      const clientSeed = clientProfiles[(providerIndex + reviewIndex) % clientProfiles.length];
      const customerEmail = `demo.customer.${slugify(clientSeed.firstName)}.${slugify(clientSeed.lastName)}.${reviewIndex}@presdetoi.local`;
      const customerProfileId = await ensureAuthUser(supabase, usersMap, {
        email: customerEmail,
        firstName: clientSeed.firstName,
        lastName: clientSeed.lastName,
        role: "customer",
      });

      await upsertProfileSafe(supabase, {
        id: customerProfileId,
        role: "customer",
        first_name: clientSeed.firstName,
        last_name: clientSeed.lastName,
        city: clientSeed.city,
        phone: randomPhone(providerIndex * 10 + reviewIndex),
        language: "fr",
        account_status: "active",
      });

      const startsAt = new Date();
      startsAt.setDate(startsAt.getDate() - (reviewIndex + 2 + providerIndex));
      startsAt.setHours(9, 0, 0, 0);
      const endsAt = new Date(startsAt);
      endsAt.setHours(11, 0, 0, 0);

      const serviceIdForReview = selectedServiceIds[reviewIndex % Math.max(1, selectedServiceIds.length)] ?? null;
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          customer_id: customerProfileId,
          provider_id: providerRow.id,
          service_id: serviceIdForReview,
          status: "completed",
          starts_at: startsAt.toISOString(),
          ends_at: endsAt.toISOString(),
          address: `${clientSeed.city}, Suisse`,
          city: clientSeed.city,
          notes: `Mission de test - ${provider.key}`,
          price_from_chf: provider.hourlyFrom,
          currency: "CHF",
        })
        .select("id")
        .single();
      if (bookingError || !booking) throw bookingError ?? new Error("Booking missing");

      const comment = reviewComments[(providerIndex + reviewIndex) % reviewComments.length];
      const rating = 4 + ((providerIndex + reviewIndex) % 2);
      const reviewDate = new Date();
      reviewDate.setDate(reviewDate.getDate() - (reviewIndex + providerIndex + 1));

      const { error: reviewError } = await supabase.from("reviews").insert({
        booking_id: booking.id,
        customer_id: customerProfileId,
        provider_id: providerRow.id,
        rating,
        comment,
        is_public: true,
        is_moderated: true,
        created_at: reviewDate.toISOString(),
      });
      if (reviewError) throw reviewError;
    }

    console.log(`seeded demo provider ${providerIndex + 1}/${providersSeed.length}: ${displayName}`);
  }

  console.log("Done: 15 profiles exemples seeded.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
