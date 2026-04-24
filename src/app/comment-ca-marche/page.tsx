import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Card } from "@/components/ui/card";
import { howItWorksSteps } from "@/lib/constants";

export default function HowItWorksPage() {
  return (
    <section className="py-12">
      <Container className="max-w-4xl space-y-5">
        <h1 className="text-3xl font-bold text-slate-900">Comment Ã§a marche</h1>
        <p className="text-sm text-slate-600">
          PrèsDeToi facilite la mise en relation locale en Suisse avec validation manuelle des prestataires.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {howItWorksSteps.map((step, index) => (
            <Card key={step.title} className="premium-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Ã‰tape {index + 1}</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{step.title}</h2>
              <p className="mt-2 text-sm text-slate-700">{step.description}</p>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/trouver-un-prestataire" className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
            Faire une demande
          </Link>
          <Link href="/devenir-prestataire" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Devenir prestataire
          </Link>
        </div>
      </Container>
    </section>
  );
}

