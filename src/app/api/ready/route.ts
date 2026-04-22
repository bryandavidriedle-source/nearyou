import { NextResponse } from "next/server";

import { getErrorMessage, logEvent } from "@/lib/monitoring";
import { hasSupabaseServiceRole } from "@/lib/supabase";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const checks = {
    supabaseServiceRole: hasSupabaseServiceRole(),
    supabaseQuery: false,
  };

  if (checks.supabaseServiceRole) {
    try {
      const supabase = getSupabaseAdminClient();
      const { error } = await supabase.from("service_categories").select("id").limit(1);
      checks.supabaseQuery = !error;
      if (error) {
        logEvent("error", {
          event: "ready.supabase_query_failed",
          message: "Readiness check query failed.",
          context: { reason: error.message },
        });
      }
    } catch (error) {
      logEvent("error", {
        event: "ready.exception",
        message: "Unexpected exception in readiness check.",
        context: { reason: getErrorMessage(error) },
      });
    }
  }

  const ready = checks.supabaseServiceRole && checks.supabaseQuery;

  return NextResponse.json(
    {
      ok: ready,
      checks,
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? "dev",
    },
    { status: ready ? 200 : 503 },
  );
}
