/**
 * Supports both the direct Upstash variable names and the Vercel Marketplace
 * names injected by the Upstash Redis integration.
 *
 * `Redis.fromEnv()` in @upstash/redis resolves the same fallback pairs.
 */
export function hasUpstashRedisConfig(
  env: NodeJS.ProcessEnv = process.env
): boolean {
  const url =
    env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token =
    env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;

  return Boolean(url && token);
}
