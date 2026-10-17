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
    }, ['state:CA', 'city:Palo Alto, CA', 'remote:us']);

    expect(filters).toMatchObject({
      searchScope: 'title_description',
      query: 'engineer',
      date: '30d',
      places: ['remote:us'],
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
    }, ['state:NY', 'city:New York, NY']);

    expect(filters.places).toEqual([]);
    expect(filters.workplace).toBe('all');
    expect(filters.query).toBe('analyst');
    expect(filters.role).toBe('data');
    expect(filters.experience).toBe('all');
  });

  it('maps a resume location to its city, else its state, among open places', () => {
    const profile = {
      schemaVersion: 1 as const,
      roleTitles: ['Data Analyst'],
      skills: [],
      certifications: [],
      education: [],
      yearsExperience: null,
    };
    expect(deriveResumeJobFilters({ ...profile, preferredLocations: ['Boston, MA'] }, ['state:MA', 'city:Boston, MA']).places).toEqual(['city:Boston, MA']);
    expect(deriveResumeJobFilters({ ...profile, preferredLocations: ['Cambridge, Massachusetts'] }, ['state:MA']).places).toEqual(['state:MA']);
    expect(deriveResumeJobFilters({ ...profile, preferredLocations: ['London', 'Austin, TX'] }, ['state:TX']).places).toEqual(['state:TX']);
    expect(deriveResumeJobFilters({ ...profile, preferredLocations: ['London'] }, ['state:TX']).places).toEqual([]);
  });
});
