#!/usr/bin/env node
/**
 * Writes data/seo/page-lastmod.json: route -> date (YYYY-MM-DD) of the last git
 * commit that touched that route's page file.
 *
 * Why: sitemap <lastmod> must reflect real content changes. Using the build time
 * (or file mtime, which is the deploy time on Vercel) marks every URL as "changed
 * today", and Google then ignores lastmod for the whole site.
 *
 * Run from a full (non-shallow) clone after adding or materially editing a page:
 *   pnpm seo:lastmod
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const appDir = path.join(root, 'app');
const outFile = path.join(root, 'data/seo/page-lastmod.json');

if (execFileSync('git', ['rev-parse', '--is-shallow-repository'], { cwd: root }).toString().trim() === 'true') {
  console.error('Shallow clone: git history is incomplete. Fetch full history first.');
  process.exit(1);
}

function* pageFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['api', 'admin', 'dashboard'].includes(entry.name) || entry.name.startsWith('[')) continue;
      yield* pageFiles(full);
    } else if (entry.name === 'page.tsx') {
      yield full;
    }
  }
}

const manifest = {};
for (const file of pageFiles(appDir)) {
  const dir = path.dirname(path.relative(appDir, file));
  const route = dir === '.' ? '/' : `/${dir.split(path.sep).filter((s) => !/^\(.*\)$/.test(s)).join('/')}`;
  const date = execFileSync('git', ['log', '-1', '--format=%cs', '--', path.relative(root, file)], { cwd: root })
    .toString()
    .trim();
  if (date) manifest[route] = date;
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`Wrote ${Object.keys(sorted).length} routes to ${path.relative(root, outFile)}`);
