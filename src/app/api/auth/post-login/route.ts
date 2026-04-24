import { jsonError } from "@/lib/api";
import { getAuthContext, resolveAuthenticatedHomePath } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

async function syncProfileMetadata() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const firstName = ((user.user_metadata?.first_name as string | undefined) ?? "").trim();
  const lastName = ((user.user_metadata?.last_name as string | undefined) ?? "").trim();
  const phone = ((user.user_metadata?.phone as string | undefined) ?? "").trim();

  await supabase
    .from("profiles")
    .update({
      first_name: firstName || null,
      last_name: lastName || null,
      phone: phone || null,
    })
    .eq("id", user.id);
}

async function bootstrapProviderOnboardingIfNeeded() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;
  const accountType = (user.user_metadata?.account_type as string | undefined) ?? null;
  if (accountType !== "provider") return;

  const { data: existingApplication } = await supabase
    .from("provider_applications")
    .select("id")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingApplication?.id) return;

  const firstName = ((user.user_metadata?.first_name as string | undefined) ?? "").trim();
  const lastName = ((user.user_metadata?.last_name as string | undefined) ?? "").trim();
  const displayName = `${firstName} ${lastName}`.trim() || "Prestataire PrèsDeToi";

  await supabase.from("provider_applications").insert({
    profile_id: user.id,
    status: "new",
    workflow_status: "draft",
    first_name: firstName || null,
    last_name: lastName || null,
    business_name: displayName,
    email: user.email ?? null,
    phone: null,
    city: null,
    category: "À définir",
    services_description: "Description à compléter",
    years_experience: "0",
    availability: "À définir",
    country: "Suisse",
    legal_status: "independant",
    legal_responsibility_ack: true,
    terms_ack: true,
    consent: true,
  });
}

export async function GET() {
  try {
    await syncProfileMetadata();
    await bootstrapProviderOnboardingIfNeeded();
    const context = await getAuthContext();
    if (!context.user) {
    return jsonError("Session indisponible.", 401);
    }
    const path = await resolveAuthenticatedHomePath();
    return Response.json({ success: true, path });
  } catch {
    return jsonError("Impossible de déterminer la redirection.", 500);
  }
}


