import { PostHog } from "posthog-node";

/** Supports server-only and public env names used across deploy configs. */
function resolvePostHogApiKey(): string | undefined {
  return (
    process.env.POSTHOG_PROJECT_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim() ||
    process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() ||
    undefined
  );
}

// Creates a fresh client per call — required because we always call shutdown()
// after each event to ensure flush in serverless / edge environments.
function getPostHogClient(): PostHog | null {
  const apiKey = resolvePostHogApiKey();
  if (!apiKey) return null;

  return new PostHog(apiKey, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });
}

export type PostHogEventProperties = Record<
  string,
  string | number | boolean | null | undefined
> & { $insert_id?: string };

function stripUndefined(props?: PostHogEventProperties): PostHogEventProperties {
  if (!props) return {};
  const out: PostHogEventProperties = {};
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) out[key] = value;
  }
  return out;
}

function withServerDefaults(
  props?: PostHogEventProperties
): PostHogEventProperties | undefined {
  const merged = stripUndefined({
    ...props,
    capture_source: "server",
  });
  return Object.keys(merged).length > 0 ? merged : undefined;
}

/**
 * Run PostHog work safely — analytics must never break product flows.
 */
async function withPostHogClient(
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
  if (!distinctId?.trim()) {
    console.error("[PostHog] captureServerEvent called without distinctId:", event);
    return;
  }

  await withPostHogClient((posthog) => {
    // Identify first so server billing events merge onto the same person as
    // client identify(user.id) — required for checkout → payment funnels.
    posthog.identify({
      distinctId,
      properties: {
        capture_source: "server",
      },
    });
    posthog.capture({
      distinctId,
      event,
      properties: withServerDefaults({
        ...properties,
        // Explicit mirror for HogQL / debugging when person merges lag.
        supabase_user_id: distinctId,
      }),
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
      properties: withServerDefaults(properties),
    });
  });
}

type PostHogGroupClient = PostHog & {
  groupIdentify?: (args: {
    groupType: string;
    groupKey: string;
    properties?: Record<string, unknown>;
  }) => void;
};

/** Upsert a B2B2C partner group (university / campus ambassador). */
export async function identifyServerGroup(
  groupType: string,
  groupKey: string,
  properties?: PostHogEventProperties
): Promise<void> {
  const props = stripUndefined(properties);

  await withPostHogClient((posthog) => {
    const client = posthog as PostHogGroupClient;
    if (typeof client.groupIdentify === "function") {
      client.groupIdentify({ groupType, groupKey, properties: props });
      return;
    }

    client.capture({
      distinctId: groupKey,
      event: "$groupidentify",
      properties: {
        $group_type: groupType,
        $group_key: groupKey,
        $group_set: props,
        capture_source: "server",
      },
    });
  });
}

/** Link a user to a partner group for group-level analytics. */
export async function associateUserWithServerGroup(
  userId: string,
  groupType: string,
  groupKey: string
): Promise<void> {
  await withPostHogClient((posthog) => {
    const client = posthog as PostHogGroupClient & {
      capture: (args: {
        distinctId: string;
        event: string;
        properties?: Record<string, unknown>;
        groups?: Record<string, string>;
      }) => void;
    };

    client.capture({
      distinctId: userId,
      event: "partner_group_associated",
      groups: { [groupType]: groupKey },
      properties: withServerDefaults({
        partner_group_type: groupType,
        partner_group_key: groupKey,
      }),
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
