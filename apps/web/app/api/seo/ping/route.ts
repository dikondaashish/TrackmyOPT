import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const INDEXNOW_KEY = "trackmyopt2026indexnow";
const SITE_HOST = "www.trackmyopt.com";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-seo-secret");
  if (secret !== (process.env.SEO_PING_SECRET || "trackmyopt-seo-ping")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const urls: string[] = Array.isArray(body.urls) ? body.urls : [];

  if (urls.length === 0) {
    return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
  }

  const results: Record<string, string> = {};

  const indexNowPayload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${SITE_HOST}/indexnow-key.txt`,
    urlList: urls.map((u) => (u.startsWith("http") ? u : `https://${SITE_HOST}${u}`)),
  };

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(indexNowPayload),
    });
    results.indexnow = `${res.status} ${res.statusText}`;
  } catch (e: unknown) {
    results.indexnow = `error: ${e instanceof Error ? e.message : "unknown"}`;
  }

  results.google_note = "Google deprecated sitemap ping (2023). Use GSC URL Inspection for manual indexing.";

  return NextResponse.json({ ok: true, results });
}
