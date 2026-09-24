import { z } from 'zod';
import { normalizeKey } from './validation';

const ApplyBoltSchema = z.union([
  z.object({ found: z.literal(false) }),
  z.object({ found: z.literal(true), email: z.string().email(), validation: z.string().optional(), company: z.string().nullable().optional() }),
]);

export type EmailResult = { email: string | null; status: 'verified' | 'not_found' | 'unverified' | 'provider_error' };

// Shared interpretation for direct provider responses. This does not make
// browser-submitted results trusted evidence for a server-side write.
export function parseWorkEmailResult(value: unknown, expectedCompany: string): EmailResult {
  const parsed = ApplyBoltSchema.safeParse(value);
  if (!parsed.success) return { email: null, status: 'provider_error' };
  if (!parsed.data.found) return { email: null, status: 'not_found' };
  const expected = normalizeKey(expectedCompany);
  const providerCompany = normalizeKey(parsed.data.company ?? '');
  const companyMatches = Boolean(providerCompany) &&
    (providerCompany === expected || providerCompany.includes(`${expected}-`) || expected.includes(`${providerCompany}-`));
  if (parsed.data.validation === 'valid' && companyMatches) {
    return { email: parsed.data.email, status: 'verified' };
  }
  return { email: null, status: 'unverified' };
}
