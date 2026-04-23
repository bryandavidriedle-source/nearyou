import { fullCatalogue, serviceCategories } from "@/lib/constants";
import { hasSupabaseServiceRole } from "@/lib/supabase";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type HomeData = {
  missions: Array<{
    id: string;
    title: string;
    description: string;
    fromPrice: number;
    isAvailableToday: boolean;
    distanceKm: number | null;
    badge: string | null;
    lat: number;
    lng: number;
    category: { name: string };
    provider: {
      profile: {
        firstName: string;
        lastName: string;
        avatarUrl: string;
        rating: number;
        completedMissions: number;
        providerScore: number;
      } | null;
    };
  }>;
  parkingListings: Array<{
    id: string;
    title: string;
    city: string;
    dayPrice: number;
    hasPower: boolean;
    lat: number;
    lng: number;
  }>;
  partners: Array<{
    id: string;
    name: string;
    type: string;
    city: string;
    address: string;
    lat: number;
    lng: number;
  }>;
  categories: Array<{ id: string; name: string; fromPrice: number }>;
};

function getDefaultCategories() {
  return serviceCategories.map((category) => ({
    id: category.slug,
    name: category.label,
    fromPrice: category.fromPrice,
  }));
}

function getFallbackCatalogueData() {
  return fullCatalogue.map((category, categoryIndex) => ({
    id: `${category.slug}-${categoryIndex}`,
    slug: category.slug,
    name: category.name,
    fromPrice: serviceCategories.find((item) => item.slug === category.slug)?.fromPrice ?? 20 + categoryIndex * 4,
    subcategories: category.subcategories.map((subcategory, subIndex) => ({
      id: `${subcategory.slug}-${subIndex}`,
      name: subcategory.name,
      tasks: subcategory.tasks.map((task, taskIndex) => ({
        id: `${task.title}-${taskIndex}`,
        title: task.title,
        mode: task.mode,
        tags: task.tags.map((tag) => ({ tag: { name: tag } })),
      })),
    })),
  }));
}

const allowedCategoryNames = new Set(serviceCategories.map((category) => category.label));

function getEmptyHomeData(): HomeData {
  return {
    missions: [],
    parkingListings: [],
    partners: [],
    categories: getDefaultCategories(),
  };
}

