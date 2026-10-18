const SITE_HOST = 'www.trackmyopt.com';
/** Public key, also served at /trackmyopt2026indexnow.txt; `INDEXNOW_KEY` overrides it. */
const INDEXNOW_KEY_FALLBACK = 'trackmyopt2026indexnow';

/** Submit absolute site URLs to IndexNow. Returns the HTTP status (200/202 = accepted). */
export async function submitIndexNow(urls: string[]): Promise<number> {
  const key = process.env.INDEXNOW_KEY?.trim() || INDEXNOW_KEY_FALLBACK;
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: SITE_HOST,
      key,
      keyLocation: `https://${SITE_HOST}/${key}.txt`,
      urlList: urls,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  return response.status;
}
