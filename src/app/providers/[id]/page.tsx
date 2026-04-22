import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getProviderProfile } from "@/lib/db";

export default async function ProviderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = await getProviderProfile(id);

  if (!provider || !provider.profile) {
    notFound();
  }

  const profile = provider.profile;

  return (
    <section className="py-12">
      <Container className="max-w-4xl space-y-6">
        <Card className="section-shell p-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Image src={profile.avatarUrl} alt={`${profile.firstName} ${profile.lastName}`} width={112} height={112} className="h-28 w-28 rounded-2xl object-cover" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{profile.firstName} {profile.lastName}</h1>
              <p className="text-slate-600">{profile.description}</p>
              <p className="mt-1 text-sm text-slate-500">
                Note {profile.rating > 0 ? profile.rating.toFixed(1) : "Nouveau"} - {profile.completedMissions} missions - {profile.city}
              </p>
              <div className="mt-2 flex gap-2">
                {profile.isVerified ? <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Profil vérifié</Badge> : null}
                {profile.isTopProvider ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Top prestataire</Badge> : null}
              </div>
              <Button asChild className="mt-4 rounded-xl bg-green-600 hover:bg-green-700">
                <Link href={`/reserve/${provider.id}`}>Réserver avec ce prestataire</Link>
              </Button>
            </div>
          </div>
        </Card>

        {provider.missions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {provider.missions.map((mission) => (
              <Card key={mission.id} className="premium-card p-4">
                <h2 className="text-lg font-semibold text-slate-900">{mission.title}</h2>
                <p className="text-sm text-slate-600">{mission.description}</p>
                <p className="mt-2 text-sm text-green-700">dès {mission.fromPrice} CHF</p>
                <p className="text-xs text-slate-500">Catégorie: {mission.category.name}</p>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
            Les services détaillés de ce prestataire seront publiés prochainement.
          </Card>
        )}
      </Container>

      <div className="fixed inset-x-0 bottom-20 z-40 px-4 md:hidden">
        <Button asChild className="h-12 w-full rounded-xl bg-green-600 text-base hover:bg-green-700">
          <Link href={`/reserve/${provider.id}`}>Réserver avec ce prestataire</Link>
        </Button>
      </div>
    </section>
  );
}
