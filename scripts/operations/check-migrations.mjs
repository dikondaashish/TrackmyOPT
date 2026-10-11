#!/usr/bin/env node
/**
 * Guards supabase/migrations against the mistakes that make a deploy unsafe.
 *
 * Production records every migration under the timestamp assigned when it was
 * applied, which differs from most local filenames (see
 * supabase/production-history.json and docs/ops/SUPABASE_MIGRATIONS.md).
 * This check therefore enforces two things:
 *
 *  1. The local folder is a valid, ordered history on its own
 *     (`supabase db reset` works): unique versions, well-formed names.
 *  2. Any NEW migration (one not in the frozen snapshot) is added safely:
 *     14-digit version, newer than everything production already has, and
 *     never reusing a production version for a different migration.
 *
 * Usage: node scripts/operations/check-migrations.mjs
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE_RE = /^(\d+)_([a-z0-9_]+)\.sql$/;

function stripVersionPrefix(name) {
  return name.replace(/^\d+_/, '');
}

export function checkMigrations({ migrationsDir, historyPath }) {
  const errors = [];
  const warnings = [];
  const history = JSON.parse(readFileSync(historyPath, 'utf8'));
  const legacy = new Set(Object.keys(history.localFiles));
  const applied = new Map(history.applied.map((entry) => [entry.version, entry.name]));

  const files = readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort();
  const versions = new Map();

  for (const file of files) {
    const match = FILE_RE.exec(file);
    if (!match) {
      errors.push(`${file}: name must look like <version>_<snake_case_description>.sql`);
      continue;
    }
    const [, version, name] = match;
    if (versions.has(version)) {
      errors.push(
        `${file}: version ${version} is already used by ${versions.get(version)} (versions must be unique)`
      );
    } else {
      versions.set(version, file);
    }

    if (legacy.has(file)) continue; // frozen: never rename or edit applied migrations

    // New migration from here on.
    if (version.length !== 14) {
      errors.push(`${file}: new migrations must use a 14-digit YYYYMMDDHHMMSS version`);
      continue;
    }
    const productionName = applied.get(version);
    if (productionName !== undefined) {
      // Aligned with production: allowed only when it is the same migration.
      if (stripVersionPrefix(productionName) !== name) {
        errors.push(
          `${file}: version ${version} is recorded in production as "${productionName}", not "${name}"`
        );
      }
    } else if (version <= history.latestVersion) {
      errors.push(
        `${file}: version ${version} is not newer than production's latest (${history.latestVersion}). ` +
          'Use a current timestamp, or, if you already applied it, record it in supabase/production-history.json'
      );
    }
  }

  for (const file of legacy) {
    if (!files.includes(file)) {
      warnings.push(`${file}: listed in production-history.json but not present (was a migration removed?)`);
    }
  }

  return { errors, warnings, count: files.length };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const { errors, warnings, count } = checkMigrations({
    migrationsDir: join(root, 'supabase', 'migrations'),
    historyPath: join(root, 'supabase', 'production-history.json'),
  });
  for (const warning of warnings) console.warn(`warning: ${warning}`);
  if (errors.length > 0) {
    for (const error of errors) console.error(`error: ${error}`);
    console.error(`\n${errors.length} migration problem(s). See docs/ops/SUPABASE_MIGRATIONS.md.`);
    process.exit(1);
  }
  console.log(`OK: ${count} migrations checked.`);
}
