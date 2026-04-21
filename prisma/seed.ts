import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categoriesData = [
  {
    name: "Aide a domicile",
    slug: "home-help",
    icon: "House",
    fromPrice: 35,
    description: "Daily support at home",
    subcategories: [
      {
        name: "Daily support",
        slug: "daily-support",
        tasks: [
          { title: "Meal prep", slug: "meal-prep", mode: "planned", tags: ["home", "daily"] },
          { title: "Light cleaning", slug: "light-cleaning", mode: "planned", tags: ["cleaning", "home"] },
          { title: "Laundry support", slug: "laundry-support", mode: "planned", tags: ["care", "home"] },
        ],
      },
    ],
  },
  {
    name: "Visite senior",
    slug: "senior-visit",
    icon: "HeartHandshake",
    fromPrice: 29,
    description: "Companionship and elderly support",
    subcategories: [
      {
        name: "Companionship",
        slug: "companionship",
        tasks: [
          { title: "Friendly visit", slug: "friendly-visit", mode: "planned", tags: ["senior", "visit"] },
          { title: "Appointment escort", slug: "appointment-escort", mode: "planned", tags: ["senior", "mobility"] },
          { title: "Check-in call", slug: "check-in-call", mode: "instant", tags: ["senior", "support"] },
        ],
      },
    ],
  },
  {
    name: "Animaux",
    slug: "dog-walking",
    icon: "Dog",
    fromPrice: 22,
    description: "Dog walking and pet support",
    subcategories: [
      {
        name: "Dog care",
        slug: "dog-care",
        tasks: [
          { title: "30 min dog walk", slug: "dog-walk-30", mode: "instant", tags: ["dog", "walk"] },
          { title: "Long walk", slug: "dog-long-walk", mode: "planned", tags: ["dog", "outdoor"] },
          { title: "Pet feeding", slug: "pet-feeding", mode: "planned", tags: ["pet", "home"] },
        ],
      },
    ],
  },
  {
    name: "Bricolage",
    slug: "handyman",
    icon: "Hammer",
    fromPrice: 35,
    description: "Small fixes and setup",
    subcategories: [
      {
        name: "Small fixes",
        slug: "small-fixes",
        tasks: [
          { title: "Shelf mounting", slug: "shelf-mounting", mode: "planned", tags: ["fix", "home"] },
          { title: "Lamp installation", slug: "lamp-installation", mode: "planned", tags: ["electric", "home"] },
          { title: "Furniture assembly", slug: "furniture-assembly", mode: "planned", tags: ["furniture", "assembly"] },
        ],
      },
    ],
  },
  {
    name: "Courses",
    slug: "shopping",
    icon: "ShoppingBag",
    fromPrice: 25,
    description: "Errands and shopping support",
    subcategories: [
      {
        name: "Errands",
        slug: "errands",
        tasks: [
          { title: "Weekly groceries", slug: "weekly-groceries", mode: "planned", tags: ["shopping", "weekly"] },
          { title: "Pharmacy pickup", slug: "pharmacy-pickup", mode: "instant", tags: ["pharmacy", "urgent"] },
          { title: "Same-day errands", slug: "same-day-errands", mode: "instant", tags: ["urgent", "errands"] },
        ],
      },
    ],
  },
  {
    name: "Exterieur",
    slug: "outdoor",
    icon: "Trees",
    fromPrice: 32,
    description: "Outdoor maintenance",
    subcategories: [
      {
        name: "Garden",
        slug: "garden",
        tasks: [
          { title: "Lawn mowing", slug: "lawn-mowing", mode: "planned", tags: ["garden", "seasonal"] },
          { title: "Leaf cleanup", slug: "leaf-cleanup", mode: "planned", tags: ["garden", "cleaning"] },
        ],
      },
    ],
  },
  {
    name: "Mobilite",
    slug: "mobility",
    icon: "Car",
    fromPrice: 30,
    description: "Transport and mobility assistance",
    subcategories: [
      {
        name: "Transport",
        slug: "transport",
        tasks: [
          { title: "Ride to appointment", slug: "ride-to-appointment", mode: "planned", tags: ["transport", "senior"] },
          { title: "School pickup", slug: "school-pickup", mode: "planned", tags: ["family", "transport"] },
        ],
      },
    ],
  },
  {
    name: "Parking",
    slug: "parking",
    icon: "ParkingCircle",
    fromPrice: 12,
    description: "Daily and special parking options",
    subcategories: [
      {
        name: "Usage",
        slug: "parking-usage",
        tasks: [
          { title: "Day parking", slug: "day-parking", mode: "instant", tags: ["parking", "day"] },
          { title: "Night parking", slug: "night-parking", mode: "instant", tags: ["parking", "night"] },
          { title: "Employee parking", slug: "employee-parking", mode: "recurring", tags: ["parking", "employee"] },
          { title: "Vacation parking", slug: "vacation-parking", mode: "planned", tags: ["parking", "vacation"] },
          { title: "Van parking no power", slug: "van-no-power", mode: "planned", tags: ["parking", "van"] },
          { title: "Van parking with power", slug: "van-with-power", mode: "planned", tags: ["parking", "van", "power"] },
        ],
      },
    ],
  },
] as const;

