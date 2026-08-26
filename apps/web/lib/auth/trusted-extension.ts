/**
 * Chrome Identity redirects are fixed to an extension-owned chromiumapp.org
 * origin. Never accept a caller-supplied web URL as a token recipient.
 */
export const PUBLISHED_EXTENSION_IDS = [
  'hfljbefkccdmlnhclfojlafipjnjbajm',
] as const;

const EXTENSION_ID_PATTERN = /^[a-p]{32}$/;
const MAX_EXTENSION_STATE_LENGTH = 512;

export function configuredExtensionIds(): Set<string> {
  const ids = new Set<string>(PUBLISHED_EXTENSION_IDS);
  for (const value of [
    process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID,
    process.env.CHROME_EXTENSION_IDS,
  ]) {
    for (const id of (value || '').split(',')) {
      const normalized = id.trim().toLowerCase();
      if (EXTENSION_ID_PATTERN.test(normalized)) ids.add(normalized);
    }
  }
  return ids;
}

export function isAllowedExtensionRedirectUri(value: string): boolean {
  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.port
    ) {
      return false;
    }

    const match = /^([a-p]{32})\.chromiumapp\.org$/i.exec(url.hostname);
    return match !== null && configuredExtensionIds().has(match[1].toLowerCase());
  } catch {
    return false;
  }
}

/** State is extension-controlled but still bounded before it is echoed back. */
export function isValidExtensionAuthState(value: string): boolean {
  return value.length > 0 && value.length <= MAX_EXTENSION_STATE_LENGTH;
}

/** Builds the final Chrome Identity URL without ever placing a token in HTML. */
export function buildExtensionTokenRedirectUrl(
  redirectUri: string,
  state: string,
  token: string
): URL {
  if (
    !isAllowedExtensionRedirectUri(redirectUri) ||
    !isValidExtensionAuthState(state)
  ) {
    throw new Error('Invalid extension redirect URI');
  }

  const target = new URL(redirectUri);
  target.hash = new URLSearchParams({ id_token: token, state }).toString();
  return target;
}
