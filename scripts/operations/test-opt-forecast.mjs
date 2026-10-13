#!/usr/bin/env node
// Real PostgreSQL regression tests with synthetic cases and no production env.
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const container = `trackmyopt-opt-forecast-${process.pid}`;
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
    '../../supabase/tests/opt-forecast.sql'
  ).split('-- APPLY MIGRATION HERE');
  await sql(setup);
  await sql(
    read('../../supabase/migrations/20261013133431_opt_forecast_observations.sql')
  );
  await sql(assertions);
  console.log('PASS: private immutable history, temporal reads, deduplication, metadata revisions, job claims, deletion and receipt-change invalidation');
} finally {
  await command(['rm', '-f', container]).catch(() => {});
}
