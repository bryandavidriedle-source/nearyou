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
      { href: "/", label: "Accueil" },
      { href: "/espace-client", label: "Mes demandes" },
      { href: "/services", label: "Services" },
      { href: "/espace-client", label: "Mon compte" },
    ];
  }

  return [
    { href: "/", label: "Accueil" },
    { href: "/services", label: "Services" },
    { href: "/trouver-un-prestataire", label: "Trouver un prestataire" },
    { href: "/devenir-prestataire", label: "Devenir prestataire" },
  ];
}

export function getMobileNav(role: NavigationRole): NavigationItem[] {
  if (role === "admin") {
    return [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/prestataires", label: "Prestataires" },
      { href: "/admin/clients", label: "Clients" },
      { href: "/admin/demandes", label: "Demandes" },
    ];
  }

  if (role === "provider") {
    return [
      { href: "/espace-prestataire", label: "Dashboard" },
      { href: "/espace-prestataire/demandes", label: "Missions" },
      { href: "/espace-prestataire/disponibilites", label: "Dispo" },
      { href: "/espace-prestataire/paiements", label: "Paiements" },
    ];
  }

  if (role === "client") {
    return [
      { href: "/", label: "Accueil" },
      { href: "/espace-client", label: "Demandes" },
      { href: "/services", label: "Services" },
      { href: "/espace-client", label: "Compte" },
    ];
  }

  return [
    { href: "/", label: "Accueil" },
    { href: "/services", label: "Services" },
    { href: "/trouver-un-prestataire", label: "Trouver" },
    { href: "/connexion", label: "Connexion" },
  ];
}
