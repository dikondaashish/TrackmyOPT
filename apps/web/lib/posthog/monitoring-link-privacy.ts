/** Signed email capabilities stay out of analytics URL properties. */
export function redactMonitoringLink(value: string): string {
  try {
    const url = new URL(value, 'https://www.trackmyopt.com');
    if (url.pathname === '/premium/monitoring') {
      url.search = '';
      url.hash = '';
      return url.toString();
    }
    if (
      url.pathname === '/login' &&
      ['returnTo', 'redirect'].some((key) =>
        url.searchParams.get(key)?.includes('/premium/monitoring')
      )
    ) {
      url.search = '';
      url.hash = '';
      return url.toString();
    }
  } catch {
    /* Not a URL property. */
  }
  return value;
}
export function redactMonitoringAnalytics(value: unknown, depth = 0): unknown {
  if (typeof value === 'string') return redactMonitoringLink(value);
  if (!value || typeof value !== 'object' || depth >= 10) return value;
  if (Array.isArray(value))
    return value.map((item) => redactMonitoringAnalytics(item, depth + 1));
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      redactMonitoringAnalytics(item, depth + 1),
    ])
  );
}
export function isMonitoringCapabilityPage(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.pathname === '/premium/monitoring' ||
      (parsed.pathname === '/login' &&
        ['returnTo', 'redirect'].some((key) =>
          parsed.searchParams.get(key)?.includes('/premium/monitoring')
        ))
    );
  } catch {
    return false;
  }
}
