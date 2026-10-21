// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { outreachFields, outreachFirstName, parseOutreachSource, renderOutreach } from './verified-jobs-outreach';

const now = new Date('2026-10-21T15:00:00Z');
const directory = resolve(__dirname, '../../../../docs/marketing/updates/2026-10-20-verified-jobs');

describe('verified jobs outreach fields', () => {
  it('uses the later STEM end date for the runway opener and a filtered link', () => {
    const fields = outreachFields({ metadata: { full_name: 'maya rao' }, majorName: 'Data Science',
      optEadEndDate: '2026-06-01', stemEadEndDate: '2027-03-14' }, now);
    expect(fields.segment).toBe('runway');
    expect(fields.firstName).toBe('Maya');
    expect(fields.openingLine).toContain('March 14, 2027, about 144 days from now');
    expect(fields.jobsUrl).toBe('https://www.trackmyopt.com/dashboard/career/jobs?experience=entry&role=data&utm_source=outreach&utm_medium=email&utm_campaign=verified_jobs_2026_10');
  });

  it('skips the countdown under 30 days and falls back to the major line', () => {
    const fields = outreachFields({ majorName: 'Civil Engineering', optEadEndDate: '2026-11-01' }, now);
    expect(fields.segment).toBe('major');
    expect(fields.linkIntro).toBe('I set up a link that opens it on entry-level civil engineer roles:');
    expect(fields.jobsUrl).toContain('searchScope=title&query=civil+engineer');
  });

  it('marks only general accounts without a recent sign-in as not engaged', () => {
    expect(outreachFields({ lastSignInAt: '2026-10-01T00:00:00Z' }, now).engaged).toBe(true);
    expect(outreachFields({ lastSignInAt: '2026-08-01T00:00:00Z' }, now).engaged).toBe(false);
  });

  it('rejects handles and keeps mixed-case names', () => {
    expect(outreachFirstName(null, { name: 'user_123' })).toBeNull();
    expect(outreachFirstName(' DeShawn ', null)).toBe('DeShawn');
    expect(outreachFirstName(null, { first_name: 'ANA-MARIA' })).toBe('Ana-Maria');
  });
});

describe('verified jobs outreach rendering', () => {
  const source = { ...parseOutreachSource(readFileSync(resolve(directory, 'email.txt'), 'utf8')),
    html: readFileSync(resolve(directory, 'email.html'), 'utf8') };

  it('renders the real templates with no leftover fields and escapes HTML values', () => {
    const fields = outreachFields({ profileFirstName: 'O\'Neil', majorName: 'Computer Science' }, now);
    const email = renderOutreach(source, fields, '28 Geary St Ste 650 #1892, San Francisco, CA 94108');
    expect(email.subject).toBe('O\'Neil, quick one about your job search');
    expect(email.text).toContain('Hi O\'Neil,');
    expect(email.html).toContain('Hi O&#39;Neil,');
    expect(email.html).toContain('href="https://www.trackmyopt.com/dashboard/career/jobs?experience=entry&amp;role=engineering');
    expect(email.text).not.toContain('MERGE FIELDS');
  });

  it('uses the no-name subject', () => {
    const email = renderOutreach(source, outreachFields({}, now), '28 Geary St Ste 650 #1892, San Francisco, CA 94108');
    expect(email.subject).toBe('Quick one about your job search');
    expect(email.text).toContain('Hi there,');
  });
});
