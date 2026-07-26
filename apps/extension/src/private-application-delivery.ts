import {
  normalizeJobPortalHostname,
  type JobPortalLoginCredential,
} from './job-portal-login';
import type { SavedPrivateApplicationAnswers } from './sensitive-autofill';

export function hostnameFromSenderTabUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim() || value.length > 2048) {
    return null;
  }
  try {
    const url = new URL(value);
    if (
      (url.protocol !== 'https:' && url.protocol !== 'http:') ||
      url.username ||
      url.password
    ) {
      return null;
    }
    return normalizeJobPortalHostname(url.hostname);
  } catch {
    return null;
  }
}

/** Return the default only to a validated third-party http(s) tab. */
export function defaultPortalCredentialForSenderUrl(
  answers: SavedPrivateApplicationAnswers | null,
  senderTabUrl: unknown,
): JobPortalLoginCredential | null {
  if (!answers) return null;
  const hostname = hostnameFromSenderTabUrl(senderTabUrl);
  if (!hostname) return null;
  return answers.defaultJobPortalLogin ?? null;
}

/**
 * Minimize decrypted data at the service-worker boundary. A content script may
 * receive the one default credential only after its sender URL is validated.
 */
export function filterPrivateAnswersForSenderUrl(
  answers: SavedPrivateApplicationAnswers | null,
  senderTabUrl: unknown,
): SavedPrivateApplicationAnswers | null {
  if (!answers) return null;
  const {
    defaultJobPortalLogin: _defaultJobPortalLogin,
    ...nonCredentialAnswers
  } = answers;
  const credential = defaultPortalCredentialForSenderUrl(answers, senderTabUrl);
  return {
    ...nonCredentialAnswers,
    ...(credential ? { defaultJobPortalLogin: credential } : {}),
  };
}
