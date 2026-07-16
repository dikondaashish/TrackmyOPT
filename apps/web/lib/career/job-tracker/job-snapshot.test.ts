import { describe, expect, it } from 'vitest';
import {
  JOB_DESCRIPTION_MAX_LENGTH,
  normalizeJobSnapshot,
} from './job-snapshot';

describe('normalizeJobSnapshot', () => {
  it('strips markup, scripts, and decodes common entities before persistence', () => {
    expect(normalizeJobSnapshot({
      salaryText: '  $120k&nbsp;–&nbsp;$150k  ',
      jobDescription: '<h2>Role</h2><p>Build APIs &amp; tools.</p><script>steal()</script><br>Remote friendly',
    })).toEqual({
      salaryText: '$120k – $150k',
      jobDescription: 'Role\nBuild APIs & tools.\nRemote friendly',
    });
  });

  it('caps the normalized job description and drops empty values', () => {
    const normalized = normalizeJobSnapshot({
      salaryText: '<span> </span>',
      jobDescription: `<div>${'J'.repeat(JOB_DESCRIPTION_MAX_LENGTH + 500)}</div>`,
    });

    expect(normalized.salaryText).toBeNull();
    expect(normalized.jobDescription).toHaveLength(JOB_DESCRIPTION_MAX_LENGTH);
  });
});
