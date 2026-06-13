import { PostHog } from "posthog-node";

/** Supports both env names used across deploy configs. */
export function resolvePostHogApiKey(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim() ||
    process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() ||
    undefined
  );
}

// Creates a fresh client per call — required because we always call shutdown()
// after each event to ensure flush in serverless / edge environments.
export function getPostHogClient(): PostHog | null {
  const apiKey = resolvePostHogApiKey();
  if (!apiKey) return null;

  return new PostHog(apiKey, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
}

export type PostHogEventProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

function stripUndefined(props?: PostHogEventProperties): PostHogEventProperties | undefined {
  if (!props) return undefined;
  const out: PostHogEventProperties = {};
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) out[key] = value;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Run PostHog work safely — analytics must never break product flows.
 */
export async function withPostHogClient(
  fn: (client: PostHog) => void | Promise<void>
): Promise<void> {
  const client = getPostHogClient();
  if (!client) return;

  try {
    await fn(client);
    await client.shutdown();
  } catch (error) {
    console.error("[PostHog] Failed to run server capture:", error);
  }
}

export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: PostHogEventProperties
): Promise<void> {
  await withPostHogClient((posthog) => {
    posthog.capture({
      distinctId,
      event,
      properties: stripUndefined(properties),
    });
  });
}

export async function identifyServerUser(
  distinctId: string,
  properties?: PostHogEventProperties
): Promise<void> {
  await withPostHogClient((posthog) => {
    posthog.identify({
      distinctId,
      properties: stripUndefined(properties),
    });
  });
}

export function normalizePlanTier(planId?: string | null): "pro" | "dedicated" | "free" {
  const value = (planId ?? "").toLowerCase();
  if (value === "dedicated") return "dedicated";
  if (value === "pro") return "pro";
  return "free";
}

export function normalizeBillingInterval(
  interval?: string | null
): "month" | "year" | undefined {
  const value = (interval ?? "").toLowerCase();
  if (value === "month" || value === "monthly") return "month";
  if (value === "year" || value === "yearly") return "year";
  return undefined;
}
