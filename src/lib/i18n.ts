export const supportedLanguages = ["fr", "en", "it", "de"] as const;

export type Language = (typeof supportedLanguages)[number];

type Messages = {
  navbar: {
    home: string;
    catalogue: string;
    phoneHelp: string;
    admin: string;
    bookNow: string;
    find: string;
    account: string;
  };
  footer: {
    tagline: string;
    protection: string;
  };
  home: {
    badge: string;
    title: string;
    subtitle: string;
    actions: [string, string, string, string];
    pricingTitle: string;
    seniorTitle: string;
    seniorText: string;
    seniorCta1: string;
    seniorCta2: string;
    voucher: string;
    voucherText: string;
    partnersTitle: string;
    partnersText: string;
  };
  search: {
    service: string;
    address: string;
    date: string;
    search: string;
    useLocation: string;
    geolocationUnsupported: string;
    locationCaptured: string;
    locationDenied: string;
  };
  map: {
    radius: string;
    maxPrice: string;
    category: string;
    allCategories: string;
    search: string;
    nameOrService: string;
    todayOnly: string;
    anyAvailability: string;
    mapLegend: string;
    availableToday: string;
    missions: string;
    km: string;
    from: string;
    bookNow: string;
    viewProfile: string;
    noMatch: string;
  };
  catalogue: {
    title: string;
    subtitle: string;
    tags: string;
    from: string;
    cannotFind: string;
    cannotFindText: string;
    freeRequest: string;
  };
  hotline: {
    title: string;
    subtitle: string;
    step1: string;
    step2: string;
    step3: string;
    callbackSuccess: string;
    callbackError: string;
    requestCallback: string;
    sending: string;
    consent: string;
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    serviceType: string;
    contactModePhone: string;
    contactModeWhatsapp: string;
    details: string;
  };
};

