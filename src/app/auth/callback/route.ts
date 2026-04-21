import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = url.searchParams.get("next") ?? "/espace-client";

  const redirectUrl = new URL(next, url.origin);
  const fallbackUrl = new URL("/connexion", url.origin);

  try {
    const supabase = await getSupabaseServerClient();

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        fallbackUrl.searchParams.set("error", "callback_failed");
        return NextResponse.redirect(fallbackUrl);
      }
      return NextResponse.redirect(redirectUrl);
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

      const destination = type === "recovery" ? "/connexion" : next;
      return NextResponse.redirect(new URL(destination, url.origin));
    }

    fallbackUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(fallbackUrl);
  } catch {
    fallbackUrl.searchParams.set("error", "unexpected");
    return NextResponse.redirect(fallbackUrl);
  }
}

