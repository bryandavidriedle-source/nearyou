import Image from "next/image";
import Link from "next/link";

import { MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ProviderCardProps = {
  id: string;
  name: string;
  avatarUrl: string;
  city: string;
  distanceKm?: number | null;
  rating: number;
  reviewCount?: number;
  fromPrice: number;
  isAvailableNow?: boolean;
  isVerified?: boolean;
  badges?: string[];
  categories?: string[];
  profileUrl?: string;
  bookingUrl?: string;
  className?: string;
};

export function ProviderCard({
  id,
  name,
  avatarUrl,
  city,
  distanceKm = null,
  rating,
  reviewCount = 0,
  fromPrice,
  isAvailableNow = false,
  isVerified = true,
  badges = [],
  categories = [],
  profileUrl,
  bookingUrl,
  className,
}: ProviderCardProps) {
  const safeProfileUrl = profileUrl ?? `/providers/${id}`;
  const safeBookingUrl = bookingUrl ?? `/reserve/${id}`;

  return (
    <Card className={`premium-card space-y-3 rounded-2xl p-4 ${className ?? ""}`}>
      <div className="flex gap-3">
        <Image src={avatarUrl} alt={name} width={72} height={72} className="h-18 w-18 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-slate-900">{name}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-600">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {rating > 0 ? rating.toFixed(1) : "Nouveau"} - {Math.max(0, reviewCount)} avis
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-600">
            <MapPin className="h-4 w-4 text-slate-400" />
            {city}
            {typeof distanceKm === "number" ? ` - ${distanceKm} km` : ""}
          </p>
          <p className="mt-1 text-sm font-semibold text-green-700">Dès CHF {fromPrice}/h</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {isVerified ? <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Vérifié</Badge> : null}
        {isAvailableNow ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Disponible aujourd'hui</Badge> : null}
        {badges.slice(0, 3).map((badge) => (
          <Badge key={`${id}-${badge}`} variant="secondary">
            {badge}
          </Badge>
        ))}
        {categories.slice(0, 2).map((category) => (
          <Badge key={`${id}-${category}`} variant="outline">
            {category}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button asChild className="rounded-xl bg-green-600 hover:bg-green-700">
          <Link href={safeBookingUrl}>Réserver</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50">
          <Link href={safeProfileUrl}>Voir profil</Link>
        </Button>
      </div>
    </Card>
  );
}
