import { initPostHogBrowser } from "@/lib/posthog/posthog-browser";
import { registerCrossOriginErrorHandler } from "@/lib/cross-origin-error-handler";

registerCrossOriginErrorHandler();

try {
  initPostHogBrowser();
} catch (error) {
  console.warn("Third-party init failed: PostHog", error);
}
