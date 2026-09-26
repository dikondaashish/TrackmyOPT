import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, mkdirSync, mkdtempSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
execFileSync(process.execPath, ['esbuild.config.js'], { cwd: root, stdio: 'inherit' });
const dist = join(root, 'dist');
const manifest = JSON.parse(readFileSync(join(dist, 'manifest.json'), 'utf8'));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
assert.equal(manifest.version, pkg.version);
assert.equal(manifest.manifest_version, 3);
assert.deepEqual(manifest.host_permissions, ['https://www.trackmyopt.com/*', 'https://trackmyopt.com/*']);
assert.deepEqual(manifest.permissions, ['storage', 'tabs', 'notifications', 'scripting', 'activeTab', 'sidePanel']);
const walk = (dir, prefix = '') => readdirSync(dir).flatMap(name => {
  const relative = prefix + name;
  return statSync(join(dir, name)).isDirectory() ? walk(join(dir, name), relative + '/') : [relative];
});
const files = walk(dist).sort();
const allowed = /^(?:manifest\.json|[a-z-]+\.(?:js|html|css)|icons\/(?:icon(?:16|48|128)\.png|logo\.gif))$/;
for (const file of files) {
  assert.match(file, allowed, `Unexpected package file: ${file}`);
  if (!/\.(js|json|html|css)$/.test(file)) continue;
  const source = readFileSync(join(dist, file), 'utf8');
  for (const forbidden of [/localhost/i, /127\.0\.0\.1/, /sourceMappingURL/, /console\.(?:log|debug|info|warn|error)\(/, /\bdebugger\s*;/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /(?:sk_live_|sk-proj-|AIza)[\w-]{20,}/]) {
    assert.ok(!forbidden.test(source), `Forbidden release content in ${file}: ${forbidden}`);
  }
}
const resources = [manifest.background.service_worker, manifest.action.default_popup, manifest.side_panel.default_path,
  ...Object.values(manifest.icons), ...manifest.content_scripts.flatMap(s => s.js),
  ...manifest.web_accessible_resources.flatMap(r => r.resources)];
for (const resource of resources) assert.ok(files.includes(resource), `Missing manifest resource: ${resource}`);
for (const file of files.filter(f => f.endsWith('.html'))) {
  const html = readFileSync(join(dist, file), 'utf8');
  for (const [, resource] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    assert.ok(files.includes(resource), `Missing HTML resource: ${resource}`);
  }
}
const releaseDir = join(root, 'releases');
mkdirSync(releaseDir, { recursive: true });
const zip = join(releaseDir, `trackmyopt-v${manifest.version}-chrome-web-store.zip`);
// A new temporary ZIP prevents stale entries from a previous package surviving.
const stage = mkdtempSync(join(tmpdir(), 'trackmyopt-store-'));
const temporaryZip = join(stage, 'package.zip');
execFileSync('zip', ['-X', '-q', temporaryZip, ...files], { cwd: dist });
execFileSync('unzip', ['-q', temporaryZip, '-d', join(stage, 'extracted')]);
assert.deepEqual(walk(join(stage, 'extracted')).sort(), files);
for (const file of files) assert.ok(readFileSync(join(dist, file)).equals(readFileSync(join(stage, 'extracted', file))), `ZIP content differs: ${file}`);
execFileSync('cp', [temporaryZip, zip]);
const sha256 = createHash('sha256').update(readFileSync(zip)).digest('hex');
console.log(JSON.stringify({ zip, version: manifest.version, files, sha256, extracted: join(stage, 'extracted') }, null, 2));