export async function getHomeData() {
  if (!hasSupabaseServiceRole()) {
    return getEmptyHomeData();
  }

  try {
    const supabase = getSupabaseAdminClient();

    const [providersRes, categoriesRes, partnersRes, providerApplicationsRes] = await Promise.all([
      supabase
        .from("providers")
        .select("id, profile_id, display_name, rating, completed_missions, verified, top_provider, hourly_from_chf, latitude, longitude, profiles!inner(first_name,last_name,avatar_url,city)")
        .eq("is_active", true)
        .limit(50),
      supabase.from("service_categories").select("id, name_fr, from_price_chf").eq("active", true),
      supabase.from("partners").select("id, name, type, city, address, latitude, longitude").eq("active", true),
      supabase.from("provider_applications").select("profile_id, workflow_status, created_at").order("created_at", { ascending: false }),
    ]);

    if (providersRes.error || categoriesRes.error || partnersRes.error || providerApplicationsRes.error) {
      return getEmptyHomeData();
    }

    const latestWorkflowByProfile = new Map<string, string>();
    for (const application of providerApplicationsRes.data ?? []) {
      if (!application.profile_id) continue;
      if (!latestWorkflowByProfile.has(application.profile_id)) {
        latestWorkflowByProfile.set(application.profile_id, application.workflow_status ?? "draft");
      }
    }

    const visibleCategories = (categoriesRes.data ?? []).filter((category) => allowedCategoryNames.has(category.name_fr));
    const categoryByName = visibleCategories.map((c) => c.name_fr);
    const visibleProviders = (providersRes.data ?? []).filter((provider) => {
      if (!provider.profile_id) return false;
      return latestWorkflowByProfile.get(provider.profile_id) === "approved";
    });

    const providerProfileIds = visibleProviders
      .map((provider) => provider.profile_id)
      .filter((value): value is string => Boolean(value));

    const availabilityByProfile = new Map<
      string,
      Array<{ day_of_week: number; start_time: string | null; end_time: string | null }>
    >();

    if (providerProfileIds.length > 0) {
      const { data: availabilityRows } = await supabase
        .from("provider_availability_rules")
        .select("profile_id, day_of_week, start_time, end_time")
        .in("profile_id", providerProfileIds)
        .eq("is_active", true);

      for (const row of availabilityRows ?? []) {
        if (!row.profile_id) continue;
        const current = availabilityByProfile.get(row.profile_id) ?? [];
        current.push({
          day_of_week: row.day_of_week,
          start_time: row.start_time,
          end_time: row.end_time,
        });
        availabilityByProfile.set(row.profile_id, current);
      }
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const missions = visibleProviders.map((provider, index) => {
      const profile = Array.isArray(provider.profiles) ? provider.profiles[0] : provider.profiles;
      const categoryName = categoryByName[index % Math.max(1, categoryByName.length)] ?? "Service";
      const categoryFromPrice = visibleCategories[index % Math.max(1, visibleCategories.length)]?.from_price_chf ?? 0;
      const rating = Number(provider.rating ?? 0);
      const completedMissions = provider.completed_missions ?? 0;
      const providerScore = Math.min(100, Math.round(rating * 14 + Math.min(completedMissions, 250) * 0.22));
      const availabilityRows = provider.profile_id ? availabilityByProfile.get(provider.profile_id) ?? [] : [];
      const isAvailableNow = availabilityRows.some((availability) => {
        if (availability.day_of_week !== currentDay) return false;
        const [startHour, startMinute] = (availability.start_time ?? "00:00:00").split(":").map(Number);
        const [endHour, endMinute] = (availability.end_time ?? "00:00:00").split(":").map(Number);
        const start = startHour * 60 + startMinute;
        const end = endHour * 60 + endMinute;
        return currentMinutes >= start && currentMinutes <= end;
      });

      return {
        id: provider.id,
        title: categoryName,
        description: `Intervention locale en Suisse (${profile?.city ?? "zone locale"})`,
        fromPrice: Number(provider.hourly_from_chf ?? categoryFromPrice),
        isAvailableToday: isAvailableNow,
        distanceKm: null,
        badge: provider.verified ? "Vérifié" : provider.top_provider ? "Top" : null,
        lat: Number(provider.latitude ?? 46.5197),
        lng: Number(provider.longitude ?? 6.6323),
        category: { name: categoryName },
        provider: {
          profile: {
            firstName: profile?.first_name ?? provider.display_name,
            lastName: profile?.last_name ?? "",
            avatarUrl: profile?.avatar_url ?? "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=800&q=80",
            rating,
            completedMissions,
            providerScore,
          },
        },
      };
    });

    return {
      missions,
      parkingListings: [],
      partners: (partnersRes.data ?? []).map((partner) => ({
        id: partner.id,
        name: partner.name,
        type: partner.type,
        city: partner.city,
        address: partner.address ?? "Lausanne",
        lat: Number(partner.latitude ?? 46.5197),
        lng: Number(partner.longitude ?? 6.6323),
      })),
      categories:
        visibleCategories.length > 0
          ? visibleCategories.map((category) => ({
              id: category.id,
              name: category.name_fr,
              fromPrice: category.from_price_chf,
            }))
          : getDefaultCategories(),
    };
  } catch {
    return getEmptyHomeData();
  }
}

export async function getCatalogueData() {
  if (!hasSupabaseServiceRole()) {
    return getFallbackCatalogueData();
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data: categories, error: categoriesError } = await supabase
      .from("service_categories")
      .select("id, slug, name_fr, from_price_chf")
      .eq("active", true)
      .order("display_order", { ascending: true });

    if (categoriesError || !categories || categories.length === 0) {
      return getFallbackCatalogueData();
    }

    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("id, category_id, title, mode, tags")
      .eq("active", true);

    if (servicesError) {
      return getFallbackCatalogueData();
    }

    const categoriesWithServices = categories.map((category) => {
      const categoryServices = (services ?? []).filter((service) => service.category_id === category.id && service.title);
      const matchingFallback = fullCatalogue.find((item) => item.slug === category.slug);

      const dbTasks = categoryServices.map((service) => {
        const rawTags = service.tags;
        const normalizedTags = Array.isArray(rawTags)
          ? rawTags
          : typeof rawTags === "string"
            ? [rawTags]
            : [];

        return {
          id: service.id,
          title: service.title,
          mode: service.mode,
          tags: normalizedTags.map((tag: string) => ({ tag: { name: tag } })),
        };
      });

      const fallbackSubcategories =
        matchingFallback?.subcategories.map((subcategory, subIndex) => ({
          id: `${category.id}-fallback-${subIndex}`,
          name: subcategory.name,
          tasks: subcategory.tasks.map((task, taskIndex) => ({
            id: `${category.id}-fallback-task-${taskIndex}`,
            title: task.title,
            mode: task.mode,
            tags: task.tags.map((tag) => ({ tag: { name: tag } })),
          })),
        })) ?? [];

      const subcategories =
        dbTasks.length > 0
          ? [
              {
                id: `${category.id}-default`,
                name: "Services disponibles",
                tasks: dbTasks,
              },
            ]
          : fallbackSubcategories;

      return {
        id: category.id,
        slug: category.slug,
        name: category.name_fr,
        fromPrice: category.from_price_chf,
        subcategories,
      };
    });

    const hasAnyTask = categoriesWithServices.some((category) =>
      category.subcategories.some((subcategory) => subcategory.tasks.length > 0),
    );

    if (!hasAnyTask) {
      return getFallbackCatalogueData();
    }

    return categoriesWithServices;
  } catch {
    return getFallbackCatalogueData();
  }
}

