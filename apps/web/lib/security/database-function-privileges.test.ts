import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(process.cwd(), '../..');

function readRepositoryFile(path: string): string {
  return readFileSync(resolve(repositoryRoot, path), 'utf8');
}

describe('security-definer database function privileges', () => {
  it('keeps the bootstrap schema restricted to service-role execution', () => {
    const functions = readRepositoryFile('supabase/schema/004_functions.sql');
    const grants = readRepositoryFile('supabase/schema/007_grants.sql');

    expect(functions).toMatch(
      /upgrade_user_to_premium[\s\S]+SET search_path = pg_catalog, public/i,
    );
    expect(functions).toMatch(
      /get_premium_users_for_daily_email[\s\S]+SET search_path = pg_catalog, public/i,
    );
    expect(grants).toMatch(
      /REVOKE ALL ON FUNCTION public\.upgrade_user_to_premium\(UUID, TEXT, TEXT\) FROM PUBLIC, anon, authenticated/i,
    );
    expect(grants).toMatch(
      /REVOKE ALL ON FUNCTION public\.get_premium_users_for_daily_email\(\) FROM PUBLIC, anon, authenticated/i,
    );
  });

  it('ships an idempotent migration that repairs existing databases', () => {
    const migration = readRepositoryFile(
      'supabase/migrations/20260725180000_lock_down_legacy_security_definer_functions.sql',
    );

    expect(migration).toMatch(
      /ALTER FUNCTION public\.upgrade_user_to_premium\(uuid, text, text\)[\s\S]+SET search_path TO pg_catalog, public/i,
    );
    expect(migration).toMatch(
      /REVOKE ALL ON FUNCTION public\.upgrade_user_to_premium\(uuid, text, text\) FROM PUBLIC, anon, authenticated/i,
    );
    expect(migration).toMatch(
      /REVOKE ALL ON FUNCTION public\.get_premium_users_for_daily_email\(\) FROM PUBLIC, anon, authenticated/i,
    );
    expect(migration).toMatch(
      /GRANT EXECUTE ON FUNCTION public\.upgrade_user_to_premium\(uuid, text, text\) TO service_role/i,
    );
  });
});
