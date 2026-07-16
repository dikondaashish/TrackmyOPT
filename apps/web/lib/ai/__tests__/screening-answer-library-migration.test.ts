import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  path.resolve(
    process.cwd(),
    '../../supabase/migrations/20260716160000_screening_answer_library.sql',
  ),
  'utf8',
);

describe('screening answer library migration', () => {
  it('enforces bounded user-scoped RLS CRUD including delete', () => {
    expect(migration).toMatch(/ENABLE ROW LEVEL SECURITY/i);
    expect(migration).toMatch(/char_length\(normalized_question_text\)[\s\S]*2000/i);
    expect(migration).toMatch(/char_length\(edited_answer\)[\s\S]*10000/i);
    expect(migration.match(/\(select auth\.uid\(\)\) = user_id/gi)?.length).toBeGreaterThanOrEqual(4);
    expect(migration).toMatch(/FOR DELETE/i);
    expect(migration).toMatch(/UNIQUE \(user_id, question_hash\)/i);
  });

  it('exposes a service-only count peek without storing question or answer text in quota events', () => {
    expect(migration).toMatch(/get_ai_generation_limit_state/i);
    expect(migration).toMatch(/REVOKE ALL ON FUNCTION[\s\S]*FROM PUBLIC, anon, authenticated/i);
    expect(migration).not.toMatch(/ALTER TABLE public\.ai_generation_events[\s\S]*(question|answer|resume|pdf|latex)/i);
  });
});
