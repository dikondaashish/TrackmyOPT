import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

/**
 * Signed "stop case emails" link for the emails Free accounts get about a
 * saved case. The token carries the account id only, never an address, and
 * has no expiry, so the link in an old email keeps working.
 */
function sign(userId: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(`case-email-optout-v1:${userId}`)
    .digest('base64url');
}

export function createCaseEmailOptOutToken(
  userId: string,
  secret: string
): string {
  if (!secret || !z.string().uuid().safeParse(userId).success)
    throw new Error('Invalid case email opt-out configuration');
  return `${userId}.${sign(userId, secret)}`;
}

export function verifyCaseEmailOptOutToken(
  token: string | null,
  secret: string | undefined
): string | null {
  if (!token || !secret || token.length > 128) return null;
  const [userId, signed, extra] = token.split('.');
  if (extra || !signed || !z.string().uuid().safeParse(userId).success)
    return null;
  const expected = Buffer.from(sign(userId!, secret));
  const actual = Buffer.from(signed);
  return actual.length === expected.length && timingSafeEqual(actual, expected)
    ? userId!
    : null;
}

export function caseEmailOptOutLink(
  baseUrl: string,
  userId: string,
  secret: string
): string {
  return `${baseUrl.replace(/\/$/, '')}/api/email/case-updates/unsubscribe?token=${encodeURIComponent(
    createCaseEmailOptOutToken(userId, secret)
  )}`;
}
