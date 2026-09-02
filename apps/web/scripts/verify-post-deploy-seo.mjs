#!/usr/bin/env node
/**
 * Post-deploy SEO verification.
 * Run: node apps/web/scripts/verify-post-deploy-seo.mjs
 *
 * Checks JSON-LD, GSC 404 redirects, and robots.txt crawl blocks.
 */

const BASE = process.env.SEO_VERIFY_BASE ?? "https://www.trackmyopt.com";

const JSON_LD_PATHS = [
  "/",
  "/blog/opt-processing-time-2026",
  "/blog/uscis-case-status-tracking-guide",
  "/blog/90-day-unemployment-rule-opt",
  "/blog/i-983-training-plan-guide",
  "/blog/stem-opt-extension-guide",
  "/blog/opt-application-denied",
  "/blog/can-you-travel-on-opt-complete-guide",
  "/blog/how-to-answer-sponsorship-question",
  "/blog/cpt-12-month-rule-opt-eligibility",
  "/answers/what-is-sevis",
  "/features/case-status",
];

/** [sourcePath, expectedFinalPathSegment or full path] */
const REDIRECT_CHECKS = [
  ["/community", "/features/community"],
  ["/signup", "/login"],
  ["/help", "/dashboard/help"],
  ["/blog/opt-processing-time", "/blog/opt-processing-time-2026"],
  ["/blog/how-to-track-uscis-case-status-guide", "/blog/uscis-case-status-tracking-guide"],
  ["/blog/can-you-travel-on-opt", "/blog/can-you-travel-on-opt-complete-guide"],
  ["/blog/form-i983-stem-opt-training-plan-guide", "/blog/i-983-training-plan-guide"],
  ["/blog/f1-student-tax-filing-guide", "/blog/f1-student-tax-filing-guide-2026"],
  ["/search", "/answers"],
  ["/blog/stem-opt-extension-guide-2026", "/blog/stem-opt-extension-guide"],
  ["/blog/travel-on-opt-documents-checklist", "/blog/can-you-travel-on-opt-complete-guide"],
  ["/tools/opt-tax-calculator", "/features/tax-filing"],
  ["/features/h1b-database", "/features/sponsors"],
  ["/features/resume-builder", "/features/resume-ai"],
];

function extractJsonLdBlocks(html) {
  const blocks = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    blocks.push(m[1].trim());
  }
  return blocks;
}

async function checkJsonLd(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { redirect: "follow" });
  const html = await res.text();
  const blocks = extractJsonLdBlocks(html);
  const parsed = [];
  const errors = [];

  for (const raw of blocks) {
    try {
      const json = JSON.parse(raw);
      parsed.push(json);
      const ctx = json["@context"];
      if (ctx != null && typeof ctx !== "string") {
        errors.push(`@context is not a string: ${typeof ctx}`);
      }
    } catch (e) {
      errors.push(`JSON parse failed: ${e.message}`);
    }
  }

  return {
    path,
    status: res.status,
    blockCount: blocks.length,
    types: parsed.map((j) => j["@type"] ?? j["@graph"]?.[0]?.["@type"] ?? "?"),
    ok: res.ok && blocks.length > 0 && errors.length === 0,
    errors,
  };
}

async function checkRedirect(sourcePath, expectedSuffix) {
  const res = await fetch(`${BASE}${sourcePath}`, { redirect: "manual" });
  const location = res.headers.get("location") ?? "";
  const ok =
    (res.status === 301 || res.status === 308) &&
    location.includes(expectedSuffix);
  return { sourcePath, status: res.status, location, expectedSuffix, ok };
}

async function checkRobots() {
  const res = await fetch(`${BASE}/robots.txt`);
  const text = await res.text();
  const googleBlock = text.match(/User-Agent: Googlebot[\s\S]*?(?=User-Agent:|$)/i)?.[0] ?? "";
  const ok = /Disallow:\s*\/api\//i.test(googleBlock);
  return { ok, googleBlock: googleBlock.trim().slice(0, 120) };
}

async function checkApiCrawlerBlock() {
  const res = await fetch(`${BASE}/api/me`, {
    redirect: "manual",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    },
  });
  const tag = res.headers.get("x-robots-tag") ?? "";
  return {
    status: res.status,
    tag,
    ok: res.status === 403 && /noindex/i.test(tag),
  };
}

async function checkApiNoindex() {
  const res = await fetch(`${BASE}/api/me`, { redirect: "manual" });
  const tag = res.headers.get("x-robots-tag") ?? "";
  return { status: res.status, tag, ok: /noindex/i.test(tag) };
}

console.log(`SEO verify — ${BASE}\n`);

let failed = 0;

console.log("── JSON-LD ──");
for (const path of JSON_LD_PATHS) {
  try {
    const r = await checkJsonLd(path);
    const mark = r.ok ? "OK" : "FAIL";
    if (!r.ok) failed += 1;
    console.log(
      `[${mark}] ${path} — HTTP ${r.status}, ${r.blockCount} block(s), types: ${r.types.join(", ") || "none"}`
    );
    for (const err of r.errors) console.log(`       ↳ ${err}`);
  } catch (e) {
    failed += 1;
    console.log(`[FAIL] ${path} — ${e.message}`);
  }
}

console.log("\n── 301 redirects (GSC 404 / duplicate fixes) ──");
for (const [source, dest] of REDIRECT_CHECKS) {
  try {
    const r = await checkRedirect(source, dest);
    const mark = r.ok ? "OK" : "FAIL";
    if (!r.ok) failed += 1;
    console.log(
      `[${mark}] ${source} — HTTP ${r.status} → ${r.location || "(no Location)"}`
    );
  } catch (e) {
    failed += 1;
    console.log(`[FAIL] ${source} — ${e.message}`);
  }
}

console.log("\n── Crawl policy ──");
try {
  const robots = await checkRobots();
  const mark = robots.ok ? "OK" : "FAIL";
  if (!robots.ok) failed += 1;
  console.log(
    `[${mark}] robots.txt Googlebot blocks /api/ — ${robots.ok ? "yes" : `no (${robots.googleBlock}…)`}`
  );
} catch (e) {
  failed += 1;
  console.log(`[FAIL] robots.txt — ${e.message}`);
}

try {
  const crawler = await checkApiCrawlerBlock();
  const mark = crawler.ok ? "OK" : "FAIL";
  if (!crawler.ok) failed += 1;
  console.log(
    `[${mark}] /api/me blocks Googlebot — HTTP ${crawler.status}, tag: ${crawler.tag || "(none)"}`
  );
} catch (e) {
  failed += 1;
  console.log(`[FAIL] /api/me Googlebot block — ${e.message}`);
}

try {
  const api = await checkApiNoindex();
  const mark = api.ok ? "OK" : "WARN";
  console.log(
    `[${mark}] /api/me X-Robots-Tag (browser) — HTTP ${api.status}, tag: ${api.tag || "(none)"}`
  );
} catch (e) {
  console.log(`[WARN] /api/me — ${e.message}`);
}

console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check(s) need attention.`);
process.exit(failed === 0 ? 0 : 1);
