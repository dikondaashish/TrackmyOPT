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
