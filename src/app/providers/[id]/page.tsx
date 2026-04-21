import { notFound } from "next/navigation";
import Image from "next/image";

import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
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
        <Card className="rounded-2xl border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Image src={profile.avatarUrl} alt={`${profile.firstName} ${profile.lastName}`} width={112} height={112} className="h-28 w-28 rounded-2xl object-cover" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{profile.firstName} {profile.lastName}</h1>
              <p className="text-slate-600">{profile.description}</p>
              <p className="mt-1 text-sm text-slate-500">Rating {profile.rating.toFixed(1)} • {profile.completedMissions} missions • {profile.city}</p>
              <div className="mt-2 flex gap-2">
                {profile.isVerified ? <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Verified</Badge> : null}
                {profile.isTopProvider ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Top provider</Badge> : null}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {provider.missions.map((mission) => (
            <Card key={mission.id} className="rounded-2xl border-slate-200 bg-white p-4">
              <h2 className="text-lg font-semibold text-slate-900">{mission.title}</h2>
              <p className="text-sm text-slate-600">{mission.description}</p>
              <p className="mt-2 text-sm text-green-700">from {mission.fromPrice} CHF</p>
              <p className="text-xs text-slate-500">Category: {mission.category.name}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
