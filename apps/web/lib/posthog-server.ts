import { PostHog } from "posthog-node";

// Creates a fresh client per call — required because we always call shutdown()
// after each event to ensure flush in serverless / edge environments.
export function getPostHogClient(): PostHog {
  return new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
}
