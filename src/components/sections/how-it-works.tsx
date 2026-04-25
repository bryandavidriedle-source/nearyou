import { SearchCheck, ShieldCheck, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";

const steps = [
  {
    title: "Décrivez votre besoin",
    description: "Expliquez simplement ce que vous cherchez et votre zone.",
    icon: Sparkles,
  },
  {
    title: "Comparez les prestataires fiables",
    description: "Regardez les notes, prix et disponibilités en un coup d'oeil.",
    icon: SearchCheck,
  },
  {
    title: "Réservez simplement",
    description: "Choisissez votre créneau et validez rapidement.",
    icon: ShieldCheck,
  },
] as const;

export function HowItWorks() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {steps.map((step, index) => {
        const Icon = step.icon;

        return (
          <Card key={step.title} className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Étape {index + 1}</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{step.title}</p>
            <p className="mt-1 text-sm text-slate-600">{step.description}</p>
          </Card>
        );
      })}
    </div>
  );
}
