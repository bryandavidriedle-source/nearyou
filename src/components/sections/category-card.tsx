import Link from "next/link";
import Image from "next/image";

import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryThemeMedia } from "@/lib/theme-media";

type CategoryCardProps = {
  slug: string;
  label: string;
  description: string;
};

export function CategoryCard({ slug, label, description }: CategoryCardProps) {
  const media = categoryThemeMedia[slug];

  return (
    <Card className="h-full rounded-2xl border-border/70 bg-white/90 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      {media ? (
        <div className="relative overflow-hidden rounded-t-2xl border-b border-border/70 bg-muted/30">
          <Image
            src={media.src}
            alt={media.alt}
            width={320}
            height={200}
            className="h-36 w-full object-cover"
          />
        </div>
      ) : null}
      <CardHeader>
        <CardTitle className="text-lg">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <Link
          href={`/trouver-un-prestataire?categorie=${encodeURIComponent(label)}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          Demander ce service
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}

