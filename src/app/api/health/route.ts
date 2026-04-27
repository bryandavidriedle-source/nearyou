import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "PrèsDeToi",
    timestamp: new Date().toISOString(),
    runtime: process.env.NEXT_RUNTIME ?? "nodejs",
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? "dev",
  });
}

