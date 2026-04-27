import { SERVICE_CATEGORIES, SWISS_CITY_TARGETS } from "@/lib/catalog";
import { isDemoDataVisible } from "@/lib/runtime";
import { hasSupabaseServiceRole } from "@/lib/supabase";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type SearchTagRow = {
  slug: string;
  label: string;
  synonyms: string[] | null;
};

type ServiceKeywordRow = {
  keyword: string;
  category_id: string | null;
  service_id: string | null;
  weight: number | null;
};

type CategoryRow = {
  id: string;
  slug: string;
  name_fr: string;
  from_price_chf: number;
  ai_search_hint: string | null;
};

type ServiceRow = {
  id: string;
  slug: string;
  title: string;
  from_price_chf: number;
  category_id: string;
  service_categories:
    | {
        slug?: string;
        name_fr?: string;
      }
    | {
        slug?: string;
        name_fr?: string;
      }[]
    | null;
};

type ProviderRow = {
  id: string;
  profile_id: string;
  display_name: string;
  rating: number | null;
  completed_missions: number | null;
  verified: boolean | null;
  top_provider: boolean | null;
  hourly_from_chf: number | null;
  is_demo: boolean | null;
  demo_label: string | null;
  provider_type: string | null;
  intervention_radius_km: number | null;
  available_now: boolean | null;
  search_tags: string[] | null;
  profiles:
    | {
        first_name?: string | null;
        last_name?: string | null;
        avatar_url?: string | null;
        city?: string | null;
        account_status?: string | null;
        bio?: string | null;
      }
    | {
        first_name?: string | null;
        last_name?: string | null;
        avatar_url?: string | null;
        city?: string | null;
        account_status?: string | null;
        bio?: string | null;
      }[]
    | null;
};

type ProviderApplicationRow = {
  profile_id: string | null;
  workflow_status: string | null;
  category: string | null;
  city: string | null;
  postal_code: string | null;
  canton: string | null;
  legal_status: string | null;
  intervention_radius_km: number | null;
};

type ProviderServiceRow = {
  profile_id: string;
  min_price_chf: number | null;
  services:
    | {
        id?: string;
        slug?: string;
        title?: string;
        from_price_chf?: number;
        service_categories?: { slug?: string; name_fr?: string } | { slug?: string; name_fr?: string }[] | null;
      }
    | {
        id?: string;
        slug?: string;
        title?: string;
        from_price_chf?: number;
        service_categories?: { slug?: string; name_fr?: string } | { slug?: string; name_fr?: string }[] | null;
      }[]
    | null;
};

type AvailabilityRow = {
  profile_id: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean | null;
};

export type SmartSearchInput = {
  query?: string;
  city?: string;
  postalCode?: string;
  minRating?: number;
  maxPrice?: number;
  availableNow?: boolean;
  limit?: number;
  sourcePage?: string;
  profileId?: string | null;
  logQuery?: boolean;
};

export type SmartSearchSuggestion = {
  categories: Array<{ slug: string; label: string; fromPrice: number; reason: string }>;
  tags: Array<{ tag: string; label: string }>;
  cities: Array<{ city: string; postalCode: string; canton: string }>;
  services: Array<{ slug: string; title: string; categorySlug: string; fromPrice: number }>;
  providers: Array<{ id: string; name: string; city: string; rating: number; fromPrice: number; isAvailableNow: boolean }>;
};

export type SmartSearchProvider = {
  id: string;
  profileId: string;
  name: string;
  avatarUrl: string;
  city: string;
  distanceKm: number | null;
  postalCode: string | null;
  canton: string | null;
  rating: number;
  completedMissions: number;
  fromPrice: number;
  providerType: string | null;
  interventionRadiusKm: number;
  categories: string[];
  tags: string[];
  badges: string[];
  isAvailableNow: boolean;
  demoLabel: string | null;
  description: string;
  profileUrl: string;
  bookingUrl: string;
};

export type SmartSearchResult = {
  query: string;
  normalizedQuery: string;
  detected: {
    city: string | null;
    postalCode: string | null;
    tags: string[];
    categorySlugs: string[];
    serviceSlugs: string[];
  };
  filters: {
    minRating: number | null;
    maxPrice: number | null;
    availableNow: boolean;
  };
  suggestions: SmartSearchSuggestion;
  providers: SmartSearchProvider[];
  fallback: {
    noResults: boolean;
    message: string | null;
    suggestedCategories: Array<{ slug: string; label: string; fromPrice: number }>;
    customRequestUrl: string;
  };
};

