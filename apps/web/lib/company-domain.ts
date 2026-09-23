/** Keep only a public website hostname, never credentials, paths or query data. */
export function normalizeCompanyDomain(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim() || value.length > 2048)
    return null;
  const input = value.trim();
  if (/\s|\\/.test(input)) return null;
  try {
    const url = new URL(
      /^https?:\/\//i.test(input) ? input : `https://${input}`
    );
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.port
    )
      return null;
    const host = url.hostname
      .toLowerCase()
      .replace(/^www\./, '')
      .replace(/\.$/, '');
    const labels = host.split('.');
    if (
      host.length > 253 ||
      labels.length < 2 ||
      !/^[a-z]{2,63}$/.test(labels.at(-1)!)
    )
      return null;
    if (
      ['localhost', 'local', 'internal', 'test', 'invalid'].includes(
        labels.at(-1)!
      )
    )
      return null;
    return labels.every((label) =>
      /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)
    )
      ? host
      : null;
  } catch {
    return null;
  }
}

// Verified public websites for legacy records that predate saved domains.
// Sources: https://www.zyene.com/ and https://lightningminds.ai/about (2026-09-23).
// Exact aliases only: never invent a domain by appending ".com" to a name.
const LEGACY_DOMAINS: Readonly<Record<string, string>> = {
  zyene: 'zyene.com',
  zyeneinc: 'zyene.com',
  lightningminds: 'lightningminds.ai',
  lightningmindsinc: 'lightningminds.ai',
};

export function employerLogoDomain(
  name: string,
  domain?: string | null
): string | null {
  const key = name.toLowerCase().replace(/[\s.,]/g, '');
  return (
    normalizeCompanyDomain(domain) ||
    (Object.hasOwn(LEGACY_DOMAINS, key) ? LEGACY_DOMAINS[key] : null) ||
    normalizeCompanyDomain(name)
  );
}
