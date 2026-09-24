export interface VaultDocument {
  id: string;
  filename: string;
  documentType: string;
  category: string;
  issueDate: string | null;
  expiryDate: string | null;
  summary: string;
  extractedFields: Record<string, unknown>;
  aiConfidence: number;
  uploadedAt: string;
  fileType?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function calendarParts(value: string | null): [number, number, number] | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return [year, month, day];
}

export function isValidExpiryDate(value: string | null): boolean {
  return calendarParts(value) !== null;
}

export function daysUntilExpiry(value: string | null, now = new Date()): number | null {
  const parts = calendarParts(value);
  if (!parts) return null;
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((Date.UTC(parts[0], parts[1] - 1, parts[2]) - today) / DAY_MS);
}

export function formatExpiryDate(value: string | null, options: Intl.DateTimeFormatOptions): string | null {
  const parts = calendarParts(value);
  if (!parts) return null;
  return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' })
    .format(new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])));
}

export function documentTypeLabel(value: string): string {
  const labels: Record<string, string> = {
    i20: 'I-20', i983: 'I-983', ead_card: 'EAD Card', receipt_notice: 'Receipt Notice',
  };
  if (labels[value]) return labels[value];
  if (/^[a-z]{1,3}$/.test(value) && value !== 'visa') return value.toUpperCase();
  return value.replace(/_/g, ' ').replace(/(^|\s)\S/g, letter => letter.toUpperCase());
}

export function filterAndSortDocuments(
  documents: VaultDocument[],
  category: string,
  search: string,
  sort: string,
): VaultDocument[] {
  const query = search.trim().toLocaleLowerCase();
  const filtered = documents.filter(doc =>
    (category === 'all' || (doc.category || doc.documentType) === category) &&
    (!query || [doc.filename, doc.summary, documentTypeLabel(doc.category || doc.documentType)]
      .some(value => value.toLocaleLowerCase().includes(query)))
  );

  return filtered.sort((a, b) => {
    if (sort === 'name') return a.filename.localeCompare(b.filename);
    if (sort === 'expiring-soon') {
      const aDate = calendarParts(a.expiryDate);
      const bDate = calendarParts(b.expiryDate);
      const aTime = aDate ? Date.UTC(aDate[0], aDate[1] - 1, aDate[2]) : Infinity;
      const bTime = bDate ? Date.UTC(bDate[0], bDate[1] - 1, bDate[2]) : Infinity;
      return aTime - bTime || a.filename.localeCompare(b.filename);
    }
    const difference = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
    return (sort === 'oldest' ? difference : -difference) || a.filename.localeCompare(b.filename);
  });
}