export const messages: Record<Language, Messages> = {
  en: {
    navbar: { home: "Home", catalogue: "Catalogue", phoneHelp: "Phone help", admin: "Admin", bookNow: "Book now", find: "Find", account: "Account" },
    footer: { tagline: "PrèsDeToi - Local help in seconds.", protection: "Payment and support protection is only guaranteed through the platform." },
    home: {
      badge: "Fast local marketplace - Switzerland",
      title: "What do you need today?",
      subtitle: "Find trusted help near you in seconds. Simple like Uber, reliable like Booking, human by design.",
      actions: ["Help at home", "Visit a loved one", "Dog walking", "Parking"],
      pricingTitle: "Visible from-pricing",
      seniorTitle: "Senior support and family booking",
      seniorText: "Book for your loved one, request phone support, and keep the process simple with large clear actions.",
      seniorCta1: "Call support and book",
      seniorCta2: "See senior tasks",
      voucher: "Voucher",
      voucherText: "First booking welcome voucher.",
      partnersTitle: "Partner cafes and pharmacies",
      partnersText: "Can assist with booking. No direct cash collection.",
    },
    search: {
      service: "Service",
      address: "Address",
      date: "Date",
      search: "Search now",
      useLocation: "Use my location",
      geolocationUnsupported: "Geolocation is not supported on this browser.",
      locationCaptured: "Location captured",
      locationDenied: "Unable to access location. You can still search by address.",
    },
    map: {
      radius: "Radius (km)", maxPrice: "Max from price", category: "Category", allCategories: "All categories", search: "Search",
      nameOrService: "Name or service", todayOnly: "Today only", anyAvailability: "Any availability",
      mapLegend: "Map view: providers, parking, cafe/pharmacy partners", availableToday: "Available today", missions: "missions",
      km: "km", from: "from", bookNow: "Book now", viewProfile: "View profile", noMatch: "No provider matches your filters. Try expanding radius or budget.",
    },
    catalogue: {
      title: "Task catalogue", subtitle: "Categories, sub-categories, tasks and tags with instant / planned / recurring modes.",
      tags: "Tags", from: "from", cannotFind: "Cannot find your task?", cannotFindText: "Send a free request and we suggest close alternatives automatically.", freeRequest: "Create free request",
    },
    hotline: {
      title: "Need help by phone?",
      subtitle: "Call +41 21 555 00 00 or request a callback. Large buttons, simple steps, human support.",
      step1: "1. Tell us your need", step2: "2. We call you back", step3: "3. We confirm your reservation",
      callbackSuccess: "Thanks. Our team will call you back shortly.", callbackError: "Could not submit right now. Please try again.",
      requestCallback: "Request a callback", sending: "Sending...", consent: "I agree to be contacted about this request.",
      firstName: "First name", lastName: "Last name", phone: "Phone", city: "City", serviceType: "Service type",
      contactModePhone: "Phone call", contactModeWhatsapp: "WhatsApp", details: "Any details",
    },
  },
  fr: {
    navbar: { home: "Accueil", catalogue: "Catalogue", phoneHelp: "Aide téléphone", admin: "Admin", bookNow: "Réserver", find: "Trouver", account: "Compte" },
    footer: { tagline: "PrèsDeToi - Services locaux premium en Suisse.", protection: "PrèsDeToi agit comme plateforme d'intermédiation. Les prestataires restent juridiquement indépendants." },
    home: {
      badge: "Plateforme locale premium - Suisse",
      title: "Réservez un service près de chez vous en quelques minutes",
      subtitle: "Ménage, beauté, massage, jardin, bricolage et bien plus, avec des prestataires vérifiés.",
      actions: ["Aide à domicile", "Beauté", "Bricolage", "Transport"],
      pricingTitle: "Tarifs indicatifs des",
      seniorTitle: "Un parcours pensé pour les familles et les seniors",
      seniorText: "Demande de rappel, aide téléphone et réservation guidée pour aller vite sans stress.",
      seniorCta1: "Demander un rappel",
      seniorCta2: "Voir les services",
      voucher: "Offre lancement",
      voucherText: "Réduction de bienvenue sur votre première demande validée.",
      partnersTitle: "Ancrage local suisse",
      partnersText: "Réseau de partenaires de proximité et opération pilote en Suisse romande.",
    },
    search: {
      service: "Service", address: "Adresse", date: "Date", search: "Rechercher", useLocation: "Utiliser ma position",
      geolocationUnsupported: "La géolocalisation n'est pas supportée sur ce navigateur.", locationCaptured: "Position capturée", locationDenied: "Impossible d'accéder à la position.",
    },
    map: {
      radius: "Rayon (km)", maxPrice: "Prix max dès", category: "Catégorie", allCategories: "Toutes les catégories", search: "Recherche",
      nameOrService: "Nom ou service", todayOnly: "Disponible aujourd'hui", anyAvailability: "Toute dispo",
      mapLegend: "Carte : prestataires et partenaires locaux", availableToday: "Disponible aujourd'hui", missions: "missions",
      km: "km", from: "dès", bookNow: "Réserver", viewProfile: "Voir le profil", noMatch: "Aucun prestataire ne correspond à vos filtres. Essayez d'élargir votre recherche.",
    },
    catalogue: {
      title: "Catalogue de tâches", subtitle: "Catégories, sous-catégories, tâches et tags (instantané / planifié / récurrent).",
      tags: "Tags", from: "dès", cannotFind: "Vous ne trouvez pas votre tâche ?", cannotFindText: "Envoyez une demande libre et nous suggérons des tâches proches.", freeRequest: "Créer une demande libre",
    },
    hotline: {
      title: "Besoin d'aide par téléphone ?",
      subtitle: "Appelez le +41 21 555 00 00 ou demandez un rappel.",
      step1: "1. Expliquez votre besoin", step2: "2. Nous vous rappelons", step3: "3. Nous confirmons votre réservation",
      callbackSuccess: "Merci. Notre équipe vous rappelle rapidement.", callbackError: "Envoi impossible pour le moment.",
      requestCallback: "Demander un rappel", sending: "Envoi...", consent: "J'accepte d'être contacté pour cette demande.",
      firstName: "Prénom", lastName: "Nom", phone: "Téléphone", city: "Ville", serviceType: "Type de service",
      contactModePhone: "Appel", contactModeWhatsapp: "WhatsApp", details: "Détails",
    },
  },
  it: {
    navbar: { home: "Home", catalogue: "Catalogo", phoneHelp: "Aiuto telefono", admin: "Admin", bookNow: "Prenota", find: "Trova", account: "Account" },
    footer: { tagline: "PrèsDeToi - Aiuto locale in pochi secondi.", protection: "Pagamento e supporto garantiti solo tramite piattaforma." },
    home: {
      badge: "Marketplace locale veloce - Svizzera", title: "Di cosa hai bisogno oggi?", subtitle: "Trova aiuto affidabile vicino a te in pochi secondi.",
      actions: ["Aiuto a domicilio", "Visita senior", "Passeggiata cane", "Parcheggio"],
      pricingTitle: "Prezzi visibili da", seniorTitle: "Supporto senior e prenotazione per familiari", seniorText: "Prenota per una persona cara con un percorso semplice.",
      seniorCta1: "Chiama e prenota", seniorCta2: "Vedi servizi senior", voucher: "Voucher", voucherText: "10% sulla prima prenotazione.",
      partnersTitle: "Caffè e farmacie partner", partnersText: "Possono aiutare con la prenotazione. Nessun incasso diretto.",
    },
    search: {
      service: "Servizio", address: "Indirizzo", date: "Data", search: "Cerca", useLocation: "Usa la mia posizione",
      geolocationUnsupported: "Geolocalizzazione non supportata.", locationCaptured: "Posizione acquisita", locationDenied: "Impossibile accedere alla posizione.",
    },
    map: {
      radius: "Raggio (km)", maxPrice: "Prezzo max da", category: "Categoria", allCategories: "Tutte", search: "Ricerca", nameOrService: "Nome o servizio",
      todayOnly: "Solo oggi", anyAvailability: "Qualsiasi disponibilità", mapLegend: "Mappa: fornitori, parcheggi, partner", availableToday: "Disponibile oggi",
      missions: "missioni", km: "km", from: "da", bookNow: "Prenota", viewProfile: "Vedi profilo", noMatch: "Nessun risultato con questi filtri.",
    },
    catalogue: {
      title: "Catalogo attività", subtitle: "Categorie, sotto-categorie, attività e tag (istantaneo / pianificato / ricorrente).",
      tags: "Tag", from: "da", cannotFind: "Non trovi la tua attività?", cannotFindText: "Invia una richiesta libera e suggeriamo alternative vicine.", freeRequest: "Crea richiesta libera",
    },
    hotline: {
      title: "Hai bisogno di aiuto telefonico?", subtitle: "Chiama +41 21 555 00 00 o richiedi richiamata.",
      step1: "1. Spiega il bisogno", step2: "2. Ti richiamiamo", step3: "3. Confermiamo la prenotazione",
      callbackSuccess: "Grazie. Ti richiamiamo presto.", callbackError: "Invio non riuscito.", requestCallback: "Richiedi richiamata", sending: "Invio...",
      consent: "Accetto di essere contattato per questa richiesta.", firstName: "Nome", lastName: "Cognome", phone: "Telefono", city: "Città", serviceType: "Tipo servizio",
      contactModePhone: "Telefonata", contactModeWhatsapp: "WhatsApp", details: "Dettagli",
    },
  },
  de: {
    navbar: { home: "Start", catalogue: "Katalog", phoneHelp: "Telefonhilfe", admin: "Admin", bookNow: "Buchen", find: "Finden", account: "Konto" },
    footer: { tagline: "PrèsDeToi - Lokale Hilfe in Sekunden.", protection: "Zahlung und Support sind nur über die Plattform garantiert." },
    home: {
      badge: "Schneller lokaler Marktplatz - Schweiz", title: "Was brauchen Sie heute?", subtitle: "Finden Sie vertrauenswürdige Hilfe in Ihrer Nähe in Sekunden.",
      actions: ["Hilfe zu Hause", "Seniorenbesuch", "Hundespaziergang", "Parken"],
      pricingTitle: "Sichtbare Preise ab", seniorTitle: "Seniorenhilfe und Buchung für Angehörige", seniorText: "Für Angehörige buchen, Telefonhilfe anfragen, einfacher Ablauf.",
      seniorCta1: "Anrufen und buchen", seniorCta2: "Senioren-Aufgaben ansehen", voucher: "Gutschein", voucherText: "10% auf die erste Buchung.",
      partnersTitle: "Partner-Cafés und Apotheken", partnersText: "Unterstützen bei Buchung. Keine direkte Barzahlung.",
    },
    search: {
      service: "Service", address: "Adresse", date: "Datum", search: "Suchen", useLocation: "Meinen Standort nutzen",
      geolocationUnsupported: "Geolokalisierung wird nicht unterstützt.", locationCaptured: "Standort erfasst", locationDenied: "Standortzugriff nicht möglich.",
    },
    map: {
      radius: "Radius (km)", maxPrice: "Maximalpreis ab", category: "Kategorie", allCategories: "Alle Kategorien", search: "Suche", nameOrService: "Name oder Service",
      todayOnly: "Nur heute", anyAvailability: "Jede Verfügbarkeit", mapLegend: "Karte: Anbieter, Parkplätze, Partner", availableToday: "Heute verfügbar",
      missions: "Einsätze", km: "km", from: "ab", bookNow: "Buchen", viewProfile: "Profil ansehen", noMatch: "Keine Anbieter für diese Filter.",
    },
    catalogue: {
      title: "Aufgabenkatalog", subtitle: "Kategorien, Unterkategorien, Aufgaben und Tags (sofort / geplant / wiederkehrend).",
      tags: "Tags", from: "ab", cannotFind: "Aufgabe nicht gefunden?", cannotFindText: "Freie Anfrage senden und ähnliche Vorschläge erhalten.", freeRequest: "Freie Anfrage erstellen",
    },
    hotline: {
      title: "Brauchen Sie telefonische Hilfe?", subtitle: "Rufen Sie +41 21 555 00 00 an oder fordern Sie einen Rückruf an.",
      step1: "1. Bedarf schildern", step2: "2. Wir rufen zurück", step3: "3. Reservierung bestätigen",
      callbackSuccess: "Danke. Unser Team ruft Sie bald zurück.", callbackError: "Senden fehlgeschlagen.", requestCallback: "Rückruf anfordern", sending: "Senden...",
      consent: "Ich stimme zu, für diese Anfrage kontaktiert zu werden.", firstName: "Vorname", lastName: "Nachname", phone: "Telefon", city: "Stadt", serviceType: "Serviceart",
      contactModePhone: "Anruf", contactModeWhatsapp: "WhatsApp", details: "Details",
    },
  },
};

export function normalizeLanguage(value: string | undefined): Language {
  if (!value) return "fr";
  return supportedLanguages.includes(value as Language) ? (value as Language) : "fr";
}




