import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const demoProviders = [
  { firstName: "Camille", lastName: "Renaud", city: "Lausanne", canton: "VD", category: "Aide a domicile", hourlyFrom: 35, rating: 4.9, completed: 124, lat: 46.5207, lng: 6.6323 },
  { firstName: "Nora", lastName: "Meyer", city: "Geneve", canton: "GE", category: "Visite senior", hourlyFrom: 30, rating: 4.8, completed: 92, lat: 46.2044, lng: 6.1432 },
  { firstName: "Yann", lastName: "Lombard", city: "Fribourg", canton: "FR", category: "Promenade chien", hourlyFrom: 24, rating: 4.7, completed: 58, lat: 46.8065, lng: 7.1619 },
  { firstName: "Lea", lastName: "Vuille", city: "Montreux", canton: "VD", category: "Menage premium", hourlyFrom: 42, rating: 4.9, completed: 138, lat: 46.433, lng: 6.9114 },
  { firstName: "Sami", lastName: "Darwish", city: "Nyon", canton: "VD", category: "Bricolage", hourlyFrom: 37, rating: 4.6, completed: 76, lat: 46.3833, lng: 6.2397 },
  { firstName: "Mila", lastName: "Perret", city: "Sion", canton: "VS", category: "Aide a domicile", hourlyFrom: 33, rating: 4.8, completed: 97, lat: 46.2331, lng: 7.3606 },
  { firstName: "Arnaud", lastName: "Keller", city: "Neuchatel", canton: "NE", category: "Jardinage", hourlyFrom: 32, rating: 4.7, completed: 69, lat: 46.9896, lng: 6.9293 },
  { firstName: "Ines", lastName: "Tissot", city: "Yverdon", canton: "VD", category: "Visite senior", hourlyFrom: 31, rating: 4.9, completed: 132, lat: 46.7785, lng: 6.6412 },
  { firstName: "Hugo", lastName: "Baumann", city: "Vevey", canton: "VD", category: "Bricolage", hourlyFrom: 36, rating: 4.6, completed: 73, lat: 46.4612, lng: 6.843 },
  { firstName: "Sofia", lastName: "Almeida", city: "Morges", canton: "VD", category: "Garde d'enfants", hourlyFrom: 34, rating: 4.8, completed: 105, lat: 46.5118, lng: 6.498 },
  { firstName: "Noe", lastName: "Girard", city: "Bulle", canton: "FR", category: "Promenade chien", hourlyFrom: 23, rating: 4.7, completed: 63, lat: 46.619, lng: 7.057 },
  { firstName: "Eva", lastName: "Schmid", city: "Carouge", canton: "GE", category: "Menage premium", hourlyFrom: 41, rating: 4.8, completed: 116, lat: 46.181, lng: 6.139 },
];

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Variable manquante: ${name}`);
  return value;
}

async function findUserByEmail(supabase, email) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  return data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

async function findOrCreateAuthUser(supabase, firstName, lastName, email) {
  const existing = await findUserByEmail(supabase, email);
  if (existing) return existing.id;

  const createRes = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    password: "NearYou_demo_2026!",
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      language: "fr",
      account_type: "provider",
    },
  });

  if (createRes.error || !createRes.data.user) {
    throw createRes.error ?? new Error(`Creation utilisateur impossible pour ${email}`);
  }

  return createRes.data.user.id;
}

async function upsertProviderData(supabase, provider, profileId, email) {
  const displayName = `${provider.firstName} ${provider.lastName}`;

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: profileId,
      role: "provider",
      first_name: provider.firstName,
      last_name: provider.lastName,
      phone: "+41 79 000 00 00",
      city: provider.city,
      language: "fr",
      account_status: "active",
    },
    { onConflict: "id" },
  );
  if (profileError) throw profileError;

  const { data: application } = await supabase
    .from("provider_applications")
    .select("id")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!application?.id) {
    const { error: applicationError } = await supabase.from("provider_applications").insert({
      profile_id: profileId,
      status: "new",
      workflow_status: "approved",
      first_name: provider.firstName,
      last_name: provider.lastName,
      business_name: displayName,
      email,
      phone: "+41 79 000 00 00",
      city: provider.city,
      canton: provider.canton,
      country: "Suisse",
      category: provider.category,
      intervention_radius_km: 20,
      services_description: `${provider.category} premium avec approche humaine et locale.`,
      years_experience: "6",
      availability: "Lundi au samedi",
      legal_status: "independant",
      legal_responsibility_ack: true,
      terms_ack: true,
      consent: true,
      languages: ["fr"],
      accepts_urgency: true,
      reviewed_at: new Date().toISOString(),
    });
    if (applicationError) throw applicationError;
  } else {
    const { error: updateApplicationError } = await supabase
      .from("provider_applications")
      .update({
        workflow_status: "approved",
        category: provider.category,
        city: provider.city,
        canton: provider.canton,
        country: "Suisse",
      })
      .eq("id", application.id);
    if (updateApplicationError) throw updateApplicationError;
  }

  const { error: providerError } = await supabase.from("providers").upsert(
    {
      profile_id: profileId,
      display_name: displayName,
      rating: provider.rating,
      completed_missions: provider.completed,
      verified: true,
      top_provider: provider.rating >= 4.8,
      hourly_from_chf: provider.hourlyFrom,
      is_active: true,
      latitude: provider.lat,
      longitude: provider.lng,
    },
    { onConflict: "profile_id" },
  );
  if (providerError) throw providerError;

  await supabase.from("provider_availability_rules").delete().eq("profile_id", profileId);
  const { error: availabilityError } = await supabase.from("provider_availability_rules").insert([
    { profile_id: profileId, day_of_week: 1, start_time: "08:00:00", end_time: "18:00:00", is_active: true },
    { profile_id: profileId, day_of_week: 2, start_time: "08:00:00", end_time: "18:00:00", is_active: true },
    { profile_id: profileId, day_of_week: 3, start_time: "08:00:00", end_time: "18:00:00", is_active: true },
    { profile_id: profileId, day_of_week: 4, start_time: "08:00:00", end_time: "18:00:00", is_active: true },
    { profile_id: profileId, day_of_week: 5, start_time: "08:00:00", end_time: "18:00:00", is_active: true },
  ]);
  if (availabilityError) throw availabilityError;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? required("SUPABASE_URL");
  const serviceRoleKey = required("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const [index, provider] of demoProviders.entries()) {
    const email = `demo.provider.${index + 1}@nearyou.ch`;
    const profileId = await findOrCreateAuthUser(supabase, provider.firstName, provider.lastName, email);
    await upsertProviderData(supabase, provider, profileId, email);
    console.log(`seeded provider ${index + 1}/${demoProviders.length}: ${provider.firstName} ${provider.lastName}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
