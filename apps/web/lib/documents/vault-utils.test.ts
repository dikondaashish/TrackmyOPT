import { describe, expect, it } from 'vitest';
import { daysUntilExpiry, documentTypeLabel, filterAndSortDocuments, formatExpiryDate, type VaultDocument } from './vault-utils';

function document(id: string, overrides: Partial<VaultDocument> = {}): VaultDocument {
  return {
    id,
    filename: `${id}.pdf`,
    documentType: 'other',
    category: 'other',
    issueDate: null,
    expiryDate: null,
    summary: '',
    extractedFields: {},
    aiConfidence: 0,
    uploadedAt: '2026-09-01T12:00:00Z',
    ...overrides,
  };
}

describe('document vault dates', () => {
  it('counts calendar days, including today, without UTC timezone drift', () => {
    const now = new Date(2026, 8, 24, 23, 30);
    expect(daysUntilExpiry('2026-09-23', now)).toBe(-1);
    expect(daysUntilExpiry('2026-09-24', now)).toBe(0);
    expect(daysUntilExpiry('2026-09-25', now)).toBe(1);
    expect(formatExpiryDate('2026-09-24', { month: 'short', day: 'numeric', year: 'numeric' })).toBe('Sep 24, 2026');
  });

  it('rejects impossible expiry dates', () => {
    expect(daysUntilExpiry('2026-02-30')).toBeNull();
    expect(daysUntilExpiry('not-a-date')).toBeNull();
    expect(daysUntilExpiry('2026-09-24anything')).toBeNull();
  });
});

describe('document vault filters', () => {
  const documents = [
    document('a', { filename: 'Passport.pdf', category: 'passport', expiryDate: '2030-01-01', uploadedAt: '2026-09-01T12:00:00Z' }),
    document('b', { filename: 'License.jpg', category: 'drivers_license', documentType: 'other', expiryDate: '2026-10-01', uploadedAt: '2026-09-02T12:00:00Z' }),
    document('c', { filename: 'Transcript.pdf', summary: 'School record', uploadedAt: '2026-09-03T12:00:00Z' }),
  ];

  it('filters by the updated category and searches filename, summary, and type', () => {
    expect(filterAndSortDocuments(documents, 'drivers_license', '', 'newest').map(doc => doc.id)).toEqual(['b']);
    expect(filterAndSortDocuments(documents, 'all', 'school', 'newest').map(doc => doc.id)).toEqual(['c']);
    expect(filterAndSortDocuments(documents, 'all', 'driver', 'newest').map(doc => doc.id)).toEqual(['b']);
  });

  it('sorts by expiry without hiding documents that have no expiry date', () => {
    expect(filterAndSortDocuments(documents, 'all', '', 'expiring-soon').map(doc => doc.id)).toEqual(['b', 'a', 'c']);
    expect(documents.map(doc => doc.id)).toEqual(['a', 'b', 'c']);
  });

  it('formats document types without mangling apostrophes or form names', () => {
    expect(documentTypeLabel("driver's_license")).toBe("Driver's License");
    expect(documentTypeLabel('i20')).toBe('I-20');
    expect(documentTypeLabel('dl')).toBe('DL');
  });
});
