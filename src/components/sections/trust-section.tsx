import { ShieldCheck, Sparkles, UsersRound } from "lucide-react";

import { FadeIn } from "@/components/shared/fade-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const trustItems = [
  {
    title: "Sélection locale",
    description:
      "Nous concentrons la phase test à Lausanne pour un suivi précis de chaque demande.",
    icon: UsersRound,
  },
  {
    title: "Relation humaine",
    description:
      "Chaque demande est relue avant mise en relation pour garder une expérience simple et rassurante.",
    icon: Sparkles,
  },
  {
    title: "Confidentialité claire",
    description:
      "Vos données sont utilisées uniquement pour la mise en relation et protégées par des règles strictes.",
    icon: ShieldCheck,
  },
] as const;

export function TrustSection() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {trustItems.map((item, index) => (
        <FadeIn key={item.title} delay={index * 0.05}>
          <Card className="h-full rounded-2xl border-border/80 bg-secondary/40">
            <CardHeader>
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        </FadeIn>
      ))}
    </div>
  );
}

