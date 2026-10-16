import type { JobStoreSearch } from './job-data-store.contract';
import {
  ORACLE_DESCRIPTION_FLAG_MASKS,
  ORACLE_DESCRIPTION_FLAGS,
} from './oracle-job-data-helpers';
import {
  ROLE_TITLE_TERMS,
  buildOracleJobSearchFilter,
  oracleJobOrderBy,
  oracleLikeContains,
  oracleWholeWordPattern,
} from './oracle-job-search-query';

function build(filters: Partial<JobStoreSearch>) {
  return buildOracleJobSearchFilter({ page: 1, pageSize: 50, ...filters });
}

/** Emulates Oracle's POSIX `[[:alnum:]]` class so the bound pattern can run in Jest. */
function toJsRegExp(pattern: string) {
  return new RegExp(pattern.replace(/\[:alnum:\]/g, '\\p{L}\\p{N}'), 'u');
}

describe('oracleJobOrderBy', () => {
  it('sorts by posting date, falling back to first seen, newest first', () => {
    expect(oracleJobOrderBy(undefined)).toBe(
      'COALESCE(posted_at, first_seen_at) DESC NULLS LAST, id ASC',
    );
    expect(oracleJobOrderBy('posted_at')).toBe(oracleJobOrderBy(undefined));
  });

  it('keeps the explicit last-confirmed order', () => {
    expect(oracleJobOrderBy('last_confirmed_at')).toBe(
      'last_confirmed_at DESC NULLS LAST, id ASC',
    );
  });
});

describe('buildOracleJobSearchFilter', () => {
  it('filters dates on the same posting timestamp the feed sorts by', () => {
    const { where, filterBinds } = build({
      postedAfter: '2026-10-15T02:00:00.000Z',
    });
    expect(where).toContain(
      'COALESCE(posted_at, first_seen_at) >= TO_TIMESTAMP_TZ(:postedAfter',
    );
    expect(filterBinds.postedAfter).toBe('2026-10-15T02:00:00.000+00:00');
  });

  it('limits the title scope to titles only', () => {
    const { where, filterBinds } = build({
      query: 'Analyst',
      searchScope: 'title',
    });
    expect(where).toContain("LOWER(title) LIKE :query ESCAPE '\\'");
    expect(where).not.toMatch(/company_name|search_text/);
    expect(filterBinds.query).toBe('%analyst%');
  });

  it('searches title and description, not company names, by default', () => {
    const { where } = build({ query: 'analyst' });
    expect(where).toContain("LOWER(title) LIKE :query ESCAPE '\\'");
    expect(where).toContain('CONTAINS(s.search_text_index, :queryToken, 1)');
    expect(where).not.toContain('company_name');
    expect(where).not.toContain('employer_board_name');
  });

  it('treats LIKE wildcards in user input literally', () => {
    expect(oracleLikeContains('100%_Remote\\')).toBe('%100\\%\\_remote\\\\%');
  });

  it('keeps jobs with empty optional columns when excluding a keyword', () => {
    const { where } = build({ exclude: 'senior' });
    expect(where).toContain(
      "(department IS NULL OR LOWER(department) NOT LIKE :exclude ESCAPE '\\')",
    );
    expect(where).toContain(
      "(location IS NULL OR LOWER(location) NOT LIKE :exclude ESCAPE '\\')",
    );
    expect(where).toContain('NOT EXISTS');
  });

  it('keeps jobs without a URL in the not-saved scope', () => {
    const { where } = build({ excludeJobUrls: ['https://example.test/a'] });
    expect(where).toContain(
      '(job_url IS NULL OR job_url NOT IN (:excludeUrl0))',
    );
  });

  it.each([
    ['data', 'Senior Data Analyst', true],
    ['data', 'AI/ML Engineer', true],
    ['data', 'Maintenance Technician', false],
    ['data', 'Retail Associate', false],
    ['data', 'HTML Email Developer', false],
    ['design', 'Build Engineer', false],
    ['design', 'Quality Assurance Lead', false],
    ['design', 'Senior UI Designer', true],
    ['engineering', 'Staff Software Engineer', true],
    ['engineering', 'Measurement Lead', false],
  ] as const)(
    'matches %s role words in "%s" -> %s',
    (role, title, expected) => {
      const { where, filterBinds } = build({ role });
      expect(where).toBe(
        "source_trust_tier = 'verified_ats' AND listing_status = 'open' AND REGEXP_LIKE(LOWER(title), :role)",
      );
      expect(
        toJsRegExp(String(filterBinds.role)).test(title.toLowerCase()),
      ).toBe(expected);
    },
  );

  it('defines the other role as titles with no known role word', () => {
    const { where, filterBinds } = build({ role: 'other' });
    expect(where).toContain('NOT REGEXP_LIKE(LOWER(title), :roleAny)');
    expect(filterBinds.roleAny).toBe(
      oracleWholeWordPattern(Object.values(ROLE_TITLE_TERMS).flat()),
    );
    const pattern = toJsRegExp(String(filterBinds.roleAny));
    expect(pattern.test('chief of staff')).toBe(false);
    expect(pattern.test('ai research lead')).toBe(true);
  });

  it('matches internship titles by whole word only', () => {
    const { filterBinds } = build({ jobType: 'internship' });
    const pattern = toJsRegExp(String(filterBinds.jobType_internship));
    expect(pattern.test('software engineering intern')).toBe(true);
    expect(pattern.test('summer internship, data')).toBe(true);
    expect(pattern.test('internal tools engineer')).toBe(false);
    expect(pattern.test('international tax manager')).toBe(false);
  });

  it('uses max-experience semantics', () => {
    const { experienceEntry, experienceSenior } = ORACLE_DESCRIPTION_FLAGS;
    const all = ORACLE_DESCRIPTION_FLAG_MASKS.experiences;
    expect(build({ experience: 'entry' }).where).toContain(
      `, ${all}) = ${experienceEntry}`,
    );
    const mid = build({ experience: 'mid' }).where;
    expect(mid).toContain(`, ${all}) != 0`);
    expect(mid).toContain(`, ${experienceSenior}) = 0`);
    expect(build({ experience: 'senior' }).where).toContain(`, ${all}) != 0`);
    expect(build({ experience: 'unspecified' }).where).toContain(
      `, ${all}) = 0`,
    );
  });

  it('partitions workplace with location taking precedence', () => {
    const remote = build({ workplace: 'remote' }).where;
    expect(remote).toContain("NOT NVL(LOWER(location), ' ') LIKE '%hybrid%'");
    expect(remote).toContain("NVL(LOWER(location), ' ') LIKE '%remote%'");
    const unspecified = build({ workplace: 'unspecified' }).where;
    expect(unspecified).toContain(
      "NOT NVL(LOWER(location), ' ') LIKE '%remote%'",
    );
    expect(unspecified).not.toMatch(/\bLOWER\(location\) NOT LIKE/);
  });
});
