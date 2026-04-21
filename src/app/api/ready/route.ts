import { NextResponse } from "next/server";

import { hasSupabaseServiceRole } from "@/lib/supabase";

export async function GET() {
  const ready = hasSupabaseServiceRole();

  return NextResponse.json(
    {
      ok: ready,
      checks: {
        supabaseServiceRole: ready,
      },
      timestamp: new Date().toISOString(),
    },
    { status: ready ? 200 : 503 },
  );
}
