import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('AI generation limit migration', () => {
  const sql = readFileSync(
    path.resolve(process.cwd(), '../../supabase/migrations/20260716150000_ai_generation_limits.sql'),
    'utf8',
  );

  it('uses an atomic per-user/day lock and a combined event table', () => {
    expect(sql).toMatch(/pg_advisory_xact_lock/i);
    expect(sql).toMatch(/ai_generation_events/i);
    expect(sql).toMatch(/screening_answer/);
    expect(sql).toMatch(/cover_letter/);
  });

  it('keeps quota mutation service-only and stores no content columns', () => {
    expect(sql).toMatch(/REVOKE ALL ON FUNCTION public\.reserve_ai_generation/i);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.reserve_ai_generation[\s\S]*service_role/i);
    expect(sql).not.toMatch(/question_text|answer_text|job_description|snapshot|pdf|latex/i);
  });
});
