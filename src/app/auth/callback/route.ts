import { NextResponse } from "next/server";

import { resolveAuthenticatedHomePath } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function safeNextPath(nextValue: string | null) {
  if (!nextValue) return null;
  if (!nextValue.startsWith("/")) return null;
  if (nextValue.startsWith("//")) return null;
  return nextValue;
}

async function bootstrapProviderOnboardingIfNeeded(supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const accountType = (user.user_metadata?.account_type as string | undefined) ?? null;
  if (accountType !== "provider") return;

  const { data: latestApplication } = await supabase
    .from("provider_applications")
    .select("id")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestApplication?.id) return;

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

async function syncProfileMetadata(supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>) {
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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = safeNextPath(url.searchParams.get("next"));
  const fallbackUrl = new URL("/connexion", url.origin);

  try {
    const supabase = await getSupabaseServerClient();

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        fallbackUrl.searchParams.set("error", "callback_failed");
        return NextResponse.redirect(fallbackUrl);
      }
      await syncProfileMetadata(supabase);
      await bootstrapProviderOnboardingIfNeeded(supabase);
      const destination = next ?? (await resolveAuthenticatedHomePath());
      return NextResponse.redirect(new URL(destination, url.origin));
    }

    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as "signup" | "recovery" | "invite" | "magiclink" | "email_change" | "email",
      });

      if (error) {
        fallbackUrl.searchParams.set("error", "otp_failed");
        return NextResponse.redirect(fallbackUrl);
      }

      await syncProfileMetadata(supabase);
      await bootstrapProviderOnboardingIfNeeded(supabase);
      const destination = type === "recovery" ? (next ?? "/reinitialiser-mot-de-passe") : (next ?? (await resolveAuthenticatedHomePath()));
      return NextResponse.redirect(new URL(destination, url.origin));
    }

    fallbackUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(fallbackUrl);
  } catch {
    fallbackUrl.searchParams.set("error", "unexpected");
    return NextResponse.redirect(fallbackUrl);
  }
}