const STATIC_TAG_SYNONYMS: Record<string, string[]> = {
  menage: ["menage", "nettoyage", "proprete", "fin de bail", "appartement", "ménage", "nettoyer"],
  jardin: ["jardin", "jardinage", "tonte", "haie", "pelouse", "feuilles", "aide pour mon jardin"],
  animaux: [
    "animal",
    "animaux",
    "chien",
    "chiens",
    "dog",
    "dogs",
    "dog walking",
    "chat",
    "chats",
    "promenade",
    "promenade chien",
    "promener",
    "promener mon chien",
    "sortir mon chien",
    "balade chien",
    "garde animaux",
  ],
  senior: ["senior", "seniors", "maman", "papa", "accompagnement", "courses senior", "aider un proche", "personne agee"],
  informatique: ["informatique", "ordinateur", "ordi", "mon ordi bug", "ordinateur bug", "telephone", "iphone", "tablette", "wifi"],
  bricolage: ["bricolage", "reparation", "petits travaux", "percer", "fixer", "depannage"],
  "montage-meuble": ["montage meuble", "monter un meuble", "meuble", "armoire", "ikea", "lit"],
  transport: ["transport", "demenagement", "livraison", "courses", "aide pour courses", "faire mes courses", "colis"],
  administratif: ["administratif", "formulaire", "papiers", "demarches", "classement", "aide administrative"],
  urgence: ["urgence", "urgent", "urgentissime", "disponible maintenant", "express"],
};

const TAG_CATEGORY_SLUGS: Record<string, string[]> = {
  animaux: ["promenade-chien", "garde-animaux"],
  jardin: ["jardinage"],
  menage: ["menage"],
  informatique: ["informatique"],
  bricolage: ["bricolage"],
  "montage-meuble": ["montage-meubles"],
  senior: ["aide-seniors", "accompagnement"],
  transport: ["aide-transport", "demenagement", "livraison-locale"],
  administratif: ["aide-administrative"],
};

const CATEGORY_INTENT_ALIASES: Record<string, string[]> = {
  "promenade-chien": ["chien", "chiens", "dog", "dogs", "dog walking", "promenade", "promener", "prome", "balade chien", "sortir mon chien"],
  "garde-animaux": ["animaux", "animal", "chat", "chats", "garde animaux", "nourrir les animaux", "litiere", "litière"],
  jardinage: ["jardin", "jardinage", "tondre", "tonte", "pelouse", "haie"],
  menage: ["menage", "ménage", "nettoyage", "nettoyer", "appartement"],
  informatique: ["informatique", "ordi", "ordinateur", "bug", "wifi", "iphone", "telephone", "téléphone"],
  bricolage: ["bricolage", "reparation", "réparation", "fixer", "percer", "depannage", "dépannage"],
  "montage-meubles": ["montage", "monter un meuble", "meuble", "armoire", "ikea"],
  "aide-transport": ["courses", "transport", "livraison", "colis", "pharmacie"],
  "aide-seniors": ["senior", "seniors", "aider un proche", "accompagnement", "courses senior"],
  "aide-administrative": ["administratif", "papiers", "formulaire", "demarches", "démarches"],
};

