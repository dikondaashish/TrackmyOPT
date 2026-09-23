import { expect, it } from 'vitest';
import { employerLogoDomain, normalizeCompanyDomain } from './company-domain';

it.each([
  'example.com',
  'https://example.com',
  'HTTP://WWW.EXAMPLE.COM/team?key=private',
  ' example.com ',
])('normalizes a website without keeping paths or queries: %s', (value) => {
  expect(normalizeCompanyDomain(value)).toBe('example.com');
});

it.each([
  undefined,
  null,
  123,
  {},
  '',
  'Example Corp',
  'javascript:alert(1)',
  'ftp://example.com',
  'https://user:password@example.com',
  'https://localhost',
  '127.0.0.1',
  'https://[::1]',
  'example.com:8080',
  'x.local',
  'bad..com',
  '-bad.com',
  'example.com\\@evil.com',
])('rejects unusable websites: %s', (value) => {
  expect(normalizeCompanyDomain(value)).toBeNull();
});

it('resolves verified legacy aliases, but never guesses other companies', () => {
  expect(employerLogoDomain('Zyene, inc.')).toBe('zyene.com');
  expect(employerLogoDomain('LightningMinds')).toBe('lightningminds.ai');
  expect(employerLogoDomain('Lightning Minds, Inc.')).toBe('lightningminds.ai');
  expect(employerLogoDomain('Unrecognized Company')).toBeNull();
  expect(employerLogoDomain('Zyene Consulting')).toBeNull();
  expect(employerLogoDomain('constructor')).toBeNull();
  expect(employerLogoDomain('https://example.com')).toBe('example.com');
  expect(employerLogoDomain('Zyene', 'my-company.com')).toBe('my-company.com');
});
