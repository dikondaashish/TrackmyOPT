#!/usr/bin/env node
// Real PostgreSQL regression tests with synthetic cases and no production env.
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const container = `trackmyopt-daily-sync-${process.pid}`;
function command(args, input = '') {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', (d) => (output += d));
    child.stderr.on('data', (d) => (output += d));
    child.on('error', reject);
    child.on('close', (code) =>
      code === 0 ? resolve(output) : reject(new Error(output))
    );
    child.stdin.end(input);
  });
}
const sql = (input) =>
  command(
    [
      'exec',
      '-i',
      container,
      'psql',
      '-h',
      '127.0.0.1',
      '-X',
      '-qAt',
      '-v',
      'ON_ERROR_STOP=1',
      '-U',
      'postgres',
    ],
    input
  );
try {
  await command([
    'run',
    '--rm',
    '-d',
    '--name',
    container,
    '-e',
    'POSTGRES_HOST_AUTH_METHOD=trust',
    'postgres:17-alpine',
  ]);
  let ready = false;
  for (let i = 0; i < 40; i++) {
    try {
      // The image starts a temporary socket-only database during initialization.
      // Wait for the final TCP server, using the same transport as the assertions.
      await command(['exec', container, 'pg_isready', '-h', '127.0.0.1', '-U', 'postgres']);
      ready = true;
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  if (!ready) throw new Error('Disposable PostgreSQL unavailable');
  const read = (path) =>
    readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8');
  const [setup, assertions] = read(
    '../../supabase/tests/daily-case-sync.sql'
  ).split('-- APPLY MIGRATION HERE');
  await sql(setup);
  await sql(
    read('../../supabase/migrations/20261012195529_daily_case_sync.sql')
  );
  await sql(assertions);
  await sql(
    "UPDATE public.uscis_request_gate SET next_request_at='-infinity',blocked_until='-infinity'; DELETE FROM public.uscis_request_budget;"
  );
  const results = await Promise.all(
    Array.from({ length: 12 }, () =>
      sql(
        "SET ROLE service_role; SELECT public.acquire_uscis_request('production');"
      )
    )
  );
  const allowed = results
    .map((value) => JSON.parse(value.trim()))
    .filter((value) => value.allowed)
    .sort((a, b) => a.granted_at.localeCompare(b.granted_at));
  if (allowed.length === 0)
    throw new Error('Concurrent requests could not acquire an allowance');
  for (let i = 1; i < allowed.length; i++)
    if (
      Date.parse(allowed[i].granted_at) -
        Date.parse(allowed[i - 1].granted_at) <
      249
    )
      throw new Error('Concurrent grant gap below 250ms');
  const clicks = await Promise.all(
    Array.from({ length: 3 }, () =>
      sql(
        "SET ROLE service_role; SELECT public.prepare_case_refresh('00000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001');"
      )
    )
  );
  const sources = clicks.map((value) => JSON.parse(value.trim()).source).sort();
  if (sources.join(',') !== 'cooldown,database,uscis')
    throw new Error('Concurrent clicks bypassed refresh sequence');
  console.log(
    'PASS: free/premium/expired plans, owned snapshots, durable click sequence, pacing, rolling quota, shared cooldown, concurrent grants and clicks'
  );
} finally {
  await command(['rm', '-f', container]).catch(() => {});
}
