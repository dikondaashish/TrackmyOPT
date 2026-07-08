import { isBenignWebSocketError } from "@/lib/posthog/posthog-browser";

/** Non-fatal errors that should not trigger UX alerts or error_boundary events. */
export function isNonFatalBoundaryError(message: string): boolean {
  return isBenignWebSocketError(message);
}

export function formatBoundaryErrorMessage(
  error: Error & { digest?: string }
): string {
  const message = error.message?.trim();
  if (message) return message.slice(0, 500);
  if (error.name?.trim()) return error.name.trim().slice(0, 200);
  if (error.digest) return `digest:${error.digest}`.slice(0, 200);
  return "Unknown render error";
}

export function shouldReportBoundaryError(
  error: Error & { digest?: string }
): boolean {
  const message = formatBoundaryErrorMessage(error);
  return !isNonFatalBoundaryError(message);
}
