#!/usr/bin/env node
/**
 * Submit one or more TrackMyOPT URLs to IndexNow (Bing/Yandex).
 *
 * Usage:
 *   node scripts/submit-urls-indexnow.js --slug my-new-post
 *   node scripts/submit-urls-indexnow.js /blog/my-new-post https://www.trackmyopt.com/pricing
 *   pnpm submit:indexnow:url -- --slug stem-opt-extension-guide
 *
 * Env (optional):
 *   INDEXNOW_KEY — defaults to public key in apps/web/public/indexnow-key.txt
 */

const https = require("https");

const SITE = "www.trackmyopt.com";
const BASE = `https://${SITE}`;
const DEFAULT_KEY = "trackmyopt2026indexnow";

function parseArgs(argv) {
  const slugs = [];
  const urls = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--slug" && argv[i + 1]) {
      slugs.push(argv[++i].replace(/^\/+|\/+$/g, ""));
      continue;
    }
    if (arg.startsWith("--slug=")) {
      slugs.push(arg.slice("--slug=".length).replace(/^\/+|\/+$/g, ""));
      continue;
    }
    if (arg.startsWith("http://") || arg.startsWith("https://")) {
      urls.push(arg);
      continue;
    }
    if (arg.startsWith("/")) {
      urls.push(`${BASE}${arg}`);
      continue;
    }
    if (!arg.startsWith("-")) {
      // bare slug or path segment
      const cleaned = arg.replace(/^\/+|\/+$/g, "");
      if (cleaned.startsWith("blog/")) {
        urls.push(`${BASE}/${cleaned}`);
      } else {
        slugs.push(cleaned);
      }
    }
  }

  for (const slug of slugs) {
    const path = slug.startsWith("blog/") ? slug : `blog/${slug}`;
    urls.push(`${BASE}/${path}`);
  }

  return [...new Set(urls)];
}

function submitToIndexNow(urlList) {
  const key = process.env.INDEXNOW_KEY?.trim() || DEFAULT_KEY;
  const payload = JSON.stringify({
    host: SITE,
    key,
    keyLocation: `${BASE}/indexnow-key.txt`,
    urlList,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.indexnow.org",
        port: 443,
        path: "/IndexNow",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({ statusCode: res.statusCode, body });
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const urls = parseArgs(process.argv.slice(2));

  if (urls.length === 0) {
    console.error("Usage: node scripts/submit-urls-indexnow.js --slug <slug> [more urls]");
    console.error("Example: node scripts/submit-urls-indexnow.js --slug opt-processing-time-2026");
    process.exit(1);
  }

  console.log(`📤 Submitting ${urls.length} URL(s) to IndexNow:`);
  urls.forEach((u) => console.log(`   • ${u}`));

  const { statusCode, body } = await submitToIndexNow(urls);

  if (statusCode === 200 || statusCode === 202) {
    console.log(`\n✅ IndexNow ${statusCode} — accepted`);
    console.log("   Bing/Yandex: typically 24–48h. Google: use GSC URL Inspection.");
    process.exit(0);
  }

  console.error(`\n❌ IndexNow returned ${statusCode}`);
  if (body) console.error(body);
  process.exit(1);
}

main().catch((err) => {
  console.error("❌", err.message);
  process.exit(1);
});
