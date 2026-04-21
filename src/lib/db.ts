import { fullCatalogue } from "@/lib/constants";
import { hasSupabaseServiceRole } from "@/lib/supabase";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type HomeData = {
  missions: Array<{
    id: string;
    title: string;
    description: string;
    fromPrice: number;
    isAvailableToday: boolean;
    distanceKm: number;
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

const fallbackHomeData: HomeData = {
  missions: [
    {
      id: "mission-1",
      title: "Aide à domicile - matin",
      description: "Aide quotidienne avec présence bienveillante",
      fromPrice: 35,
      isAvailableToday: true,
      distanceKm: 2.1,
      badge: "Vérifié",
      lat: 46.5207,
      lng: 6.6323,
      category: { name: "Aide à domicile" },
      provider: {
        profile: {
          firstName: "Camille",
          lastName: "R.",
          avatarUrl: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=800&q=80",
          rating: 4.9,
          completedMissions: 124,
        },
      },
    },
    {
      id: "mission-2",
      title: "Visite senior - après-midi",
      description: "Visite de compagnie et accompagnement léger",
      fromPrice: 29,
      isAvailableToday: true,
      distanceKm: 3.7,
      badge: "Top",
      lat: 46.5121,
      lng: 6.6401,
      category: { name: "Visite senior" },
      provider: {
        profile: {
          firstName: "Nora",
          lastName: "M.",
          avatarUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
          rating: 4.8,
          completedMissions: 89,
        },
      },
    },
    {
      id: "mission-3",
      title: "Promenade chien - soir",
      description: "Promenade locale 30 à 60 minutes",
      fromPrice: 22,
      isAvailableToday: false,
      distanceKm: 1.9,
      badge: null,
      lat: 46.5077,
      lng: 6.6241,
      category: { name: "Promenade chien" },
      provider: {
        profile: {
          firstName: "Yann",
          lastName: "L.",
          avatarUrl: "https://images.unsplash.com/photo-1541534401786-2077eed87a72?auto=format&fit=crop&w=800&q=80",
          rating: 4.7,
          completedMissions: 51,
        },
      },
    },
  ],
  parkingListings: [
    { id: "parking-1", title: "Parking gare", city: "Lausanne", dayPrice: 12, hasPower: false, lat: 46.5169, lng: 6.6291 },
    { id: "parking-2", title: "Parking van Ouchy", city: "Lausanne", dayPrice: 24, hasPower: true, lat: 46.5076, lng: 6.6259 },
  ],
  partners: [
    { id: "partner-1", name: "Café du Centre", type: "cafe", city: "Lausanne", address: "Place Centrale 4", lat: 46.5198, lng: 6.6323 },
    { id: "partner-2", name: "Pharmacie de la Gare", type: "pharmacy", city: "Lausanne", address: "Avenue de la Gare 12", lat: 46.5169, lng: 6.6291 },
  ],
  categories: [
    { id: "c1", name: "Aide à domicile", fromPrice: 35 },
    { id: "c2", name: "Visite senior", fromPrice: 29 },
    { id: "c3", name: "Promenade chien", fromPrice: 22 },
    { id: "c4", name: "Parking", fromPrice: 12 },
  ],
};

export async function getHomeData() {
  if (!hasSupabaseServiceRole()) {
    return fallbackHomeData;
  }

  try {
    const supabase = getSupabaseAdminClient();

    const [providersRes, categoriesRes, partnersRes] = await Promise.all([
      supabase
        .from("providers")
        .select("id, display_name, rating, completed_missions, verified, top_provider, hourly_from_chf, latitude, longitude, profiles!inner(first_name,last_name,avatar_url,city)")
        .eq("is_active", true)
        .limit(25),
      supabase.from("service_categories").select("id, name_fr, from_price_chf").eq("active", true),
      supabase.from("partners").select("id, name, type, city, address, latitude, longitude").eq("active", true),
    ]);

    if (providersRes.error || categoriesRes.error || partnersRes.error) {
      return fallbackHomeData;
    }

    const categoryByName = (categoriesRes.data ?? []).map((c) => c.name_fr);

    const missions = (providersRes.data ?? []).map((provider, index) => {
      const profile = Array.isArray(provider.profiles) ? provider.profiles[0] : provider.profiles;
      const categoryName = categoryByName[index % Math.max(1, categoryByName.length)] ?? "Service";

      return {
        id: provider.id,
        title: `${categoryName} à Lausanne`,
        description: `${categoryName} avec réponse humaine rapide`,
        fromPrice: provider.hourly_from_chf,
        isAvailableToday: index % 2 === 0,
        distanceKm: 1.2 + index,
        badge: provider.verified ? "Vérifié" : provider.top_provider ? "Top" : null,
        lat: Number(provider.latitude ?? 46.5197),
        lng: Number(provider.longitude ?? 6.6323),
        category: { name: categoryName },
        provider: {
          profile: {
            firstName: profile?.first_name ?? provider.display_name,
            lastName: profile?.last_name ?? "",
            avatarUrl: profile?.avatar_url ?? "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=800&q=80",
            rating: Number(provider.rating ?? 5),
            completedMissions: provider.completed_missions ?? 0,
          },
        },
      };
    });

    const parkingCategory = categoriesRes.data?.find((item) => item.name_fr.toLowerCase().includes("parking"));
    const parkingListings = [
      {
        id: "parking-lausanne-centre",
        title: "Parking Lausanne Centre",
        city: "Lausanne",
        dayPrice: parkingCategory?.from_price_chf ?? 12,
        hasPower: false,
        lat: 46.5192,
        lng: 6.6335,
      },
      {
        id: "parking-ouchy-van",
        title: "Parking Ouchy Van",
        city: "Lausanne",
        dayPrice: Math.max(18, parkingCategory?.from_price_chf ?? 12),
        hasPower: true,
        lat: 46.5071,
        lng: 6.6261,
      },
    ];

    return {
      missions: missions.length > 0 ? missions : fallbackHomeData.missions,
      parkingListings,
      partners: (partnersRes.data ?? []).map((partner) => ({
        id: partner.id,
        name: partner.name,
        type: partner.type,
        city: partner.city,
        address: partner.address ?? "Lausanne",
        lat: Number(partner.latitude ?? 46.5197),
        lng: Number(partner.longitude ?? 6.6323),
      })),
      categories: (categoriesRes.data ?? []).map((category) => ({
        id: category.id,
        name: category.name_fr,
        fromPrice: category.from_price_chf,
      })),
    };
  } catch {
    return fallbackHomeData;
  }
}

export async function getCatalogueData() {
  if (!hasSupabaseServiceRole()) {
    return fullCatalogue.map((category, categoryIndex) => ({
      id: `${category.slug}-${categoryIndex}`,
      name: category.name,
      fromPrice: 20 + categoryIndex * 4,
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

  try {
    const supabase = getSupabaseAdminClient();
    const { data: categories, error: categoriesError } = await supabase
      .from("service_categories")
      .select("id, name_fr, from_price_chf")
      .eq("active", true)
      .order("name_fr", { ascending: true });

    if (categoriesError || !categories) {
      return [];
    }

    const { data: services } = await supabase
      .from("services")
      .select("id, category_id, title, mode, tags")
      .eq("active", true);

    return categories.map((category) => {
      const categoryServices = (services ?? []).filter((service) => service.category_id === category.id);
      return {
        id: category.id,
        name: category.name_fr,
        fromPrice: category.from_price_chf,
        subcategories: [
          {
            id: `${category.id}-default`,
            name: "Services disponibles",
            tasks: categoryServices.map((service) => ({
              id: service.id,
              title: service.title,
              mode: service.mode,
              tags: (service.tags ?? []).map((tag: string) => ({ tag: { name: tag } })),
            })),
          },
        ],
      };
    });
  } catch {
    return [];
  }
}

export async function getProviderProfile(providerId: string) {
  if (!hasSupabaseServiceRole()) {
    const mission = fallbackHomeData.missions.find((item) => item.id === providerId) ?? fallbackHomeData.missions[0];
    const [firstName, lastName] = `${mission.provider.profile?.firstName ?? ""} ${mission.provider.profile?.lastName ?? ""}`.trim().split(" ");

    return {
      id: providerId,
      profile: {
        firstName: firstName ?? "Camille",
        lastName: lastName ?? "R.",
        avatarUrl: mission.provider.profile?.avatarUrl ?? fallbackHomeData.missions[0].provider.profile?.avatarUrl ?? "",
        description: mission.description,
        rating: mission.provider.profile?.rating ?? 4.8,
        completedMissions: mission.provider.profile?.completedMissions ?? 40,
        isVerified: true,
        isTopProvider: true,
        city: "Lausanne",
      },
      missions: fallbackHomeData.missions.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        fromPrice: item.fromPrice,
        category: { name: item.category.name },
      })),
    };
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data: provider } = await supabase
      .from("providers")
      .select("id, display_name, rating, completed_missions, verified, top_provider, profiles!inner(first_name,last_name,avatar_url,bio,city)")
      .eq("id", providerId)
      .maybeSingle();

    if (!provider) return null;

    const profile = Array.isArray(provider.profiles) ? provider.profiles[0] : provider.profiles;

    const { data: services } = await supabase
      .from("services")
      .select("id, title, description, from_price_chf, service_categories(name_fr)")
      .eq("active", true)
      .limit(6);

    return {
      id: provider.id,
      profile: {
        firstName: profile?.first_name ?? provider.display_name,
        lastName: profile?.last_name ?? "",
        avatarUrl: profile?.avatar_url ?? "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=800&q=80",
        description: profile?.bio ?? "Prestataire local NearYou",
        rating: Number(provider.rating ?? 5),
        completedMissions: provider.completed_missions ?? 0,
        isVerified: provider.verified,
        isTopProvider: provider.top_provider,
        city: profile?.city ?? "Lausanne",
      },
      missions: (services ?? []).map((service) => {
        const serviceCategory = service.service_categories;
        let categoryName = "Service";

        if (Array.isArray(serviceCategory)) {
          categoryName = serviceCategory[0]?.name_fr ?? "Service";
        } else if (serviceCategory && typeof serviceCategory === "object" && "name_fr" in serviceCategory) {
          categoryName = String((serviceCategory as { name_fr?: string }).name_fr ?? "Service");
        }

        return {
          id: service.id,
          title: service.title,
          description: service.description ?? "Service local sur mesure",
          fromPrice: service.from_price_chf,
          category: { name: categoryName },
        };
      }),
    };
  } catch {
    return null;
  }
}

export async function getAdminData() {
  if (!hasSupabaseServiceRole()) {
    return {
      users: 120,
      missions: 42,
      providers: 18,
      parking: 9,
      partners: 3,
      reviews: 57,
      feedbackRate: 68,
      bookings: [
        { id: "b1", serviceType: "Aide à domicile", status: "pending", reservationSource: "app", totalFromPrice: 35 },
      ],
      hotlineRequests: [
        { id: "h1", firstName: "Luc", lastName: "B.", serviceType: "Visite senior", status: "new" },
      ],
      supportMessages: [
        { id: "s1", email: "client@example.com", subject: "Question réservation", status: "new", created_at: new Date().toISOString() },
      ],
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
        totalRequests: 42,
        newRequests: 10,
        inProgressRequests: 17,
        completedRequests: 11,
        cancelledRequests: 4,
        users: 120,
        providers: 18,
        providerPending: 6,
      },
      byCategory: [
        { category: "Aide à domicile", count: 14 },
        { category: "Visite senior", count: 10 },
        { category: "Promenade chien", count: 8 },
      ],
      byCity: [
        { city: "Lausanne", count: 23 },
        { city: "Renens", count: 9 },
      ],
      volume: {
        last7Days: 12,
        last30Days: 37,
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



