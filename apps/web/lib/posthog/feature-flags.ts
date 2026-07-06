import { withPostHogClient } from "@/lib/posthog-server";

type FeatureFlagValue = string | boolean | undefined;

/**
 * Server-side feature flag lookup (posthog-node). Uses the shared PostHog client
 * helper — does not create a separate init path.
 */
export async function getFeatureFlag(
  distinctId: string,
  flagKey: string
): Promise<FeatureFlagValue> {
  let result: FeatureFlagValue = undefined;

  await withPostHogClient(async (client) => {
    result = await client.getFeatureFlag(flagKey, distinctId);
  });

  return result;
}