export async function getProviderProfile(providerId: string) {
  if (!hasSupabaseServiceRole()) {
    return null;
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data: provider } = await supabase
      .from("providers")
      .select("id, profile_id, display_name, rating, completed_missions, verified, top_provider, is_active, profiles!inner(first_name,last_name,avatar_url,bio,city)")
      .eq("id", providerId)
      .maybeSingle();

    if (!provider) return null;
    if (!provider.profile_id || provider.is_active !== true) return null;

    const { data: latestApplication } = await supabase
      .from("provider_applications")
      .select("workflow_status")
      .eq("profile_id", provider.profile_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestApplication?.workflow_status !== "approved") {
      return null;
    }

    const profile = Array.isArray(provider.profiles) ? provider.profiles[0] : provider.profiles;

    const { data: providerServices } = await supabase
      .from("provider_services")
      .select("service_id, min_price_chf, services(id, title, description, from_price_chf, service_categories(name_fr))")
      .eq("profile_id", provider.profile_id)
      .eq("is_active", true)
      .limit(12);

    return {
      id: provider.id,
      profile: {
        firstName: profile?.first_name ?? provider.display_name,
        lastName: profile?.last_name ?? "",
        avatarUrl: profile?.avatar_url ?? "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=800&q=80",
        description: profile?.bio ?? "Prestataire local NearYou",
        rating: Number(provider.rating ?? 0),
        completedMissions: provider.completed_missions ?? 0,
        providerScore: Math.min(100, Math.round(Number(provider.rating ?? 0) * 14 + Math.min(provider.completed_missions ?? 0, 250) * 0.22)),
        isVerified: provider.verified,
        isTopProvider: provider.top_provider,
        city: profile?.city ?? "Lausanne",
      },
      missions: (providerServices ?? []).map((entry) => {
        const service = Array.isArray(entry.services) ? entry.services[0] : entry.services;
        const serviceCategory = service?.service_categories;
        let categoryName = "Service";

        if (Array.isArray(serviceCategory)) {
          categoryName = serviceCategory[0]?.name_fr ?? "Service";
        } else if (serviceCategory && typeof serviceCategory === "object" && "name_fr" in serviceCategory) {
          categoryName = String((serviceCategory as { name_fr?: string }).name_fr ?? "Service");
        }

        return {
          id: service?.id ?? entry.service_id,
          title: service?.title ?? "Service local",
          description: service?.description ?? "Service local sur mesure",
          fromPrice: Number(entry.min_price_chf ?? service?.from_price_chf ?? 0),
          category: { name: categoryName },
        };
      }).filter((service) => service.fromPrice > 0),
    };
  } catch {
    return null;
  }
}

