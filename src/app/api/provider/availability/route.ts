import { enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { requireApiProviderAccess } from "@/lib/auth";
import { providerAvailabilitySchema } from "@/lib/schemas";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const auth = await requireApiProviderAccess();
  if (!auth) return jsonError("Acces non autorise.", 403);

  const supabase = getSupabaseAdminClient();
  const [rulesRes, blocksRes] = await Promise.all([
    supabase
      .from("provider_availability_rules")
      .select("id, day_of_week, start_time, end_time, is_active")
      .eq("profile_id", auth.user.id)
      .order("day_of_week", { ascending: true }),
    supabase
      .from("provider_unavailability_periods")
      .select("id, starts_at, ends_at, reason")
      .eq("profile_id", auth.user.id)
      .order("starts_at", { ascending: true }),
  ]);

  if (rulesRes.error || blocksRes.error) {
    return jsonError("Impossible de charger les disponibilites.", 500);
  }

  return Response.json({
    success: true,
    data: {
      rules: rulesRes.data ?? [],
      blocks: blocksRes.data ?? [],
    },
  });
}

export async function PUT(request: Request) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const auth = await requireApiProviderAccess();
  if (!auth) return jsonError("Acces non autorise.", 403);
  if (auth.providerApplication?.workflow_status !== "approved" || auth.isSuspended) {
    return jsonError("Disponibilites modifiables apres validation complete du dossier.", 403);
  }

  const body = await request.json().catch(() => null);
  const parsed = providerAvailabilitySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Disponibilites invalides.", 400, parsed.error.flatten().fieldErrors);
  }

  const supabase = getSupabaseAdminClient();

  const { error: deleteRulesError } = await supabase
    .from("provider_availability_rules")
    .delete()
    .eq("profile_id", auth.user.id);

  if (deleteRulesError) {
    return jsonError("Impossible de mettre a jour les disponibilites.", 500);
  }

  const { error: deleteBlocksError } = await supabase
    .from("provider_unavailability_periods")
    .delete()
    .eq("profile_id", auth.user.id);

  if (deleteBlocksError) {
    return jsonError("Impossible de mettre a jour les indisponibilites.", 500);
  }

  if (parsed.data.rules.length > 0) {
    const { error } = await supabase.from("provider_availability_rules").insert(
      parsed.data.rules.map((rule) => ({
        profile_id: auth.user.id,
        day_of_week: rule.dayOfWeek,
        start_time: `${rule.startTime}:00`,
        end_time: `${rule.endTime}:00`,
        is_active: rule.isActive,
      })),
    );

    if (error) {
      return jsonError("Impossible d'enregistrer les plages horaires.", 500);
    }
  }

  if (parsed.data.blocks.length > 0) {
    const { error } = await supabase.from("provider_unavailability_periods").insert(
      parsed.data.blocks.map((block) => ({
        profile_id: auth.user.id,
        starts_at: block.startsAt,
        ends_at: block.endsAt,
        reason: block.reason || null,
      })),
    );

    if (error) {
      return jsonError("Impossible d'enregistrer les indisponibilites.", 500);
    }
  }

  return jsonSuccess("Disponibilites mises a jour.");
}
