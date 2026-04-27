import { CreditCard, ShieldCheck, Star, UserCheck, UsersRound } from "lucide-react";

import { Card } from "@/components/ui/card";

const ITEMS = [
  { label: "Prestataires vérifiés manuellement", icon: UserCheck },
  { label: "Avis clients modérés", icon: Star },
  { label: "Paiement sécurisé", icon: CreditCard },
  { label: "Support humain", icon: UsersRound },
  { label: "Services locaux en Suisse", icon: ShieldCheck },
] as const;

export function TrustBadges() {
  return (
    <Card className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Réservez en confiance</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {ITEMS.map((item) => (
          <div key={item.label} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <item.icon className="h-4 w-4 text-blue-700" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
