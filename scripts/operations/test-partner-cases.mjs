#!/usr/bin/env node
// Disposable PostgreSQL test for partner cases. No production connection/env.
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const container = `trackmyopt-partner-cases-${process.pid}`;
function command(args, input = '') {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', (d) => (output += d));
    child.stderr.on('data', (d) => (output += d));
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve(output) : reject(new Error(output))));
    child.stdin.end(input);
  });
}
const sql = (input) =>
  command(['exec', '-i', container, 'psql', '-h', '127.0.0.1', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres'], input);
const read = (path) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8');
try {
  await command(['run', '--rm', '-d', '--name', container, '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', 'postgres:17-alpine']);
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      await command(['exec', container, 'pg_isready', '-h', '127.0.0.1', '-U', 'postgres']);
      ready = true;
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  if (!ready) throw new Error('Disposable PostgreSQL did not start');
  // The partner migration amends the retention guard, so build on that fixture first.
  const [retentionSetup] = read('../../supabase/tests/case-data-retention.sql').split('-- APPLY MIGRATION HERE');
  await sql(retentionSetup);
  await sql(read('../../supabase/migrations/20261011180407_case_data_retention.sql'));
  const [, assertions] = read('../../supabase/tests/partner-cases.sql').split('-- APPLY MIGRATION HERE');
  await sql(read('../../supabase/migrations/20261122171112_partner_cases.sql'));
  await sql(assertions);
  console.log('PASS: partner grants/RLS, validation, audit guard for partner and TrackMyOPT lookups, shared-receipt purge');
} finally {
  await command(['rm', '-f', container]).catch(() => {});
}
