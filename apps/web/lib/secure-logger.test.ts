import { describe, expect, it } from 'vitest';
import { dbErrorCode } from './secure-logger';

describe('dbErrorCode', () => {
  it('returns PostgreSQL and PostgREST codes', () => {
    expect(dbErrorCode({ code: '57014', message: 'canceling statement due to statement timeout' })).toBe('57014');
    expect(dbErrorCode({ code: 'PGRST301', message: 'JWT expired' })).toBe('PGRST301');
  });

  it('never returns free text that could carry row data', () => {
    expect(dbErrorCode({ code: 'a@b.com', message: 'x' })).toBe('unknown');
    expect(dbErrorCode({ code: '', message: 'TypeError: fetch failed' })).toBe('unknown');
    expect(dbErrorCode(new TypeError('fetch failed'))).toBe('exception');
    expect(dbErrorCode(null)).toBe('unknown');
  });
});
