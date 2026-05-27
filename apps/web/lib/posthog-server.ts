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
