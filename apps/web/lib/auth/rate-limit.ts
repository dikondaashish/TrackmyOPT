import { NextRequest } from 'next/server';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export default function rateLimit(options?: Options) {
  const interval = options?.interval || 60000;
  const uniqueTokenPerInterval = options?.uniqueTokenPerInterval || 500;

  const tokenCache = new Map<string, number[]>();
  let lastCleanup = Date.now();

  return {
    check: (req: NextRequest, limit: number, token: string) => {
      const now = Date.now();

      // Cleanup every interval
      if (now - lastCleanup > interval) {
        tokenCache.clear();
        lastCleanup = now;
      }

      const tokenCount = tokenCache.get(token) || [0];
      if (tokenCount[0] === 0) {
        tokenCache.set(token, [1]);
      } else {
        tokenCount[0] += 1;
        tokenCache.set(token, tokenCount);
      }

      const currentUsage = tokenCount[0];
      const isRateLimited = currentUsage >= limit;

      return {
        isRateLimited,
        currentUsage,
        limit,
        remaining: isRateLimited ? 0 : limit - currentUsage,
      };
    },
  };
}

// --- Document upload rate limiting (DB-backed, 20 uploads/day) ---

const DAILY_UPLOAD_LIMIT = 20;

/** Returns the start-of-day (midnight UTC) reset timestamp for today */
function getResetAt(): Date {
  const now = new Date();
  const resetAt = new Date(now);
  resetAt.setUTCHours(24, 0, 0, 0); // next midnight UTC
  return resetAt;
}

/** Formats a human-readable string for time remaining until `resetAt` */
export function getTimeUntilReset(resetAt: Date): string {
  const now = new Date();
  const diff = resetAt.getTime() - now.getTime();
  if (diff <= 0) return 'now';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Check document upload rate limit for a user (20/day).
 * Queries the documents table for uploads since midnight UTC.
 */
export async function checkDocumentUploadRateLimit(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  message?: string;
}> {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('documents')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('uploaded_at', todayStart.toISOString());

  const used = error ? 0 : (count ?? 0);
  const remaining = Math.max(0, DAILY_UPLOAD_LIMIT - used);
  const resetAt = getResetAt();

  return {
    allowed: remaining > 0,
    remaining,
    resetAt,
    message: remaining <= 0
      ? `Daily upload limit (${DAILY_UPLOAD_LIMIT}) reached. Resets in ${getTimeUntilReset(resetAt)}.`
      : undefined,
  };
}

/**
 * Get rate limit status for a user (used by the rate-limit status endpoint).
 */
export async function getRateLimitStatus(userId: string): Promise<{
  remaining: number;
  resetAt: Date;
  allowed: boolean;
}> {
  const result = await checkDocumentUploadRateLimit(userId);
  return {
    remaining: result.remaining,
    resetAt: result.resetAt,
    allowed: result.allowed,
  };
}

