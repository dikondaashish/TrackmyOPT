#!/usr/bin/env node
// Disposable affected-schema PostgreSQL test. No production connection/env.
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const container = `trackmyopt-retention-${process.pid}`;
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
const fixture = fileURLToPath(new URL('../../supabase/tests/case-data-retention.sql', import.meta.url));
const migration = fileURLToPath(new URL('../../supabase/migrations/20261011180407_case_data_retention.sql', import.meta.url));
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
  await sql(assertions);
  const historical = readFileSync(fileURLToPath(new URL('../../supabase/operations/purge_historical_orphan_case_records.sql', import.meta.url)), 'utf8');
  // Simulate records predating the new write guards, using synthetic data.
  await sql(`
    ALTER TABLE public.uscis_check_log DISABLE TRIGGER guard_uscis_check_log_retention;
    INSERT INTO public.uscis_check_log(receipt_number,success,source) VALUES
      ('IOE0000000001',true,'legacy'),('IOE0000000004',true,'legacy'),('IOE0000000003',true,'legacy');
    ALTER TABLE public.uscis_check_log ENABLE TRIGGER guard_uscis_check_log_retention;
    ALTER TABLE public.uscis_api_audit DISABLE TRIGGER guard_uscis_audit_retention;
    INSERT INTO public.uscis_api_audit(user_id,receipt_number_hash,allowed) VALUES
      ('10000000-0000-0000-0000-000000000001',encode(sha256(convert_to('IOE0000000001','UTF8')),'hex'),true),
      ('10000000-0000-0000-0000-000000000001',encode(sha256(convert_to('IOE0000000004','UTF8')),'hex'),true);
    ALTER TABLE public.uscis_api_audit ENABLE TRIGGER guard_uscis_audit_retention;
    INSERT INTO public.blocked_emails VALUES ('one@example.test','account_deleted'),('two@example.test','account_deleted');`);
  let denied = false;
  try { await sql(historical); }
  catch (error) { denied = error.message.includes('Historical purge requires explicit owner confirmation'); }
  if (!denied) throw new Error('Historical purge ran without an approval flag');
  await sql("SELECT public.test_assert((SELECT count(*) FROM public.uscis_check_log)=3,'unapproved purge changed data');");
  await sql("SET trackmyopt.historical_case_purge_approved = 'yes';\n" + historical);
  await sql(`
    SELECT public.test_assert((SELECT count(*) FROM public.uscis_check_log)=2,'purge removed active or protected logs');
    SELECT public.test_assert((SELECT count(*) FROM public.uscis_api_audit)=2,'purge removed protected or active audits');
    SELECT public.test_assert((SELECT count(*) FROM public.blocked_emails)=2,'purge removed active or fraud block');
    SELECT public.test_assert((SELECT count(*) FROM public.uscis_case_cache WHERE quarantined)=1,'purge changed quarantine');`);
  // A telemetry insert holds the exact case row until commit. Deletion must
  // wait and subsequently remove the just-inserted row.
  let locked;
  const lockSeen = new Promise(resolve => { locked = resolve; });
  const writer = sql(`
    BEGIN;
    SELECT id FROM public.case_status WHERE id = '00000000-0000-0000-0000-000000000003' FOR KEY SHARE;
    SELECT 'LOCKED';
    SELECT pg_sleep(1);
    INSERT INTO public.uscis_check_log(case_id,receipt_number,success,source)
    VALUES ('00000000-0000-0000-0000-000000000003','IOE0000000003',true,'cron');
    COMMIT;`, chunk => { if (chunk.includes('LOCKED')) locked(); });
  await lockSeen;
  await Promise.all([writer, sql(`
    SET statement_timeout = '5s';
    DELETE FROM public.case_status WHERE id = '00000000-0000-0000-0000-000000000003';`)]);
  const remaining = await sql("SELECT count(*) FROM public.uscis_check_log WHERE receipt_number = 'IOE0000000003';");
  if (remaining.trim() !== '0') throw new Error('Concurrent telemetry survived deletion');
  console.log('PASS: deletion, shared receipt, stale writes, grants/RLS, rollback, concurrent telemetry, and guarded historical purge');
} finally {
  await command(['rm', '-f', container]).catch(() => {});
}
