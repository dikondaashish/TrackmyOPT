import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkMigrations } from './check-migrations.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

function fixture(files, history, extraApplied = []) {
  const dir = mkdtempSync(join(tmpdir(), 'migration-check-'));
  const migrationsDir = join(dir, 'migrations');
  mkdirSync(migrationsDir);
  for (const file of files) writeFileSync(join(migrationsDir, file), '-- sql\n');
  const historyPath = join(dir, 'production-history.json');
  writeFileSync(
    historyPath,
    JSON.stringify({
      latestVersion: '20260929172952',
      applied: [{ version: '20260929172952', name: 'email_marketing_unsubscribe_preference' }, ...extraApplied],
      localFiles: { '20241208_legacy_one.sql': null, '20260929172952_email_marketing_unsubscribe_preference.sql': '20260929172952', ...history },
    })
  );
  return { migrationsDir, historyPath, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

function run(files, history, extraApplied) {
  const fx = fixture(files, history, extraApplied);
  try {
    return checkMigrations(fx);
  } finally {
    fx.cleanup();
  }
}

const BASE = ['20241208_legacy_one.sql', '20260929172952_email_marketing_unsubscribe_preference.sql'];

test('the repository migrations pass the check', () => {
  const result = checkMigrations({
    migrationsDir: join(root, 'supabase', 'migrations'),
    historyPath: join(root, 'supabase', 'production-history.json'),
  });
  assert.deepEqual(result.errors, []);
});

test('a new migration newer than production is accepted', () => {
  const result = run([...BASE, '20261015120000_add_widget_table.sql']);
  assert.deepEqual(result.errors, []);
});

test('a new migration older than production latest is rejected', () => {
  const result = run([...BASE, '20260101000000_add_widget_table.sql']);
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0], /not newer than production's latest/);
});

test('a new migration with a short date-only version is rejected', () => {
  const result = run([...BASE, '20261015_add_widget_table.sql']);
  assert.match(result.errors[0], /14-digit/);
});

test('duplicate versions are rejected', () => {
  const result = run([...BASE, '20261015120000_a.sql', '20261015120000_b.sql']);
  assert.ok(result.errors.some((error) => /already used by/.test(error)));
});

test('a new migration may use a production version only for the same migration', () => {
  const applied = [{ version: '20261020090000', name: 'add_widget_table' }];
  const same = run([...BASE, '20261020090000_add_widget_table.sql'], {}, applied);
  assert.deepEqual(same.errors, []);
  const different = run([...BASE, '20261020090000_something_else.sql'], {}, applied);
  assert.match(different.errors[0], /recorded in production as/);
});

test('malformed names are rejected', () => {
  const result = run([...BASE, '20261015120000-Bad Name.sql']);
  assert.match(result.errors[0], /name must look like/);
});

test('frozen legacy files with short versions are not flagged', () => {
  const result = run(BASE);
  assert.deepEqual(result.errors, []);
});
