import { describe, expect, it } from 'vitest';
import { normalizeDomain, normalizeLinkedInProfile, validateGroundedDiscovery } from './validation';

const names = ['Taylor One', 'Morgan Two', 'Jordan Three'];
const makeContact = (n: number, overrides: Record<string, unknown> = {}) => ({
  name: names[n - 1], title: 'Technical Recruiter', company: 'Microsoft',
  linkedinUrl: `https://www.linkedin.com/in/person-${n}`,
  relevanceReason: 'Recruiting for engineering', evidence: [], ...overrides,
});
const source = (n: number) => ({ uri: `https://www.linkedin.com/in/person-${n}`,
  title: `${names[n - 1]} - Technical Recruiter - Microsoft | LinkedIn` });
const validate = (contacts: unknown[], sources = [source(1), source(2), source(3)]) =>
  validateGroundedDiscovery({ discovery: { company: { name: 'Microsoft', domain: 'microsoft.com' }, contacts },
    requestedCompany: 'Microsoft', requestedDomain: 'microsoft.com', sources });

describe('grounded contact validation', () => {
  it('normalizes only public LinkedIn profile URLs', () => {
    expect(normalizeLinkedInProfile('http://m.linkedin.com/in/Example-Name/?trk=abc'))
      .toBe('https://www.linkedin.com/in/example-name');
    expect(normalizeLinkedInProfile('https://ro.linkedin.com/in/irina-craciun'))
      .toBe('https://www.linkedin.com/in/irina-craciun');
    for (const url of ['https://linkedin.com/company/acme', 'https://linkedin.com/jobs/1',
      'https://linkedin.com/in/example', 'https://linkedin.com.evil.com/in/person-1',
      'https://linkedin.com/search/results/people/', 'https://linkedin.com/in/your-name']) {
      expect(normalizeLinkedInProfile(url)).toBeNull();
    }
    expect(normalizeDomain('https://www.microsoft.com/about')).toBe('microsoft.com');
  });

  it.each([0, 1, 2, 3])('keeps exactly %i grounded contacts', (count) => {
    expect(validate(Array.from({ length: count }, (_, index) => makeContact(index + 1))).contacts).toHaveLength(count);
  });

  it('drops duplicate, unsupported, former-employee, and fabricated profiles', () => {
    const contacts = [makeContact(1), makeContact(1),
      makeContact(2, { company: 'Former Company' })];
    expect(validate(contacts).contacts.map((c) => c.name)).toEqual(['Taylor One']);
    expect(validate([makeContact(3, { linkedinUrl: 'https://linkedin.com/in/made-up' })]).contacts).toEqual([]);
    expect(validate([makeContact(1)], []).contacts).toEqual([]);
    expect(validate([makeContact(1)], [{ ...source(1), title: 'Taylor One - Former Company' }]).contacts).toEqual([]);
  });

  it('rejects wrong company identity or domain even with profile evidence', () => {
    const result = validateGroundedDiscovery({
      discovery: { company: { name: 'Other Microsoft', domain: 'other.com' }, contacts: [makeContact(1)] },
      requestedCompany: 'Microsoft', requestedDomain: 'microsoft.com', sources: [source(1)],
    });
    expect(result.contacts).toEqual([]);
  });

  it('accepts separate grounded profile and employer sources for the same person', () => {
    const result = validate([makeContact(1)], [
      { uri: 'https://www.linkedin.com/in/person-1', title: 'Taylor One | LinkedIn' },
      { uri: 'https://careers.microsoft.com/team/taylor', title: 'Taylor One - Technical Recruiter - Microsoft' },
    ]);
    expect(result.contacts).toHaveLength(1);
    expect(result.contacts[0].evidence).toHaveLength(2);
  });

  it('does not adopt a model-supplied company domain without a company source', () => {
    const result = validateGroundedDiscovery({
      discovery: { company: { name: 'Microsoft', domain: 'microsoft.com' }, contacts: [makeContact(1)] },
      requestedCompany: 'Microsoft', requestedDomain: null, sources: [source(1)],
    });
    expect(result.contacts).toHaveLength(0);
    expect(result.companyDomain).toBeNull();
  });
});