const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  "st-prex": { lat: 46.4796, lon: 6.4596 },
  morges: { lat: 46.5113, lon: 6.4985 },
  lausanne: { lat: 46.5197, lon: 6.6323 },
  nyon: { lat: 46.3833, lon: 6.2396 },
  rolle: { lat: 46.4582, lon: 6.3341 },
  geneve: { lat: 46.2044, lon: 6.1432 },
  fribourg: { lat: 46.8065, lon: 7.1619 },
  "yverdon-les-bains": { lat: 46.7785, lon: 6.6412 },
  aubonne: { lat: 46.4956, lon: 6.3912 },
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function tokenize(value: string) {
  return normalize(value)
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function phraseMatchesQuery(query: string, phrase: string) {
  const normalizedQuery = normalize(query);
  const normalizedPhrase = normalize(phrase);
  if (!normalizedQuery || !normalizedPhrase) return false;
  if (normalizedQuery.includes(normalizedPhrase) || normalizedPhrase.includes(normalizedQuery)) return true;

  const queryTokens = tokenize(normalizedQuery);
  const phraseTokens = tokenize(normalizedPhrase);
  return queryTokens.some((queryToken) => {
    if (queryToken.length < 3) return false;
    return phraseTokens.some((phraseToken) => phraseToken.startsWith(queryToken) || queryToken.startsWith(phraseToken));
  });
}

function anyPhraseMatchesQuery(query: string, phrases: Iterable<string>) {
  for (const phrase of phrases) {
    if (phraseMatchesQuery(query, phrase)) return true;
  }
  return false;
}

function getCityCoordinates(value: string | null | undefined) {
  if (!value) return null;
  const normalizedValue = normalize(value.replace(/\b\d{4}\b/g, "").replace(/[, ]+$/g, ""));
  const exact = CITY_COORDINATES[normalizedValue];
  if (exact) return exact;

  const city = SWISS_CITY_TARGETS.find(
    (target) => normalizedValue.includes(normalize(target.name)) || normalize(target.name).includes(normalizedValue),
  );
  return city ? CITY_COORDINATES[normalize(city.name)] ?? CITY_COORDINATES[city.slug] ?? null : null;
}

function distanceKmBetweenCities(fromCity: string | null | undefined, toCity: string | null | undefined) {
  const from = getCityCoordinates(fromCity);
  const to = getCityCoordinates(toCity);
  if (!from || !to) return null;

  const earthRadiusKm = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lon - from.lon);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round(earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function getCategoryRelation(categoryRelation: ServiceRow["service_categories"]) {
  if (Array.isArray(categoryRelation)) {
    return categoryRelation[0] ?? null;
  }
  return categoryRelation ?? null;
}

function getProfileRelation(profileRelation: ProviderRow["profiles"]) {
  if (Array.isArray(profileRelation)) {
    return profileRelation[0] ?? null;
  }
  return profileRelation ?? null;
}

function getServiceRelation(serviceRelation: ProviderServiceRow["services"]) {
  if (Array.isArray(serviceRelation)) {
    return serviceRelation[0] ?? null;
  }
  return serviceRelation ?? null;
}

function detectSwissLocation(query: string, cityInput?: string, postalCodeInput?: string) {
  const normalizedQuery = normalize(query);
  const explicitCityRaw = cityInput?.trim() ? cityInput.trim() : null;
  const explicitPostal = postalCodeInput?.trim() ? postalCodeInput.trim() : null;

  let detectedCity: string | null = null;
  let detectedPostalCode: string | null = explicitPostal;

  if (explicitCityRaw) {
    const normalizedExplicitCity = normalize(explicitCityRaw);
    const explicitPostalFromCity = explicitCityRaw.match(/\b\d{4}\b/)?.[0] ?? null;
    const cityMatch = SWISS_CITY_TARGETS.find(
      (city) => normalizedExplicitCity.includes(normalize(city.name)) || normalizedExplicitCity.includes(city.postalCode),
    );
    detectedCity = cityMatch?.name ?? explicitCityRaw.replace(/\b\d{4}\b/g, "").replace(/[, ]+$/g, "").trim();
    if (!detectedPostalCode && (explicitPostalFromCity || cityMatch?.postalCode)) {
      detectedPostalCode = explicitPostalFromCity ?? cityMatch?.postalCode ?? null;
    }
  }

  const queryPostal = normalizedQuery.match(/\b\d{4}\b/)?.[0] ?? null;
  if (!detectedPostalCode && queryPostal) {
    detectedPostalCode = queryPostal;
  }

  for (const city of SWISS_CITY_TARGETS) {
    const normalizedCity = normalize(city.name);
    if (!detectedCity && normalizedQuery.includes(normalizedCity)) {
      detectedCity = city.name;
    }
    if (!detectedPostalCode && normalizedQuery.includes(city.postalCode)) {
      detectedPostalCode = city.postalCode;
    }
  }

  if (!detectedCity && detectedPostalCode) {
    const cityByPostal = SWISS_CITY_TARGETS.find((city) => city.postalCode === detectedPostalCode);
    if (cityByPostal) detectedCity = cityByPostal.name;
  }

  if (detectedCity && !detectedPostalCode) {
    const cityByName = SWISS_CITY_TARGETS.find((city) => normalize(city.name) === normalize(detectedCity));
    if (cityByName) detectedPostalCode = cityByName.postalCode;
  }

  return {
    city: detectedCity,
    postalCode: detectedPostalCode,
  };
}

function categoryHintsFromStaticCatalog() {
  const hints = new Map<string, Set<string>>();
  for (const category of SERVICE_CATEGORIES) {
    const set = new Set<string>();
    set.add(normalize(category.label));
    set.add(normalize(category.slug.replace(/-/g, " ")));
    for (const subcategory of category.subcategories) {
      set.add(normalize(subcategory.name));
      set.add(normalize(subcategory.slug.replace(/-/g, " ")));
      for (const task of subcategory.tasks) {
        set.add(normalize(task.title));
        for (const tag of task.tags) set.add(normalize(tag));
      }
    }
    hints.set(category.slug, set);
  }
  return hints;
}

const staticCategoryHintMap = categoryHintsFromStaticCatalog();

function detectTags(query: string, dbTags: SearchTagRow[]) {
  const detected = new Set<string>();

  for (const [slug, words] of Object.entries(STATIC_TAG_SYNONYMS)) {
    if (anyPhraseMatchesQuery(query, words)) {
      detected.add(slug);
    }
  }

  for (const tag of dbTags) {
    const aliases = [tag.slug, tag.label, ...(tag.synonyms ?? [])];
    if (anyPhraseMatchesQuery(query, aliases)) {
      detected.add(tag.slug);
    }
  }

  return Array.from(detected);
}

function detectCategorySlugs(query: string, categories: CategoryRow[], detectedTags: string[], keywordRows: ServiceKeywordRow[]) {
  const matched = new Set<string>();
  const categoryById = new Map(categories.map((category) => [category.id, category.slug]));

  for (const category of categories) {
    const staticHints = staticCategoryHintMap.get(category.slug) ?? new Set<string>();
    const dbHints = [
      normalize(category.name_fr),
      normalize(category.slug.replace(/-/g, " ")),
      ...(category.ai_search_hint ? [normalize(category.ai_search_hint)] : []),
      ...(CATEGORY_INTENT_ALIASES[category.slug] ?? []),
    ];

    if (anyPhraseMatchesQuery(query, [...staticHints, ...dbHints])) {
      matched.add(category.slug);
    }
  }

  for (const keywordRow of keywordRows) {
    if (!keywordRow.category_id) continue;
    if (!phraseMatchesQuery(query, keywordRow.keyword)) continue;
    const slug = categoryById.get(keywordRow.category_id);
    if (slug) matched.add(slug);
  }

  for (const tagSlug of detectedTags) {
    const categoryFromTag = SERVICE_CATEGORIES.find((category) => normalize(category.slug) === normalize(tagSlug));
    if (categoryFromTag) matched.add(categoryFromTag.slug);
    for (const mappedSlug of TAG_CATEGORY_SLUGS[tagSlug] ?? []) {
      if (categories.some((category) => category.slug === mappedSlug) || SERVICE_CATEGORIES.some((category) => category.slug === mappedSlug)) {
        matched.add(mappedSlug);
      }
    }
  }

  return Array.from(matched);
}

function detectServiceSlugs(query: string, services: ServiceRow[]) {
  return services
    .filter((service) => anyPhraseMatchesQuery(query, [service.title, service.slug.replace(/-/g, " ")]))
    .map((service) => service.slug);
}

function isProviderAvailableNow(profileId: string, availabilityRows: AvailabilityRow[], fallbackValue: boolean) {
  if (fallbackValue) return true;
  const now = new Date();
  const day = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return availabilityRows.some((row) => {
    if (!row.is_active) return false;
    if (!row.profile_id || row.profile_id !== profileId) return false;
    if (row.day_of_week !== day) return false;

    const [startHour, startMinute] = row.start_time.split(":").map(Number);
    const [endHour, endMinute] = row.end_time.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  });
}

export async function getSmartSearchResult(input: SmartSearchInput): Promise<SmartSearchResult> {
  const query = (input.query ?? "").trim();
  const normalizedQuery = normalize(query);
  const limit = Math.max(3, Math.min(input.limit ?? 24, 48));

  if (!hasSupabaseServiceRole()) {
    const detectedLocation = detectSwissLocation(query, input.city, input.postalCode);
    const detectedTags = detectTags(query, []);
    const staticCategories = SERVICE_CATEGORIES.filter((category) => {
      if (!query) return true;
      if (detectedTags.some((tag) => normalize(tag) === normalize(category.slug))) return true;
      if ((CATEGORY_INTENT_ALIASES[category.slug] ?? []).some((alias) => phraseMatchesQuery(query, alias))) return true;
      if (detectedTags.some((tag) => (TAG_CATEGORY_SLUGS[tag] ?? []).includes(category.slug))) return true;
      const hints = staticCategoryHintMap.get(category.slug) ?? new Set<string>();
      return hints.has(normalizedQuery) || anyPhraseMatchesQuery(query, hints);
    }).slice(0, 6);

    return {
      query,
      normalizedQuery,
      detected: {
        city: detectedLocation.city,
        postalCode: detectedLocation.postalCode,
        tags: detectedTags,
        categorySlugs: staticCategories.map((category) => category.slug),
        serviceSlugs: [],
      },
      filters: {
        minRating: typeof input.minRating === "number" ? input.minRating : null,
        maxPrice: typeof input.maxPrice === "number" ? input.maxPrice : null,
        availableNow: Boolean(input.availableNow),
      },
      suggestions: {
        categories: staticCategories.map((category) => ({
          slug: category.slug,
          label: category.label,
          fromPrice: category.fromPrice,
          reason: "Catégorie proche",
        })),
        tags: detectedTags.map((tag) => ({ tag, label: tag })),
        cities: SWISS_CITY_TARGETS.slice(0, 4).map((city) => ({
          city: city.name,
          postalCode: city.postalCode,
          canton: city.canton,
        })),
        services: [],
        providers: [],
      },
      providers: [],
      fallback: {
        noResults: true,
        message: "Aucun prestataire validé n'est disponible pour le moment. Vous pouvez créer une demande personnalisée.",
        suggestedCategories: (staticCategories.length > 0 ? staticCategories : SERVICE_CATEGORIES.slice(0, 4)).map((category) => ({
          slug: category.slug,
          label: category.label,
          fromPrice: category.fromPrice,
        })),
        customRequestUrl: "/demande",
      },
    };
  }

  const supabase = getSupabaseAdminClient();

  const tagsRes = await supabase.from("search_tags").select("slug, label, synonyms").eq("active", true);
  const dbTags = (tagsRes.error ? [] : tagsRes.data ?? []) as SearchTagRow[];

  const categoriesEnhancedRes = await supabase
    .from("service_categories")
    .select("id, slug, name_fr, from_price_chf, ai_search_hint")
    .eq("active", true);
  const categoriesRes =
    categoriesEnhancedRes.error
      ? await supabase.from("service_categories").select("id, slug, name_fr, from_price_chf").eq("active", true)
      : categoriesEnhancedRes;
  const categories = (categoriesRes.data ?? []).map((row) => ({
    ...row,
    ai_search_hint: "ai_search_hint" in row ? (row as { ai_search_hint?: string | null }).ai_search_hint ?? null : null,
  })) as CategoryRow[];

  const keywordsRes = await supabase.from("service_keywords").select("keyword, category_id, service_id, weight").limit(1200);
  const keywordRows = (keywordsRes.error ? [] : keywordsRes.data ?? []) as ServiceKeywordRow[];

  const servicesRes = await supabase
    .from("services")
    .select("id, slug, title, from_price_chf, category_id, service_categories(slug, name_fr)")
    .eq("active", true)
    .limit(1500);
  const services = (servicesRes.data ?? []) as ServiceRow[];

  const providersEnhancedRes = await supabase
    .from("providers")
    .select(
      "id, profile_id, display_name, rating, completed_missions, verified, top_provider, hourly_from_chf, is_demo, demo_label, provider_type, intervention_radius_km, available_now, search_tags, profiles!inner(first_name,last_name,avatar_url,city,account_status,bio)",
    )
    .eq("is_active", true)
    .limit(1000);
  const providersBaseRes =
    providersEnhancedRes.error
      ? await supabase
          .from("providers")
          .select(
            "id, profile_id, display_name, rating, completed_missions, verified, top_provider, hourly_from_chf, profiles!inner(first_name,last_name,avatar_url,city,account_status,bio)",
          )
          .eq("is_active", true)
          .limit(1000)
      : providersEnhancedRes;
  const providers = (providersBaseRes.data ?? []).map((row) => ({
    ...row,
    is_demo: "is_demo" in row ? (row as { is_demo?: boolean | null }).is_demo ?? false : false,
    demo_label: "demo_label" in row ? (row as { demo_label?: string | null }).demo_label ?? null : null,
    provider_type: "provider_type" in row ? (row as { provider_type?: string | null }).provider_type ?? null : null,
    intervention_radius_km:
      "intervention_radius_km" in row ? (row as { intervention_radius_km?: number | null }).intervention_radius_km ?? null : null,
    available_now: "available_now" in row ? (row as { available_now?: boolean | null }).available_now ?? false : false,
    search_tags: "search_tags" in row ? ((row as { search_tags?: string[] | null }).search_tags ?? []) : [],
  })) as ProviderRow[];

  const applicationsRes = await supabase
    .from("provider_applications")
    .select("profile_id, workflow_status, category, city, postal_code, canton, legal_status, intervention_radius_km")
    .order("created_at", { ascending: false });
  const applications = (applicationsRes.data ?? []) as ProviderApplicationRow[];

  const providerServicesRes = await supabase
    .from("provider_services")
    .select("profile_id, min_price_chf, services(id, slug, title, from_price_chf, service_categories(slug, name_fr))")
    .eq("is_active", true);
  const providerServices = (providerServicesRes.error ? [] : providerServicesRes.data ?? []) as ProviderServiceRow[];

  const availabilityRes = await supabase
    .from("provider_availability_rules")
    .select("profile_id, day_of_week, start_time, end_time, is_active")
    .eq("is_active", true);
  const availabilityRows = (availabilityRes.error ? [] : availabilityRes.data ?? []) as AvailabilityRow[];

  const detectedLocation = detectSwissLocation(query, input.city, input.postalCode);
  const detectedTags = detectTags(query, dbTags);
  const detectedCategorySlugs = detectCategorySlugs(query, categories, detectedTags, keywordRows);
  const detectedServiceSlugs = detectServiceSlugs(query, services);

  const latestAppByProfile = new Map<string, ProviderApplicationRow>();
  for (const application of applications) {
    if (!application.profile_id) continue;
    if (!latestAppByProfile.has(application.profile_id)) {
      latestAppByProfile.set(application.profile_id, application);
    }
  }
  const enforceWorkflowStatus = latestAppByProfile.size > 0;

  const providerServiceByProfile = new Map<string, ProviderServiceRow[]>();
  for (const row of providerServices) {
    const current = providerServiceByProfile.get(row.profile_id) ?? [];
    current.push(row);
    providerServiceByProfile.set(row.profile_id, current);
  }

  const categoryLabelBySlug = new Map(SERVICE_CATEGORIES.map((category) => [category.slug, category.label]));
  const categorySlugById = new Map(categories.map((category) => [category.id, category.slug]));
  const showDemoData = isDemoDataVisible();

  const enrichedProviders: SmartSearchProvider[] = providers
    .map((provider) => {
      if (!provider.profile_id) return null;
      const profile = getProfileRelation(provider.profiles);
      if (!profile || profile.account_status === "suspended") return null;
      const app = latestAppByProfile.get(provider.profile_id);
      if (enforceWorkflowStatus && app && app.workflow_status !== "approved") return null;
      if (!showDemoData && provider.is_demo) return null;

      const providerServiceRows = providerServiceByProfile.get(provider.profile_id) ?? [];
      const providerCategorySlugs = new Set<string>();
      const detectedProviderTags = new Set<string>(provider.search_tags ?? []);

      for (const item of providerServiceRows) {
        const service = getServiceRelation(item.services);
        if (!service) continue;
        if (service.slug) detectedProviderTags.add(service.slug);
        if (service.title) detectedProviderTags.add(normalize(service.title));

        const categoryRelation = service.service_categories;
        const category = Array.isArray(categoryRelation) ? categoryRelation[0] : categoryRelation;
        if (category?.slug) {
          providerCategorySlugs.add(category.slug);
          detectedProviderTags.add(category.slug);
        }
      }

      if (app?.category) {
        const appCategoryNormalized = normalize(app.category);
        const match = SERVICE_CATEGORIES.find((category) => normalize(category.label) === appCategoryNormalized || normalize(category.slug) === appCategoryNormalized);
        if (match) providerCategorySlugs.add(match.slug);
      }

      const priceCandidates = [
        provider.hourly_from_chf ?? 0,
        ...providerServiceRows.map((row) => Number(row.min_price_chf ?? 0)).filter((value) => value > 0),
      ].filter((value) => value > 0);
      const providerFromPrice = priceCandidates.length > 0 ? Math.min(...priceCandidates) : 0;
      const providerRating = Number(provider.rating ?? 0);
      const completedMissions = Number(provider.completed_missions ?? 0);
      const isAvailableNow = isProviderAvailableNow(provider.profile_id, availabilityRows, Boolean(provider.available_now));

      const badges: string[] = [];
      if (provider.verified) badges.push("Vérifié");
      if (provider.top_provider || providerRating >= 4.8) badges.push("Top prestataire");
      if (isAvailableNow) badges.push("Disponible maintenant");
      if (showDemoData && provider.is_demo) badges.push(provider.demo_label?.trim() || "Profil exemple");

      const city = app?.city ?? profile.city ?? "Suisse romande";
      const distanceKm = detectedLocation.city ? distanceKmBetweenCities(detectedLocation.city, city) : null;
      const categoryLabels = Array.from(providerCategorySlugs).map((slug) => categoryLabelBySlug.get(slug) ?? slug);

      return {
        id: provider.id,
        profileId: provider.profile_id,
        name: `${profile.first_name ?? provider.display_name} ${profile.last_name ?? ""}`.trim(),
        avatarUrl:
          profile.avatar_url ??
          "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=800&q=80",
        city,
        distanceKm,
        postalCode: app?.postal_code ?? null,
        canton: app?.canton ?? null,
        rating: providerRating,
        completedMissions,
        fromPrice: providerFromPrice,
        providerType: provider.provider_type ?? app?.legal_status ?? null,
        interventionRadiusKm: Number(provider.intervention_radius_km ?? app?.intervention_radius_km ?? 15),
        categories: categoryLabels,
        tags: Array.from(detectedProviderTags).slice(0, 16),
        badges,
        isAvailableNow,
        demoLabel: showDemoData && provider.is_demo ? provider.demo_label?.trim() || "Profil exemple" : null,
        description: profile.bio ?? "Prestataire local pour services à domicile.",
        profileUrl: `/providers/${provider.id}`,
        bookingUrl: `/reserve/${provider.id}`,
      } satisfies SmartSearchProvider;
    })
    .filter((provider): provider is SmartSearchProvider => Boolean(provider));

  const requestedMinRating = typeof input.minRating === "number" ? input.minRating : null;
  const requestedMaxPrice = typeof input.maxPrice === "number" ? input.maxPrice : null;
  const onlyAvailableNow = Boolean(input.availableNow);

  const filteredProviders = enrichedProviders
    .filter((provider) => {
      if (requestedMinRating && provider.rating < requestedMinRating) return false;
      if (requestedMaxPrice && provider.fromPrice > requestedMaxPrice) return false;
      if (onlyAvailableNow && !provider.isAvailableNow) return false;

      if (detectedLocation.city) {
        const exactCityMatch =
          normalize(provider.city).includes(normalize(detectedLocation.city)) ||
          normalize(detectedLocation.city).includes(normalize(provider.city));
        const hasDistanceMatch =
          typeof provider.distanceKm === "number" && provider.distanceKm <= Math.max(provider.interventionRadiusKm, 20);

        if (!exactCityMatch && !hasDistanceMatch) return false;
      }

      if (detectedCategorySlugs.length > 0) {
        const providerCategoriesNormalized = provider.categories.map((item) => normalize(item));
        const hasCategoryMatch = detectedCategorySlugs.some((slug) => {
          const label = categoryLabelBySlug.get(slug) ?? slug;
          return (
            providerCategoriesNormalized.includes(normalize(label)) ||
            provider.tags.some((tag) => normalize(tag) === normalize(slug))
          );
        });
        if (!hasCategoryMatch) return false;
      }

      if (
        normalizedQuery.length > 0 &&
        detectedTags.length === 0 &&
        detectedCategorySlugs.length === 0 &&
        detectedServiceSlugs.length === 0
      ) {
        const haystack = [
          provider.name,
          provider.description,
          provider.city,
          provider.providerType ?? "",
          provider.categories.join(" "),
          provider.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase();

        const tokens = tokenize(query);
        if (tokens.length > 0 && !tokens.some((token) => haystack.includes(token))) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const aScore = a.rating * 10 + Math.min(a.completedMissions, 200) * 0.05 + (a.isAvailableNow ? 2 : 0);
      const bScore = b.rating * 10 + Math.min(b.completedMissions, 200) * 0.05 + (b.isAvailableNow ? 2 : 0);
      return bScore - aScore;
    })
    .slice(0, limit);

  const serviceSuggestions = services
    .filter((service) => {
      if (!query) return true;
      const normalizedTitle = normalize(service.title);
      const normalizedSlug = normalize(service.slug.replace(/-/g, " "));
      return anyPhraseMatchesQuery(query, [normalizedTitle, normalizedSlug]);
    })
    .slice(0, 8)
    .map((service) => {
      const category = getCategoryRelation(service.service_categories);
      return {
        slug: service.slug,
        title: service.title,
        categorySlug: category?.slug ?? categorySlugById.get(service.category_id) ?? "services",
        fromPrice: Number(service.from_price_chf ?? 0),
      };
    });

  const matchedCategoriesFromDb = categories
    .filter((category) => {
      if (detectedCategorySlugs.includes(category.slug)) return true;
      if (!query) return false;
      return anyPhraseMatchesQuery(query, [category.name_fr, category.slug.replace(/-/g, " "), ...(CATEGORY_INTENT_ALIASES[category.slug] ?? [])]);
    })
    .slice(0, 8)
    .map((category) => ({
      slug: category.slug,
      label: category.name_fr,
      fromPrice: category.from_price_chf,
      reason: detectedCategorySlugs.includes(category.slug) ? "Correspondance détectée" : "Catégorie proche",
    }));

  const staticServiceSuggestions = SERVICE_CATEGORIES.flatMap((category) =>
    category.subcategories.flatMap((subcategory) =>
      subcategory.tasks.map((task) => ({
        slug: `${category.slug}-${normalize(task.title).replace(/\s+/g, "-")}`,
        title: task.title,
        categorySlug: category.slug,
        fromPrice: category.fromPrice,
        aliases: [task.title, category.label, category.slug.replace(/-/g, " "), subcategory.name, ...task.tags, ...(CATEGORY_INTENT_ALIASES[category.slug] ?? [])],
      })),
    ),
  )
    .filter((service) => !query || anyPhraseMatchesQuery(query, service.aliases))
    .sort((a, b) => Number(detectedCategorySlugs.includes(b.categorySlug)) - Number(detectedCategorySlugs.includes(a.categorySlug)))
    .slice(0, 8)
    .map((service) => ({
      slug: service.slug,
      title: service.title,
      categorySlug: service.categorySlug,
      fromPrice: service.fromPrice,
    }));

  const matchedCategoryBySlug = new Map(matchedCategoriesFromDb.map((category) => [category.slug, category]));

  for (const category of SERVICE_CATEGORIES) {
    const isMatch =
      detectedCategorySlugs.includes(category.slug) ||
      Boolean(query && anyPhraseMatchesQuery(query, [category.label, category.slug.replace(/-/g, " "), ...(CATEGORY_INTENT_ALIASES[category.slug] ?? [])]));
    if (!isMatch || matchedCategoryBySlug.has(category.slug)) continue;
    matchedCategoryBySlug.set(category.slug, {
      slug: category.slug,
      label: category.label,
      fromPrice: category.fromPrice,
      reason: detectedCategorySlugs.includes(category.slug) ? "Correspondance détectée" : "Catégorie proche",
    });
  }

  const matchedCategories = Array.from(matchedCategoryBySlug.values()).slice(0, 8);

  const providerSuggestions = filteredProviders.slice(0, 6).map((provider) => ({
    id: provider.id,
    name: provider.name,
    city: provider.city,
    rating: provider.rating,
    fromPrice: provider.fromPrice,
    isAvailableNow: provider.isAvailableNow,
  }));

  const tagSuggestions = dbTags
    .filter((tag) => {
      if (detectedTags.includes(tag.slug)) return true;
      if (!query) return false;
      return anyPhraseMatchesQuery(query, [tag.label, tag.slug, ...(tag.synonyms ?? [])]);
    })
    .slice(0, 10)
    .map((tag) => ({
      tag: tag.slug,
      label: tag.label,
    }));

  const citySuggestions = SWISS_CITY_TARGETS.filter((city) => {
    if (detectedLocation.city && normalize(city.name) === normalize(detectedLocation.city)) return true;
    if (!query && !input.city) return city.slug === "st-prex" || city.slug === "morges" || city.slug === "lausanne";
    const normalizedCity = normalize(city.name);
    return normalizedCity.includes(normalizedQuery) || normalize(query).includes(city.postalCode);
  })
    .slice(0, 6)
    .map((city) => ({
      city: city.name,
      postalCode: city.postalCode,
      canton: city.canton,
    }));

  const suggestedFallbackCategories =
    matchedCategories.length > 0
      ? matchedCategories.slice(0, 4).map((item) => ({ slug: item.slug, label: item.label, fromPrice: item.fromPrice }))
      : categories.length > 0
        ? categories.slice(0, 4).map((item) => ({ slug: item.slug, label: item.name_fr, fromPrice: item.from_price_chf }))
        : SERVICE_CATEGORIES.slice(0, 4).map((item) => ({ slug: item.slug, label: item.label, fromPrice: item.fromPrice }));

  const recognizedNeed =
    detectedCategorySlugs.length > 0 ||
    detectedServiceSlugs.length > 0 ||
    matchedCategories.length > 0 ||
    serviceSuggestions.length > 0 ||
    staticServiceSuggestions.length > 0;

  const result: SmartSearchResult = {
    query,
    normalizedQuery,
    detected: {
      city: detectedLocation.city,
      postalCode: detectedLocation.postalCode,
      tags: detectedTags,
      categorySlugs: detectedCategorySlugs,
      serviceSlugs: detectedServiceSlugs,
    },
    filters: {
      minRating: requestedMinRating,
      maxPrice: requestedMaxPrice,
      availableNow: onlyAvailableNow,
    },
    suggestions: {
      categories: matchedCategories,
      tags: tagSuggestions,
      cities: citySuggestions,
      services: serviceSuggestions.length > 0 ? serviceSuggestions : staticServiceSuggestions,
      providers: providerSuggestions,
    },
    providers: filteredProviders,
    fallback: {
      noResults: filteredProviders.length === 0,
      message:
        filteredProviders.length === 0
          ? recognizedNeed
            ? "Besoin identifié. Aucun prestataire vérifié n'est disponible pour cette zone pour le moment; créez une demande et nous vous accompagnons."
            : "Aucune correspondance exacte pour le moment. Essayez une catégorie proche ou créez une demande personnalisée."
          : null,
      suggestedCategories: suggestedFallbackCategories,
      customRequestUrl: "/demande",
    },
  };

  if (input.logQuery && query.length > 1) {
    await supabase.from("search_logs").insert({
      profile_id: input.profileId ?? null,
      query_text: query,
      normalized_query: normalizedQuery,
      detected_city: detectedLocation.city,
      detected_postal_code: detectedLocation.postalCode,
      detected_tags: detectedTags,
      detected_category_slugs: detectedCategorySlugs,
      detected_service_slugs: detectedServiceSlugs,
      result_count: filteredProviders.length,
      has_exact_match: filteredProviders.length > 0,
      source_page: input.sourcePage ?? "web",
      filters: {
        minRating: requestedMinRating,
        maxPrice: requestedMaxPrice,
        availableNow: onlyAvailableNow,
      },
    });
  }

  return result;
}

export async function inferSearchIntentWithAi(query: string) {
  void query;
  // Reserved extension point.
  // V1 intentionally does not require an external paid AI API.
  return null;
}

export const __smartSearchInternals = {
  normalize,
  tokenize,
  phraseMatchesQuery,
  detectSwissLocation,
  detectTags,
  detectCategorySlugs,
  distanceKmBetweenCities,
};