export async function getAdminData() {
  if (!hasSupabaseServiceRole()) {
    return {
      users: 0,
      missions: 0,
      providers: 0,
      parking: 0,
      partners: 0,
      reviews: 0,
      feedbackRate: 0,
      bookings: [],
      hotlineRequests: [],
      supportMessages: [],
    };
  }

  const supabase = getSupabaseAdminClient();

  const [
    profilesCount,
    providersCount,
    bookingsRes,
    reviewsCount,
    partnersCount,
    serviceRequestsRes,
    hotlineRes,
    supportRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("providers").select("id", { count: "exact", head: true }),
    supabase.from("bookings").select("id, status, reservation_source, price_from_chf, services(title)").order("created_at", { ascending: false }).limit(25),
    supabase.from("reviews").select("id", { count: "exact", head: true }),
    supabase.from("partners").select("id", { count: "exact", head: true }),
    supabase.from("service_requests").select("id", { count: "exact", head: true }),
    supabase.from("hotline_requests").select("id, first_name, last_name, service_type, status").order("created_at", { ascending: false }).limit(25),
    supabase.from("support_messages").select("id, email, subject, status, created_at").order("created_at", { ascending: false }).limit(25),
  ]);

  const bookings = (bookingsRes.data ?? []).map((booking) => {
    const rawService = booking.services;
    let serviceType = "Service";

    if (Array.isArray(rawService)) {
      serviceType = rawService[0]?.title ?? "Service";
    } else if (rawService && typeof rawService === "object" && "title" in rawService) {
      serviceType = String((rawService as { title?: string }).title ?? "Service");
    }

    return {
      id: booking.id,
      serviceType,
      status: booking.status,
      reservationSource: booking.reservation_source,
      totalFromPrice: booking.price_from_chf,
      review: null,
    };
  });

  return {
    users: profilesCount.count ?? 0,
    missions: serviceRequestsRes.count ?? 0,
    providers: providersCount.count ?? 0,
    parking: 0,
    partners: partnersCount.count ?? 0,
    reviews: reviewsCount.count ?? 0,
    feedbackRate: bookings.length === 0 ? 0 : Math.min(100, Math.round(((reviewsCount.count ?? 0) / bookings.length) * 100)),
    bookings,
    hotlineRequests: (hotlineRes.data ?? []).map((item) => ({
      id: item.id,
      firstName: item.first_name,
      lastName: item.last_name,
      serviceType: item.service_type,
      status: item.status,
    })),
    supportMessages: supportRes.data ?? [],
  };
}

export async function getMissionById(missionId: string) {
  const home = await getHomeData();
  const mission = home.missions.find((item) => item.id === missionId);
  if (!mission) return null;

  return {
    id: mission.id,
    title: mission.title,
    fromPrice: mission.fromPrice,
    isAvailableToday: mission.isAvailableToday,
    provider: {
      profile: mission.provider.profile,
    },
    category: mission.category,
  };
}

export async function getAdminDashboardData() {
  if (!hasSupabaseServiceRole()) {
    return {
      kpis: {
        totalRequests: 0,
        newRequests: 0,
        inProgressRequests: 0,
        completedRequests: 0,
        cancelledRequests: 0,
        users: 0,
        providers: 0,
        providerPending: 0,
      },
      byCategory: [],
      byCity: [],
      volume: {
        last7Days: 0,
        last30Days: 0,
      },
    };
  }

  const supabase = getSupabaseAdminClient();

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [
    requestsRes,
    profilesCount,
    providersCount,
    providerPendingCount,
  ] = await Promise.all([
    supabase
      .from("service_requests")
      .select("id, status, category, city, created_at"),
    supabase.from("profiles").select("id", { head: true, count: "exact" }),
    supabase.from("providers").select("id", { head: true, count: "exact" }),
    supabase
      .from("provider_applications")
      .select("id", { head: true, count: "exact" })
      .in("workflow_status", ["submitted", "pending_review", "needs_info"]),
  ]);

  const requests = requestsRes.data ?? [];
  const statusCount = {
    new: 0,
    reviewing: 0,
    contacted: 0,
    closed: 0,
  };

  const byCategoryMap = new Map<string, number>();
  const byCityMap = new Map<string, number>();
  let last7Days = 0;
  let last30Days = 0;

  for (const request of requests) {
    if (request.status in statusCount) {
      statusCount[request.status as keyof typeof statusCount] += 1;
    }

    byCategoryMap.set(request.category, (byCategoryMap.get(request.category) ?? 0) + 1);
    byCityMap.set(request.city, (byCityMap.get(request.city) ?? 0) + 1);

    const createdAt = new Date(request.created_at);
    if (createdAt >= sevenDaysAgo) last7Days += 1;
    if (createdAt >= thirtyDaysAgo) last30Days += 1;
  }

  return {
    kpis: {
      totalRequests: requests.length,
      newRequests: statusCount.new,
      inProgressRequests: statusCount.reviewing,
      completedRequests: statusCount.contacted,
      cancelledRequests: statusCount.closed,
      users: profilesCount.count ?? 0,
      providers: providersCount.count ?? 0,
      providerPending: providerPendingCount.count ?? 0,
    },
    byCategory: Array.from(byCategoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count),
    byCity: Array.from(byCityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count),
    volume: {
      last7Days,
      last30Days,
    },
  };
}



