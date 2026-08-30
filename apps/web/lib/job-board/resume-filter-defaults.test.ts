import { describe, expect, it } from 'vitest';
import { deriveResumeJobFilters } from './resume-filter-defaults';

describe('deriveResumeJobFilters', () => {
  it('prefills broad, editable filters supported by the resume profile', () => {
    const filters = deriveResumeJobFilters({
      schemaVersion: 1,
      roleTitles: ['Senior Software Engineer'],
      skills: ['TypeScript', 'React'],
      certifications: [],
      education: [{ level: 'master', field: 'Computer Science' }],
      yearsExperience: 4,
      preferredLocations: ['Remote'],
      workplacePreferences: ['remote'],
    }, ['Palo Alto, CA', 'Remote, United States']);

    expect(filters).toMatchObject({
      searchScope: 'title_description',
      query: 'engineer',
      date: '30d',
      location: 'Remote, United States',
      workplace: 'remote',
      role: 'engineering',
      experience: 'mid',
    });
    expect(filters.degree).toBe('all');
    expect(filters.company).toBe('all');
    expect(filters.evidence).toBe('all');
  });

  it('does not invent location or workplace preferences absent from the resume', () => {
    const filters = deriveResumeJobFilters({
      schemaVersion: 1,
      roleTitles: ['Data Analyst'],
      skills: ['SQL'],
      certifications: [],
      education: [],
      yearsExperience: null,
    }, ['New York, NY']);

    expect(filters.location).toBe('all');
    expect(filters.workplace).toBe('all');
    expect(filters.query).toBe('analyst');
    expect(filters.role).toBe('data');
    expect(filters.experience).toBe('all');
  });
});
