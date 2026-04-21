export type ThemeMedia = {
  src: string;
  alt: string;
};

export const categoryThemeMedia: Record<string, ThemeMedia> = {
  menage: {
    src: "/images/themes/menage.svg",
    alt: "Illustration neutre menage",
  },
  jardinage: {
    src: "/images/themes/jardinage.svg",
    alt: "Illustration neutre jardinage",
  },
  peinture: {
    src: "/images/themes/peinture.svg",
    alt: "Illustration neutre peinture",
  },
  "petits-travaux": {
    src: "/images/themes/travaux.svg",
    alt: "Illustration neutre petits travaux",
  },
  "aide-demenagement": {
    src: "/images/themes/demenagement.svg",
    alt: "Illustration neutre aide au demenagement",
  },
  "montage-meubles": {
    src: "/images/themes/meubles.svg",
    alt: "Illustration neutre montage meubles",
  },
  "nettoyage-vehicule": {
    src: "/images/themes/vehicule.svg",
    alt: "Illustration neutre nettoyage vehicule",
  },
};

export const hotlineThemeMedia: ThemeMedia[] = [
  {
    src: "/images/themes/hotline.svg",
    alt: "Illustration neutre assistance telephonique",
  },
  {
    src: "/images/themes/senior.svg",
    alt: "Illustration neutre visite personne agee",
  },
  {
    src: "/images/themes/parking.svg",
    alt: "Illustration neutre parking van et camping",
  },
];
