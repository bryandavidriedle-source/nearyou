import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

export default function ReserveIndexPage() {
  return (
    <section className="py-12">
      <Container className="max-w-3xl space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">Quick booking</h1>
        <p className="text-slate-600">Pick a provider from the homepage map and continue with one-click style booking.</p>
        <Button asChild className="rounded-xl bg-green-600 hover:bg-green-700">
          <Link href="/">Back to map and providers</Link>
        </Button>
      </Container>
    </section>
  );
}
