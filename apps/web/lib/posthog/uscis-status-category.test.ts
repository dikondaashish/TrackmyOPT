import { describe, expect, it } from 'vitest';
import { normalizeStatusCategory } from './uscis-status-category';

describe('USCIS status categories', () => {
  it('recognizes USCIS processing and received RFE responses without a new action warning', () => {
    expect(normalizeStatusCategory('USCIS Is Currently Processing the Case')).toBe('pending');
    expect(normalizeStatusCategory("Response To USCIS’ Request For Evidence Was Received")).toBe('pending');
    expect(normalizeStatusCategory('Request for Additional Evidence Was Sent')).toBe('rfe');
    expect(normalizeStatusCategory('Notice of Intent to Deny Was Sent')).toBe('rfe');
  });
});
