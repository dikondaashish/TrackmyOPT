import { timingSafeEqual } from 'crypto';

export function bearerMatches(
  authorization: string | undefined,
  expected: string | undefined,
): boolean {
  const token = expected?.trim();
  if (!token) return false;
  const got = authorization?.startsWith('Bearer ')
    ? authorization.slice(7).trim()
    : '';
  const a = Buffer.from(got);
  const b = Buffer.from(token);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
