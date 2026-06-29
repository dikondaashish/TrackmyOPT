#!/usr/bin/env node
/**
 * Phase 1 post-deploy SEO verification.
 * Run: node apps/web/scripts/verify-post-deploy-seo.mjs
 *
 * Checks production pages for JSON-LD blocks and @context strings.
 */

const BASE = process.env.SEO_VERIFY_BASE ?? "https://www.trackmyopt.com";

const PATHS = [
  "/",
  "/blog/opt-processing-time-2026",
  "/blog/uscis-case-status-tracking-guide",
  "/blog/90-day-unemployment-rule-opt",
  "/blog/i-983-training-plan-guide",
  "/blog/stem-opt-extension-guide",
  "/features/case-status",
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

async function checkPath(path) {
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

console.log(`SEO verify — ${BASE}\n`);

let failed = 0;
for (const path of PATHS) {
  try {
    const r = await checkPath(path);
    const mark = r.ok ? "OK" : "FAIL";
    if (!r.ok) failed += 1;
    console.log(
      `[${mark}] ${path} — HTTP ${r.status}, ${r.blockCount} JSON-LD block(s), types: ${r.types.join(", ") || "none"}`
    );
    for (const err of r.errors) console.log(`       ↳ ${err}`);
  } catch (e) {
    failed += 1;
    console.log(`[FAIL] ${path} — ${e.message}`);
  }
}

console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} page(s) need attention.`);
process.exit(failed === 0 ? 0 : 1);
