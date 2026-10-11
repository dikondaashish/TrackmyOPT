import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { NextResponse } from "next/server";
import { buildCommunityStats } from "@/lib/opt/community-stats-builder";

export const dynamic = "force-dynamic";

async function handleGET() {
  try {
    const data = await buildCommunityStats();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error("community-stats error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to load community stats" },
      { status: 500 }
    );
  }
}

export const GET = withSentryApiErrors(handleGET, '/api/opt/community-stats', 'GET');
