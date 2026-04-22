import { Card } from "@/components/ui/card";
import { requireProviderAccess } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function ProviderReviewsPage() {
  const auth = await requireProviderAccess();
  const supabase = getSupabaseAdminClient();

  const { data: provider } = await supabase
    .from("providers")
    .select("id, display_name")
    .eq("profile_id", auth.user.id)
    .maybeSingle();

  const reviewsRes = provider
    ? await supabase
        .from("reviews")
        .select("id, rating, comment, is_public, is_moderated, created_at")
        .eq("provider_id", provider.id)
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] as Array<{ id: string; rating: number; comment: string | null; is_public: boolean; is_moderated: boolean; created_at: string }> };

  const reviews = reviewsRes.data ?? [];
  const avg = reviews.length > 0 ? reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length : 0;

  return (
    <div className="space-y-4">
      <Card className="premium-card p-4">
        <p className="text-sm text-slate-500">Moyenne des avis</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">{avg > 0 ? avg.toFixed(1) : "-"}</p>
      </Card>
      <Card className="premium-card p-5">
        <h2 className="text-lg font-semibold text-slate-900">Avis recus</h2>
        <div className="mt-3 space-y-2">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">{review.rating}/5</p>
              <p>{review.comment ?? "Sans commentaire"}</p>
              <p className="text-xs text-slate-500">
                {new Date(review.created_at).toLocaleString("fr-CH")} - {review.is_public ? "Public" : "Masque"}
              </p>
            </div>
          ))}
          {reviews.length === 0 ? <p className="text-sm text-slate-500">Aucun avis pour le moment.</p> : null}
        </div>
      </Card>
    </div>
  );
}
