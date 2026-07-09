import { timingSafeEqual } from "crypto";

/**
 * Constant-time string comparison for secrets (bearer tokens, admin/cron keys).
 * Returns false on length mismatch. Mirrors the inline pattern already used in
 * app/api/notifications/track-click/route.ts.
 */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
