#!/usr/bin/env node
/**
 * Operator CLI for server-delivered extension config (docs/ops/EXTENSION_REMOTE_CONFIG.md).
 *
 *   node scripts/extension-config.mjs validate <config.json>
 *   node scripts/extension-config.mjs list
 *   node scripts/extension-config.mjs publish <config.json> --by <name> [--notes "..."]
 *   node scripts/extension-config.mjs activate <version>        # also used for rollback
 *
 * publish/activate/list call /api/admin/extension-config with ADMIN_SECRET
 * (never printed). TRACKMYOPT_URL defaults to https://www.trackmyopt.com.
 * Validation uses the same bundled schema the extension and server enforce.
 */
import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [command, arg, ...rest] = process.argv.slice(2);
const flag = (name) => { const index = rest.indexOf(name); return index >= 0 ? rest[index + 1] : undefined; };

async function loadValidator() {
  const out = join(await mkdtemp(join(tmpdir(), 'tmo-config-validator-')), 'validator.mjs');
  await build({ entryPoints: [join(root, 'src/platform-config/remote-config.ts')], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'silent' });
  return import(pathToFileURL(out).href);
}

async function readConfig(path) {
  if (!path) throw new Error('Pass the path to a config JSON file.');
  return JSON.parse(await readFile(resolve(path), 'utf8'));
}

async function admin(method, body) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) throw new Error('Set ADMIN_SECRET in the environment.');
  const base = process.env.TRACKMYOPT_URL || 'https://www.trackmyopt.com';
  const response = await fetch(`${base}/api/admin/extension-config`, {
    method,
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${payload.error ?? 'request failed'}`);
  return payload;
}

try {
  if (command === 'validate') {
    const { validateRemoteConfig } = await loadValidator();
    const result = validateRemoteConfig(await readConfig(arg));
    if (!result.ok) { console.error(`Invalid: ${result.error}`); process.exit(1); }
    console.log(`Valid config ${result.config.version} (expires ${result.config.expiresAt}).`);
  } else if (command === 'list') {
    const { versions } = await admin('GET');
    for (const row of versions) console.log(`${row.status === 'active' ? '*' : ' '} ${row.version}  ${row.status}  by ${row.created_by}  ${row.notes ?? ''}`);
  } else if (command === 'publish') {
    const config = await readConfig(arg);
    const { validateRemoteConfig } = await loadValidator();
    const result = validateRemoteConfig(config);
    if (!result.ok) { console.error(`Invalid: ${result.error}`); process.exit(1); }
    const createdBy = flag('--by');
    if (!createdBy) throw new Error('Pass --by <your name>.');
    const published = await admin('POST', { action: 'publish', config, created_by: createdBy, notes: flag('--notes') });
    console.log(`Published ${published.version} (inactive). Activate it with: activate ${published.version}`);
  } else if (command === 'activate') {
    if (!arg) throw new Error('Pass the version to activate.');
    const activated = await admin('POST', { action: 'activate', version: arg });
    console.log(`Active: ${activated.version}. Extensions pick it up within about an hour (or on restart).`);
  } else {
    console.log('Usage: extension-config.mjs validate <file> | list | publish <file> --by <name> [--notes text] | activate <version>');
    process.exit(command ? 1 : 0);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
