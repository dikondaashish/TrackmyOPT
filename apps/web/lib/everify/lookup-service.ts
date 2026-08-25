import { Redis } from "@upstash/redis";
import { hasUpstashRedisConfig } from "@/lib/upstash-redis";
import {
  fetchRobotsPolicy,
  normalizeCompanyName,
  queryEVerifyLive,
  selectBestEmployerMatch,
} from "./live-lookup";
import type {
  CachedEVerifyLookup,
  EVerifyLookupResponse,
} from "./types";

const CACHE_TTL_SECONDS = 24 * 60 * 60;
const LOCK_TTL_SECONDS = 240;
const LOCK_WAIT_MS = 230_000;
const LOCK_POLL_MS = 1_000;
const CACHE_PREFIX = "trackmyopt:everify:cache:";
const LOCK_PREFIX = "trackmyopt:everify:lock:";
const CRAWL_SCHEDULE_KEY = "trackmyopt:everify:crawl-schedule";
const USER_AGENT = `TrackMyOPT-EVerifyEmployerLookup/1.0 (+https://www.trackmyopt.com; contact=${
  process.env.EVERIFY_CONTACT_EMAIL || "support@trackmyopt.com"
})`;

const RESERVE_CRAWL_SLOT_SCRIPT = `
local now = tonumber(ARGV[1])
local delay = tonumber(ARGV[2])
local current = tonumber(redis.call('GET', KEYS[1]) or '0')
local scheduled = math.max(now, current)
local next_slot = scheduled + delay
redis.call('SET', KEYS[1], next_slot, 'PX', math.max(delay * 2, 60000))
return scheduled
`;

const RELEASE_LOCK_SCRIPT = `
if redis.call('GET', KEYS[1]) == ARGV[1] then
  return redis.call('DEL', KEYS[1])
end
return 0
`;

const localCache = new Map<string, CachedEVerifyLookup>();
const inFlight = new Map<string, Promise<EVerifyLookupResponse>>();
let localNextCrawlSlot = 0;

export class EVerifyLookupUnavailableError extends Error {}

function cacheKey(companyKey: string) {
  return `${CACHE_PREFIX}${companyKey}`;
}

function lockKey(companyKey: string) {
  return `${LOCK_PREFIX}${companyKey}`;
}

function getRedis(): Redis | null {
  return hasUpstashRedisConfig() ? Redis.fromEnv() : null;
}

function isFresh(entry: CachedEVerifyLookup): boolean {
  const checkedAt = Date.parse(entry.cached_at);
  return (
    Number.isFinite(checkedAt) &&
    Date.now() - checkedAt >= 0 &&
    Date.now() - checkedAt < CACHE_TTL_SECONDS * 1_000
  );
}

function fromCache(entry: CachedEVerifyLookup): EVerifyLookupResponse {
  const { cached_at, ...result } = entry;
  return {
    ...result,
    source: "cache",
    last_checked: cached_at,
  };
}

async function readCache(
  redis: Redis | null,
  companyKey: string
): Promise<CachedEVerifyLookup | null> {
  const entry = redis
    ? await redis.get<CachedEVerifyLookup>(cacheKey(companyKey))
    : localCache.get(companyKey) ?? null;
  return entry && isFresh(entry) ? entry : null;
}

async function writeCache(
  redis: Redis | null,
  companyKey: string,
  entry: CachedEVerifyLookup
): Promise<void> {
  if (redis) {
    await redis.set(cacheKey(companyKey), entry, { ex: CACHE_TTL_SECONDS });
  } else {
    localCache.set(companyKey, entry);
  }
}

async function waitForCache(
  redis: Redis,
  companyKey: string
): Promise<CachedEVerifyLookup | null> {
  const deadline = Date.now() + LOCK_WAIT_MS;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, LOCK_POLL_MS));
    const cached = await readCache(redis, companyKey);
    if (cached) return cached;
  }
  return null;
}

function createCrawlGate(redis: Redis | null, delaySeconds: number) {
  const delayMs = Math.max(0, Math.ceil(delaySeconds * 1_000));
  return async () => {
    const now = Date.now();
    let scheduledAt: number;
    if (redis) {
      scheduledAt = Number(
        await redis.eval(
          RESERVE_CRAWL_SLOT_SCRIPT,
          [CRAWL_SCHEDULE_KEY],
          [String(now), String(delayMs)]
        )
      );
    } else {
      scheduledAt = Math.max(now, localNextCrawlSlot);
      localNextCrawlSlot = scheduledAt + delayMs;
    }
    const waitMs = scheduledAt - now;
    if (waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  };
}

async function performLiveLookup(
  redis: Redis | null,
  company: string,
  companyKey: string
): Promise<EVerifyLookupResponse> {
  const robots = await fetchRobotsPolicy(USER_AGENT);
  const records = await queryEVerifyLive(
    company,
    USER_AGENT,
    createCrawlGate(redis, robots.crawlDelaySeconds)
  );
  const match = selectBestEmployerMatch(company, records);
  const checkedAt = new Date().toISOString();
  const entry: CachedEVerifyLookup = match
    ? {
        company,
        found: true,
        ...match,
        cached_at: checkedAt,
      }
    : {
        company,
        found: false,
        employer_name: null,
        dba_name: null,
        status: null,
        enrollment_date: null,
        termination_date: null,
        workforce_size_band: null,
        hiring_site_states: [],
        cached_at: checkedAt,
        message:
          "No confident employer match was found in the public E-Verify Employer Search tool.",
      };
  await writeCache(redis, companyKey, entry);
  return {
    ...fromCache(entry),
    source: "live",
  };
}

async function lookupWithDistributedLock(
  company: string,
  companyKey: string
): Promise<EVerifyLookupResponse> {
  const redis = getRedis();
  if (!redis && process.env.NODE_ENV === "production") {
    throw new EVerifyLookupUnavailableError(
      "Shared E-Verify cache and crawl protection are not configured"
    );
  }

  const cached = await readCache(redis, companyKey);
  if (cached) return fromCache(cached);
  if (!redis) return performLiveLookup(null, company, companyKey);

  const token = crypto.randomUUID();
  const acquired = await redis.set(lockKey(companyKey), token, {
    nx: true,
    ex: LOCK_TTL_SECONDS,
  });
  if (!acquired) {
    const completed = await waitForCache(redis, companyKey);
    if (completed) return fromCache(completed);
    throw new EVerifyLookupUnavailableError(
      "Another lookup did not complete before the wait window expired"
    );
  }

  try {
    const refreshed = await readCache(redis, companyKey);
    if (refreshed) return fromCache(refreshed);
    return await performLiveLookup(redis, company, companyKey);
  } finally {
    try {
      await redis.eval(RELEASE_LOCK_SCRIPT, [lockKey(companyKey)], [token]);
    } catch (error) {
      console.error("[everify-lookup] Failed to release lookup lock", error);
    }
  }
}

export async function lookupEVerifyCompany(
  company: string
): Promise<EVerifyLookupResponse> {
  const companyKey = normalizeCompanyName(company);
  const existing = inFlight.get(companyKey);
  if (existing) {
    await existing;
    const cached = await readCache(getRedis(), companyKey);
    if (cached) return fromCache(cached);
    throw new EVerifyLookupUnavailableError(
      "The in-flight lookup completed without a cache result"
    );
  }

  const lookup = lookupWithDistributedLock(company, companyKey).finally(() => {
    inFlight.delete(companyKey);
  });
  inFlight.set(companyKey, lookup);
  return lookup;
}

export const everifyLookupConfig = {
  cacheTtlSeconds: CACHE_TTL_SECONDS,
  maxRetries: 3,
};
