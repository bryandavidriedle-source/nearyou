import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Card } from "@/components/ui/card";

export default function AccessDeniedPage() {
  return (
    <section className="py-12">
      <Container className="max-w-2xl">
        <Card className="premium-card space-y-3 p-6 text-sm text-slate-700">
          <h1 className="text-2xl font-bold text-slate-900">Acces refuse</h1>
          <p>Votre session est active mais vous ne disposez pas des autorisations necessaires pour cette page.</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/espace-client" className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50">
              Aller a mon espace
            </Link>
            <Link href="/" className="rounded-xl bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800">
              Retour accueil
            </Link>
          </div>
        </Card>
      </Container>
    </section>
  );
}
