import { Clock3, Handshake, Send } from "lucide-react";

import { FadeIn } from "@/components/shared/fade-in";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { howItWorksSteps } from "@/lib/constants";

const icons = [Send, Clock3, Handshake];

export function HowItWorks() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {howItWorksSteps.map((step, index) => {
        const Icon = icons[index];

        return (
          <FadeIn key={step.title} delay={index * 0.06}>
            <Card className="h-full rounded-2xl border-border/80 bg-card/85 shadow-sm">
              <CardHeader>
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          </FadeIn>
        );
      })}
    </div>
  );
}

