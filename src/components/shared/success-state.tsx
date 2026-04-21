import Link from "next/link";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SuccessStateProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function SuccessState({
  title,
  description,
  ctaLabel = "Retour à l'accueil",
  ctaHref = "/",
}: SuccessStateProps) {
  return (
    <Card className="border-emerald-200 bg-emerald-50/70 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-emerald-800">
          <CheckCircle2 className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-emerald-900/90">{description}</p>
        <Button asChild variant="secondary" className="bg-white text-emerald-900 hover:bg-emerald-100">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

