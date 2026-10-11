#!/usr/bin/env node
// Disposable affected-schema PostgreSQL test. No production connection/env.
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const container = `trackmyopt-case-email-${process.pid}`;
function command(args, input = '', onOutput) {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', data => { output += data; onOutput?.(String(data)); });
    child.stderr.on('data', data => { output += data; });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve(output) : reject(new Error(output)));
    child.stdin.end(input);
  });
}
const sql = (input, onOutput) => command(
  ['exec', '-i', container, 'psql', '-h', '127.0.0.1', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres'], input, onOutput);
const fixture = fileURLToPath(new URL('../../supabase/tests/pending-case-email-sequence.sql', import.meta.url));
const migration = fileURLToPath(new URL('../../supabase/migrations/20261011190558_pending_case_email_sequence.sql', import.meta.url));
try {
  await command(['run', '--rm', '-d', '--name', container, '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', 'postgres:17-alpine']);
  let ready = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    try { await command(['exec', container, 'pg_isready', '-h', '127.0.0.1', '-U', 'postgres']); ready = true; break; }
    catch { await new Promise(resolve => setTimeout(resolve, 250)); }
  }
  if (!ready) throw new Error('Disposable PostgreSQL did not start');
  const [setup, assertions] = readFileSync(fixture, 'utf8').split('-- APPLY MIGRATION HERE');
  await sql(setup);
  await sql(readFileSync(migration, 'utf8'));
  await sql(readFileSync(fileURLToPath(new URL('../../supabase/migrations/20261011194301_pending_case_email_indexes.sql', import.meta.url)), 'utf8'));
  await sql(assertions);
  await Promise.all([
    sql("SELECT public.reserve_case_promotion(public.test_user(9),'pending_case_followup',gen_random_uuid(),'test','synthetic-9@example.invalid');"),
    sql("SELECT public.reserve_case_promotion(public.test_user(9),'checkout_recovery',gen_random_uuid(),'test','synthetic-9@example.invalid');"),
  ]);
  await sql("SELECT public.test_assert((SELECT count(*) FROM public.email_queue WHERE user_id=public.test_user(9))=2,'concurrent workers exceeded cap');");
  for (const statement of [
    'SET ROLE authenticated; SELECT * FROM public.pending_case_email_sequences;',
    "SET ROLE anon; SELECT public.reserve_case_promotion(public.test_user(9),'pending_case_first',gen_random_uuid(),'test','synthetic-9@example.invalid');",
    "SET ROLE service_role; UPDATE public.pending_case_email_sequences SET arm='treatment';",
  ]) {
    let denied=false;
    try { await sql(statement); } catch (error) { denied=error.message.includes('permission denied'); }
    if (!denied) throw new Error('Private campaign boundary allowed a forbidden operation');
  }
  console.log('PASS: prospective enrollment, ownership, eligibility, timers, holdout, grants/RLS, deletion, legacy/shared/concurrent cap');
} finally {
  await command(['rm', '-f', container]).catch(() => {});
}
