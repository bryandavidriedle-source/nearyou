import { applyRateLimit, jsonError } from "@/lib/api";
import { getSmartSearchResult } from "@/lib/search/smart-search";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const rateLimit = applyRateLimit(request, "ai");
  if (rateLimit) return rateLimit;

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const city = (url.searchParams.get("city") ?? "").trim();
  const postalCode = (url.searchParams.get("npa") ?? "").trim();
  const minRating = Number(url.searchParams.get("minRating") ?? "");
  const maxPrice = Number(url.searchParams.get("maxPrice") ?? "");
  const availableNow = (url.searchParams.get("availableNow") ?? "").toLowerCase() === "true";
  const limit = Number(url.searchParams.get("limit") ?? "");
  const mode = (url.searchParams.get("mode") ?? "search").trim().toLowerCase();

  try {
    let profileId: string | null = null;
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    profileId = user?.id ?? null;

    const result = await getSmartSearchResult({
      query: q,
      city: city || undefined,
      postalCode: postalCode || undefined,
      minRating: Number.isFinite(minRating) ? minRating : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      availableNow,
      limit: Number.isFinite(limit) ? limit : mode === "suggest" ? 8 : 24,
      sourcePage: mode === "suggest" ? "smart_search_suggest" : "smart_search",
      profileId,
      logQuery: mode !== "suggest",
    });

    if (mode === "suggest") {
      return Response.json({
        success: true,
        data: {
          query: result.query,
          detected: result.detected,
          suggestions: result.suggestions,
          fallback: result.fallback,
        },
      });
    }

    return Response.json({
      success: true,
      data: result,
    });
  } catch {
    return jsonError("La recherche est temporairement indisponible.", 500);
  }
}
