import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { requireApiProviderAccess } from "@/lib/auth";
import { providerServicesPayloadSchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireApiProviderAccess();
  if (!auth) return jsonError("Acces non autorise.", 403);

  const supabase = getSupabaseAdminClient();
  const [catalogRes, providerServicesRes] = await Promise.all([
    supabase
      .from("services")
      .select("id, slug, title, from_price_chf, service_categories(name_fr, slug)")
      .eq("active", true)
      .order("title", { ascending: true }),
    supabase
      .from("provider_services")
      .select("id, service_id, min_price_chf, is_active")
      .eq("profile_id", auth.user.id),
  ]);

  if (catalogRes.error || providerServicesRes.error) {
    return jsonError("Impossible de charger les competences.", 500);
  }

  const byServiceId = new Map((providerServicesRes.data ?? []).map((row) => [row.service_id, row]));
  const catalog = (catalogRes.data ?? []).map((service) => {
    const configured = byServiceId.get(service.id);
    const categoryRelation = Array.isArray(service.service_categories)
      ? (service.service_categories[0] as { name_fr?: string; slug?: string } | null)
      : ((service.service_categories ?? null) as { name_fr?: string; slug?: string } | null);

    return {
      id: service.id,
      slug: service.slug,
      title: service.title,
      suggestedBasePriceChf: service.from_price_chf,
      minPriceChf: configured ? Number(configured.min_price_chf) : service.from_price_chf,
      isActive: configured ? configured.is_active : false,
      categoryName: categoryRelation?.name_fr ?? "Service",
    };
  });

  return Response.json({ success: true, data: catalog });
}

export async function PUT(request: Request) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await requireApiProviderAccess();
  if (!auth) return jsonError("Acces non autorise.", 403);
  if (auth.providerApplication?.workflow_status !== "approved" && auth.providerApplication?.workflow_status !== "pending_review" && auth.providerApplication?.workflow_status !== "draft") {
    return jsonError("Etat du dossier incompatible avec la mise a jour des competences.", 403);
  }

  const body = await request.json().catch(() => null);
  const parsed = providerServicesPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Competences invalides.", 400, parsed.error.flatten().fieldErrors);
  }

  const supabase = getSupabaseAdminClient();
  const rows = parsed.data.services;

  const { error: deleteError } = await supabase
    .from("provider_services")
    .delete()
    .eq("profile_id", auth.user.id);
  if (deleteError) return jsonError("Impossible de reinitialiser vos competences.", 500);

  if (rows.length > 0) {
    const { error: insertError } = await supabase.from("provider_services").insert(
      rows.map((item) => ({
        profile_id: auth.user.id,
        service_id: item.serviceId,
        min_price_chf: item.minPriceChf,
        is_active: item.isActive,
      })),
    );
    if (insertError) return jsonError("Impossible de sauvegarder vos competences.", 500);
  }

  return jsonSuccess("Competences prestataire mises a jour.");
}
