import { NextResponse } from "next/server";
import { buildCommunityStats } from "@/lib/opt/community-stats-builder";

export const dynamic = "force-dynamic";

export async function GET() {
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
