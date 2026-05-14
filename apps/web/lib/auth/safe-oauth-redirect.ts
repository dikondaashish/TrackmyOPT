/**
 * Sanitize `next` (or similar) query params after OAuth so we never redirect
 * to an external origin (open redirect). Used by /auth/callback routes only.
 */

const ALLOWED_PATH_PREFIXES = [
  '/dashboard',
  '/premium',
  '/settings',
  '/documents',
  '/login',
] as const;

/**
 * Returns a same-origin URL safe for NextResponse.redirect.
 * Rejects absolute URLs, protocol-relative URLs, backslashes, and unknown path prefixes.
 */
export function safeInternalRedirectTarget(
  nextParam: string | null,
  baseUrl: string,
): URL {
  const base = new URL(baseUrl);
  const fallback = new URL('/dashboard', base);

  if (nextParam == null) return fallback;

  const trimmed = nextParam.trim();
  if (trimmed.length === 0) return fallback;
  if (trimmed.includes('\\')) return fallback;
  if (trimmed.includes('://')) return fallback;
  if (!trimmed.startsWith('/')) return fallback;
  if (trimmed.startsWith('//')) return fallback;

  let pathAndQuery = trimmed;
  try {
    pathAndQuery = decodeURIComponent(trimmed);
  } catch {
    return fallback;
  }

  if (pathAndQuery.includes('\\')) return fallback;
  if (pathAndQuery.includes('://')) return fallback;
  if (!pathAndQuery.startsWith('/')) return fallback;
  if (pathAndQuery.startsWith('//')) return fallback;

  const pathPart = pathAndQuery.split('?')[0]?.split('#')[0] ?? '';
  if (!pathPart.startsWith('/') || pathPart.startsWith('//')) return fallback;

  const normalizedPath =
    pathPart.length === 1 && pathPart === '/'
      ? '/'
      : '/' +
        pathPart
          .replace(/^\/+/, '')
          .split('/')
          .filter((seg) => seg.length > 0 && seg !== '.' && seg !== '..')
          .join('/');

  if (normalizedPath === '/') {
    return fallback;
  }

  const allowed = ALLOWED_PATH_PREFIXES.some(
    (p) => normalizedPath === p || normalizedPath.startsWith(`${p}/`),
  );
  if (!allowed) return fallback;

  try {
    const target = new URL(pathAndQuery, base);
    if (target.origin !== base.origin) return fallback;
    return target;
  } catch {
    return fallback;
  }
}
