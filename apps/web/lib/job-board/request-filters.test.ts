import { describe, expect, it } from 'vitest';
import { cleanSearchTerm, exactFilterValue } from './request-filters';

describe('job filter request values', () => {
  it('keeps exact location and company values, including commas', () => {
    expect(exactFilterValue('San Francisco, CA')).toBe('San Francisco, CA');
    expect(exactFilterValue('Anyscale, Inc.')).toBe('Anyscale, Inc.');
    expect(exactFilterValue('New York,  NY')).toBe('New York,  NY');
    expect(exactFilterValue('x'.repeat(1200))).toHaveLength(1000);
  });

  it('keeps search punctuation and only normalizes whitespace', () => {
    expect(cleanSearchTerm('  C++   (Qt), .NET ')).toBe('C++ (Qt), .NET');
    expect(cleanSearchTerm('full-stack')).toBe('full-stack');
    expect(cleanSearchTerm('a'.repeat(200))).toHaveLength(120);
  });
});