const providerProfiles = [
  ["Mila", "Rossier", "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80", "Home helper with hospitality background", 4.9, 140, true, true, "Lausanne", 46.519, 6.632],
  ["Leo", "Pittet", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80", "Reliable daily support and errands", 4.8, 118, true, false, "Lausanne", 46.526, 6.64],
  ["Nora", "Meyer", "https://images.unsplash.com/photo-1531123414780-f74242c2b052?auto=format&fit=crop&w=800&q=80", "Senior companion and escort support", 4.95, 162, true, true, "Renens", 46.54, 6.59],
  ["Adam", "Bovet", "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=800&q=80", "Certified dog walker", 4.7, 86, true, false, "Pully", 46.511, 6.66],
  ["Emma", "Vallotton", "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80", "Small home services expert", 4.76, 97, true, false, "Morges", 46.512, 6.498],
  ["Noah", "Keller", "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?auto=format&fit=crop&w=800&q=80", "Home and senior support", 4.82, 109, true, true, "Ecublens", 46.529, 6.56],
  ["Lina", "Fournier", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80", "Dog care and family errands", 4.74, 72, false, false, "Vevey", 46.463, 6.841],
  ["Eli", "Monnier", "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80", "Premium concierge-style support", 4.91, 131, true, true, "Nyon", 46.383, 6.239],
  ["Sara", "Girard", "https://images.unsplash.com/photo-1542204625-de293a04b8a6?auto=format&fit=crop&w=800&q=80", "Senior visits and mobility", 4.88, 123, true, false, "Yverdon", 46.778, 6.641],
  ["Tom", "Mauron", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80", "Handyman and daily help", 4.69, 80, true, false, "Lausanne", 46.517, 6.61],
] as const;

async function main() {
  await prisma.payment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.hotlineRequest.deleteMany();
  await prisma.callRequest.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.parkingListing.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.taskOnTag.deleteMany();
  await prisma.taskTag.deleteMany();
  await prisma.taskItem.deleteMany();
  await prisma.serviceSubcategory.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const categoryBySlug = new Map<string, string>();

  for (const category of categoriesData) {
    const createdCategory = await prisma.serviceCategory.create({
      data: {
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        fromPrice: category.fromPrice,
        description: category.description,
      },
    });

    categoryBySlug.set(category.slug, createdCategory.id);

    for (const sub of category.subcategories) {
      const createdSub = await prisma.serviceSubcategory.create({
        data: {
          categoryId: createdCategory.id,
          name: sub.name,
          slug: sub.slug,
        },
      });

      for (const task of sub.tasks) {
        const createdTask = await prisma.taskItem.create({
          data: {
            categoryId: createdCategory.id,
            subcategoryId: createdSub.id,
            title: task.title,
            slug: task.slug,
            mode: task.mode,
            isFreeRequest: false,
          },
        });

        for (const tagName of task.tags) {
          const tagSlug = tagName.toLowerCase().replace(/\s+/g, "-");
          const tag = await prisma.taskTag.upsert({
            where: { slug: tagSlug },
            update: {},
            create: { name: tagName, slug: tagSlug },
          });

          await prisma.taskOnTag.create({
            data: {
              taskId: createdTask.id,
              tagId: tag.id,
            },
          });
        }
      }
    }
  }

  const providers: { userId: string; profileId: string }[] = [];

  for (let i = 0; i < providerProfiles.length; i += 1) {
    const [firstName, lastName, avatarUrl, description, rating, completedMissions, isVerified, isTopProvider, city, lat, lng] = providerProfiles[i];

    const user = await prisma.user.create({
      data: {
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@nearyou.demo`,
        role: "PROVIDER",
      },
    });

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        avatarUrl,
        description,
        rating,
        completedMissions,
        isVerified,
        isTopProvider,
        city,
        lat,
        lng,
      },
    });

    providers.push({ userId: user.id, profileId: profile.id });
  }

  const requester = await prisma.user.create({
    data: {
      email: "guest.requester@nearyou.demo",
      role: "REQUESTER",
    },
  });

  const missionTemplates = [
    ["home-help", "Home help in 2h", "Fast support for chores and errands", 35, 1.2, true, "verified", 46.52, 6.63],
    ["senior-visit", "Senior visit with escort", "Companion visit and local transport", 29, 2.4, true, "top", 46.53, 6.59],
    ["dog-walking", "Dog walk this afternoon", "Trusted walk near your district", 22, 1.8, true, "verified", 46.51, 6.65],
    ["handyman", "Small home fixes", "Mounting and quick fixes", 39, 3.3, false, "verified", 46.5, 6.57],
    ["shopping", "Errands and pharmacy", "Same-day errands support", 25, 2.7, true, null, 46.49, 6.61],
    ["parking", "Private parking spot", "Near train station, secure access", 12, 0.9, true, "top", 46.522, 6.634],
  ] as const;

  const missions: { id: string; providerId: string }[] = [];

  for (let i = 0; i < 10; i += 1) {
    const template = missionTemplates[i % missionTemplates.length];
    const categoryId = categoryBySlug.get(template[0])!;
    const provider = providers[i];
    const mission = await prisma.mission.create({
      data: {
        providerId: provider.userId,
        categoryId,
        title: template[1],
        description: template[2],
        fromPrice: template[3],
        isAvailableToday: template[5],
        distanceKm: template[4],
        badge: template[6],
        lat: template[7] + i * 0.002,
        lng: template[8] + i * 0.002,
        calendarJson: JSON.stringify([
          "2026-04-21T08:00:00.000Z",
          "2026-04-21T14:00:00.000Z",
          "2026-04-22T09:00:00.000Z",
        ]),
      },
    });

    missions.push({ id: mission.id, providerId: provider.userId });
  }

  const parkingData = [
    ["Marc Rey", "City center day parking", "Avenue de Rumine 20", "Lausanne", 12, 16, 10, 24, false, 46.52, 6.635],
    ["Parking Morges Hub", "Night parking near station", "Rue de la Gare 8", "Morges", 14, 18, 12, 26, true, 46.512, 6.5],
    ["Anne Dubois", "Employee monthly slot", "Avenue de Cour 55", "Lausanne", 10, 14, 9, 20, false, 46.516, 6.64],
    ["Camper Spot Ouest", "Camper and van parking", "Chemin du Lac 4", "Renens", 15, 20, 13, 28, true, 46.54, 6.58],
    ["Pully Garden Parking", "Safe private parking", "Chemin des Pins 3", "Pully", 13, 17, 11, 25, true, 46.511, 6.66],
  ] as const;

  const parkingListings = [];
  for (const p of parkingData) {
    const parking = await prisma.parkingListing.create({
      data: {
        ownerName: p[0],
        title: p[1],
        address: p[2],
        city: p[3],
        dayPrice: p[4],
        nightPrice: p[5],
        employeePrice: p[6],
        campingPrice: p[7],
        hasPower: p[8],
        lat: p[9],
        lng: p[10],
      },
    });
    parkingListings.push(parking);
  }

  const partners = await Promise.all([
    prisma.partner.create({
      data: { name: "Cafe du Centre", type: "CAFE", address: "Rue Centrale 5", city: "Lausanne", lat: 46.521, lng: 6.632, commissionRate: 5 },
    }),
    prisma.partner.create({
      data: { name: "Cafe du Lac", type: "CAFE", address: "Quai Ouchy 3", city: "Lausanne", lat: 46.507, lng: 6.624, commissionRate: 5 },
    }),
    prisma.partner.create({
      data: { name: "Cafe Gare Morges", type: "CAFE", address: "Rue de la Gare 2", city: "Morges", lat: 46.511, lng: 6.498, commissionRate: 5 },
    }),
    prisma.partner.create({
      data: { name: "Pharma Express", type: "PHARMACY", address: "Rue du Simplon 9", city: "Lausanne", lat: 46.519, lng: 6.63, commissionRate: 5 },
    }),
    prisma.partner.create({
      data: { name: "Pharma Renens", type: "PHARMACY", address: "Avenue du 14 Avril 4", city: "Renens", lat: 46.538, lng: 6.59, commissionRate: 5 },
    }),
  ]);

  const booking1 = await prisma.booking.create({
    data: {
      requesterId: requester.id,
      missionId: missions[0].id,
      partnerId: partners[0].id,
      serviceType: "home-help",
      reservationSource: "partner_cafe",
      status: "confirmed",
      startAt: new Date("2026-04-22T08:00:00.000Z"),
      endAt: new Date("2026-04-22T10:00:00.000Z"),
      totalFromPrice: 70,
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      requesterId: requester.id,
      parkingListingId: parkingListings[0].id,
      serviceType: "parking",
      reservationSource: "app",
      status: "pending",
      startAt: new Date("2026-04-21T07:00:00.000Z"),
      endAt: new Date("2026-04-21T19:00:00.000Z"),
      totalFromPrice: 12,
    },
  });

  await prisma.payment.createMany({
    data: [
      {
        bookingId: booking1.id,
        amount: 70,
        method: "stripe_mock",
        status: "paid",
        providerReleaseAt: new Date("2026-04-23T12:00:00.000Z"),
      },
      {
        bookingId: booking2.id,
        amount: 12,
        method: "twint_mock",
        status: "pending",
      },
    ],
  });

  await prisma.review.createMany({
    data: [
      {
        bookingId: booking1.id,
        missionId: missions[0].id,
        reviewerId: requester.id,
        rating: 5,
        comment: "Very kind and on time.",
        isPublic: true,
        isModerated: true,
        publishedAt: new Date("2026-04-23T16:00:00.000Z"),
      },
    ],
  });

  await prisma.serviceRequest.createMany({
    data: [
      {
        userId: requester.id,
        categoryId: categoryBySlug.get("home-help"),
        address: "Rue du Valentin 10",
        city: "Lausanne",
        mode: "instant",
        reservationSource: "app",
        freeText: "Need help this afternoon",
      },
      {
        userId: requester.id,
        categoryId: categoryBySlug.get("parking"),
        partnerId: partners[0].id,
        address: "Rue de Geneve 1",
        city: "Lausanne",
        mode: "planned",
        reservationSource: "partner_cafe",
        freeText: "Looking for van parking with power",
      },
    ],
  });

  await prisma.hotlineRequest.createMany({
    data: [
      {
        firstName: "Claire",
        lastName: "Muller",
        phone: "+41791234567",
        city: "Lausanne",
        serviceType: "Visit a loved one",
        preferredTime: "morning",
        notes: "Call daughter if needed",
        source: "web",
      },
      {
        firstName: "Daniel",
        lastName: "Roux",
        phone: "+41795558877",
        city: "Morges",
        serviceType: "Parking",
        preferredTime: "afternoon",
        notes: "Needs camping spot",
        source: "partner_cafe",
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
