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
      { href: "/backoffice", label: "Dashboard" },
      { href: "/backoffice/prestataires", label: "Prestataires" },
      { href: "/backoffice/utilisateurs", label: "Clients" },
      { href: "/backoffice/demandes", label: "Demandes" },
      { href: "/backoffice/avis", label: "Avis" },
    ];
  }

  if (role === "provider") {
    return [
      { href: "/espace-prestataire", label: "Dashboard" },
      { href: "/espace-prestataire/demandes", label: "Mes missions" },
      { href: "/espace-prestataire/disponibilites", label: "Disponibilites" },
      { href: "/espace-prestataire/paiements", label: "Paiements" },
      { href: "/espace-prestataire/profil", label: "Mon profil" },
    ];
  }

  if (role === "client") {
    return [
      { href: "/", label: "Accueil" },
      { href: "/espace-client", label: "Mes demandes" },
      { href: "/trouver-un-prestataire", label: "Trouver un prestataire" },
      { href: "/espace-client", label: "Mon compte" },
    ];
  }

  return [
    { href: "/", label: "Accueil" },
    { href: "/trouver-un-prestataire", label: "Trouver un prestataire" },
    { href: "/devenir-prestataire", label: "Devenir prestataire" },
    { href: "/hotline", label: "Aide telephone" },
  ];
}

export function getMobileNav(role: NavigationRole): NavigationItem[] {
  if (role === "admin") {
    return [
      { href: "/backoffice", label: "Dashboard" },
      { href: "/backoffice/prestataires", label: "Prestataires" },
      { href: "/backoffice/utilisateurs", label: "Clients" },
      { href: "/backoffice/demandes", label: "Demandes" },
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
      { href: "/trouver-un-prestataire", label: "Trouver" },
      { href: "/espace-client", label: "Compte" },
    ];
  }

  return [
    { href: "/", label: "Accueil" },
    { href: "/catalogue", label: "Catalogue" },
    { href: "/trouver-un-prestataire", label: "Trouver" },
    { href: "/connexion", label: "Connexion" },
  ];
}
