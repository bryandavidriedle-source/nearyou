export type NavigationRole = "guest" | "client" | "provider" | "admin";

export type NavigationItem = {
  href: string;
  label: string;
};

export function resolveNavigationRole({
  isAuthenticated,
  dashboardPath,
}: {
  isAuthenticated: boolean;
  dashboardPath: string | null;
}): NavigationRole {
  if (!isAuthenticated) return "guest";
  if (dashboardPath?.startsWith("/admin") || dashboardPath?.startsWith("/backoffice")) return "admin";
  if (dashboardPath?.startsWith("/espace-prestataire")) return "provider";
  return "client";
}

export function getDesktopPrimaryNav(role: NavigationRole): NavigationItem[] {
  if (role === "admin") {
    return [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/prestataires", label: "Prestataires" },
      { href: "/admin/clients", label: "Clients" },
      { href: "/admin/demandes", label: "Demandes" },
      { href: "/admin/avis", label: "Avis" },
    ];
  }

  if (role === "provider") {
    return [
      { href: "/espace-prestataire", label: "Dashboard" },
      { href: "/espace-prestataire/demandes", label: "Mes missions" },
      { href: "/espace-prestataire/disponibilites", label: "Disponibilités" },
      { href: "/espace-prestataire/paiements", label: "Paiements" },
      { href: "/espace-prestataire/profil", label: "Mon profil" },
    ];
  }

  if (role === "client") {
    return [
      { href: "/services", label: "Services" },
      { href: "/search", label: "Prestataires" },
      { href: "/comment-ca-marche", label: "Comment ça marche" },
      { href: "/devenir-prestataire", label: "Devenir prestataire" },
    ];
  }

  return [
    { href: "/services", label: "Services" },
    { href: "/search", label: "Prestataires" },
    { href: "/comment-ca-marche", label: "Comment ça marche" },
    { href: "/devenir-prestataire", label: "Devenir prestataire" },
  ];
}

export function getMobileNav(role: NavigationRole): NavigationItem[] {
  if (role === "admin") {
    return [
      { href: "/admin", label: "Accueil" },
      { href: "/admin/demandes", label: "Demandes" },
      { href: "/admin/prestataires", label: "Prestataires" },
      { href: "/admin", label: "Profil" },
    ];
  }

  if (role === "provider") {
    return [
      { href: "/espace-prestataire", label: "Accueil" },
      { href: "/search", label: "Rechercher" },
      { href: "/espace-prestataire/demandes", label: "Réservations" },
      { href: "/espace-prestataire/profil", label: "Profil" },
    ];
  }

  if (role === "client") {
    return [
      { href: "/", label: "Accueil" },
      { href: "/search", label: "Rechercher" },
      { href: "/espace-client/prestations", label: "Réservations" },
      { href: "/espace-client", label: "Profil" },
    ];
  }

  return [
    { href: "/", label: "Accueil" },
    { href: "/search", label: "Rechercher" },
    { href: "/reserve", label: "Réservations" },
    { href: "/connexion", label: "Profil" },
  ];
}
