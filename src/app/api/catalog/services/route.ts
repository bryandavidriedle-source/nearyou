import { jsonError } from "@/lib/api";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const category = (url.searchParams.get("category") ?? "").trim();
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 12), 40);

  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("services")
    .select("id, slug, title, from_price_chf, category_id, service_categories(name_fr, slug)")
    .eq("active", true)
    .order("title", { ascending: true })
    .limit(limit);

  if (q.length > 0) {
    query = query.ilike("title", `%${q}%`);
  }

  if (category.length > 0) {
    const { data: categoryRows } = await supabase
      .from("service_categories")
      .select("id")
      .eq("slug", category)
      .limit(1);
    const categoryId = categoryRows?.[0]?.id;
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }
  }

  const { data, error } = await query;
  if (error) return jsonError("Impossible de charger le catalogue services.", 500);

  return Response.json({
    success: true,
    data: (data ?? []).map((item) => {
      const categoryRelation = Array.isArray(item.service_categories)
        ? (item.service_categories[0] as { name_fr?: string; slug?: string } | null)
        : ((item.service_categories ?? null) as { name_fr?: string; slug?: string } | null);

      return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        fromPriceChf: item.from_price_chf,
        categoryName: categoryRelation?.name_fr ?? "Service",
        categorySlug: categoryRelation?.slug ?? null,
      };
    }),
  });
}
