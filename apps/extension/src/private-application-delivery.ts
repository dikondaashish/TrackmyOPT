import {
  credentialForHostname,
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

/** Return at most the one credential authorized for the requesting tab URL. */
export function portalCredentialForSenderUrl(
  answers: SavedPrivateApplicationAnswers | null,
  senderTabUrl: unknown,
): JobPortalLoginCredential | null {
  if (!answers) return null;
  const hostname = hostnameFromSenderTabUrl(senderTabUrl);
  if (!hostname) return null;
  return credentialForHostname(answers.jobPortalLogins ?? [], hostname);
}

/**
 * Minimize decrypted data at the service-worker boundary. A content script may
 * receive the reviewed private answers, but never credentials for other sites.
 */
export function filterPrivateAnswersForSenderUrl(
  answers: SavedPrivateApplicationAnswers | null,
  senderTabUrl: unknown,
): SavedPrivateApplicationAnswers | null {
  if (!answers) return null;
  const { jobPortalLogins: _jobPortalLogins, ...nonCredentialAnswers } = answers;
  const credential = portalCredentialForSenderUrl(answers, senderTabUrl);
  return {
    ...nonCredentialAnswers,
    ...(credential ? { jobPortalLogins: [credential] } : {}),
  };
}
