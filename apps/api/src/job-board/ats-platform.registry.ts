export type PriorityAtsPlatform =
  | 'greenhouse'
  | 'lever'
  | 'ashby'
  | 'workday'
  | 'smartrecruiters'
  | 'workable'
  | 'recruitee'
  | 'personio'
  | 'bamboohr'
  | 'breezy';

export type AtsBoardIdentity = {
  platform: PriorityAtsPlatform;
  boardToken: string;
  boardUrl: string;
  discoveredFromUrl: string;
  workday?: {
    tenant: string;
    shard: string;
    site: string;
  };
};

export type AtsPlatformPlugin = {
  platform: PriorityAtsPlatform;
  displayName: string;
  fetchAdapter: PriorityAtsPlatform;
  accessMode: 'public_api' | 'public_career_page';
  defaultRequestsPerMinute: number;
  defaultRequestsPerDay: number;
  urlHosts: readonly string[];
  detect(url: URL): AtsBoardIdentity | null;
};

const LOCALE_PATH = /^[a-z]{2,3}(?:-[a-z]{2})?$/i;
const HOST_LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

function pathParts(url: URL) {
  return url.pathname.split('/').filter(Boolean);
}

function validToken(value: string | undefined) {
  return value && HOST_LABEL.test(value) ? value : null;
}

function validTenantSubdomain(value: string | undefined) {
  const token = validToken(value);
  return token &&
    !['www', 'api', 'app', 'support'].includes(token.toLowerCase())
    ? token
    : null;
}

function identity(
  platform: PriorityAtsPlatform,
  boardToken: string,
  boardUrl: string,
  url: URL,
  workday?: AtsBoardIdentity['workday'],
): AtsBoardIdentity {
  return {
    platform,
    boardToken,
    boardUrl,
    discoveredFromUrl: url.toString(),
    ...(workday ? { workday } : {}),
  };
}

function slugFromApiPath(parts: string[], marker: string) {
  const index = parts.findIndex(
    (part) => part.toLowerCase() === marker.toLowerCase(),
  );
  return index >= 0 ? validToken(parts[index + 1]) : null;
}

const plugins: AtsPlatformPlugin[] = [
  {
    platform: 'greenhouse',
    displayName: 'Greenhouse',
    fetchAdapter: 'greenhouse',
    accessMode: 'public_api',
    defaultRequestsPerMinute: 5,
    defaultRequestsPerDay: 250,
    urlHosts: [
      'boards.greenhouse.io',
      'job-boards.greenhouse.io',
      'boards-api.greenhouse.io',
    ],
    detect(url) {
      const parts = pathParts(url);
      const token =
        url.hostname === 'boards-api.greenhouse.io'
          ? slugFromApiPath(parts, 'boards')
          : validToken(parts[0]);
      return token
        ? identity(
            'greenhouse',
            token,
            `https://job-boards.greenhouse.io/${token}`,
            url,
          )
        : null;
    },
  },
  {
    platform: 'lever',
    displayName: 'Lever',
    fetchAdapter: 'lever',
    accessMode: 'public_api',
    defaultRequestsPerMinute: 5,
    defaultRequestsPerDay: 250,
    urlHosts: ['jobs.lever.co', 'api.lever.co'],
    detect(url) {
      const parts = pathParts(url);
      const token =
        url.hostname === 'api.lever.co'
          ? slugFromApiPath(parts, 'postings')
          : validToken(parts[0]);
      return token
        ? identity('lever', token, `https://jobs.lever.co/${token}`, url)
        : null;
    },
  },
  {
    platform: 'ashby',
    displayName: 'Ashby',
    fetchAdapter: 'ashby',
    accessMode: 'public_api',
    defaultRequestsPerMinute: 5,
    defaultRequestsPerDay: 250,
    urlHosts: ['jobs.ashbyhq.com', 'api.ashbyhq.com'],
    detect(url) {
      const parts = pathParts(url);
      const token =
        url.hostname === 'api.ashbyhq.com'
          ? slugFromApiPath(parts, 'job-board')
          : validToken(parts[0]);
      return token
        ? identity('ashby', token, `https://jobs.ashbyhq.com/${token}`, url)
        : null;
    },
  },
  {
    platform: 'workday',
    displayName: 'Workday',
    fetchAdapter: 'workday',
    accessMode: 'public_api',
    defaultRequestsPerMinute: 2,
    defaultRequestsPerDay: 150,
    urlHosts: ['*.myworkdayjobs.com'],
    detect(url) {
      const host = url.hostname.match(
        /^(?<tenant>[a-z0-9-]+)\.(?<shard>wd\d+)\.myworkdayjobs\.com$/i,
      );
      if (!host?.groups) return null;

      const parts = pathParts(url);
      const cxsIndex = parts.findIndex(
        (part, index) =>
          part.toLowerCase() === 'cxs' &&
          parts[index - 1]?.toLowerCase() === 'wday',
      );
      const site =
        cxsIndex >= 0
          ? parts[cxsIndex + 2]
          : LOCALE_PATH.test(parts[0] || '')
            ? parts[1]
            : parts[0];
      if (!site || !HOST_LABEL.test(site)) return null;

      const tenant = host.groups.tenant.toLowerCase();
      const shard = host.groups.shard.toLowerCase();
      const boardUrl = `https://${tenant}.${shard}.myworkdayjobs.com/${site}`;
      return identity('workday', boardUrl, boardUrl, url, {
        tenant,
        shard,
        site,
      });
    },
  },
  {
    platform: 'smartrecruiters',
    displayName: 'SmartRecruiters',
    fetchAdapter: 'smartrecruiters',
    accessMode: 'public_api',
    defaultRequestsPerMinute: 4,
    defaultRequestsPerDay: 250,
    urlHosts: [
      'jobs.smartrecruiters.com',
      'careers.smartrecruiters.com',
      'api.smartrecruiters.com',
    ],
    detect(url) {
      const parts = pathParts(url);
      const token =
        url.hostname === 'api.smartrecruiters.com'
          ? slugFromApiPath(parts, 'companies')
          : validToken(parts[0]);
      return token
        ? identity(
            'smartrecruiters',
            token,
            `https://jobs.smartrecruiters.com/${token}`,
            url,
          )
        : null;
    },
  },
  {
    platform: 'workable',
    displayName: 'Workable',
    fetchAdapter: 'workable',
    accessMode: 'public_api',
    defaultRequestsPerMinute: 2,
    defaultRequestsPerDay: 150,
    urlHosts: ['apply.workable.com'],
    detect(url) {
      const parts = pathParts(url);
      const token = parts.includes('accounts')
        ? slugFromApiPath(parts, 'accounts')
        : validToken(parts[0]);
      return token
        ? identity(
            'workable',
            token,
            `https://apply.workable.com/${token}`,
            url,
          )
        : null;
    },
  },
  {
    platform: 'recruitee',
    displayName: 'Recruitee',
    fetchAdapter: 'recruitee',
    accessMode: 'public_api',
    defaultRequestsPerMinute: 4,
    defaultRequestsPerDay: 250,
    urlHosts: ['*.recruitee.com'],
    detect(url) {
      const match = url.hostname.match(/^([a-z0-9-]+)\.recruitee\.com$/i);
      const token = validTenantSubdomain(match?.[1]);
      return token
        ? identity('recruitee', token, `https://${token}.recruitee.com`, url)
        : null;
    },
  },
  {
    platform: 'personio',
    displayName: 'Personio',
    fetchAdapter: 'personio',
    accessMode: 'public_api',
    defaultRequestsPerMinute: 3,
    defaultRequestsPerDay: 200,
    urlHosts: ['*.jobs.personio.com', '*.jobs.personio.de'],
    detect(url) {
      const match = url.hostname.match(
        /^([a-z0-9-]+)\.jobs\.personio\.(?:com|de)$/i,
      );
      const token = validTenantSubdomain(match?.[1]);
      return token ? identity('personio', url.origin, url.origin, url) : null;
    },
  },
  {
    platform: 'bamboohr',
    displayName: 'BambooHR',
    fetchAdapter: 'bamboohr',
    accessMode: 'public_career_page',
    defaultRequestsPerMinute: 3,
    defaultRequestsPerDay: 200,
    urlHosts: ['*.bamboohr.com'],
    detect(url) {
      const match = url.hostname.match(/^([a-z0-9-]+)\.bamboohr\.com$/i);
      const token = validTenantSubdomain(match?.[1]);
      return token
        ? identity(
            'bamboohr',
            token,
            `https://${token}.bamboohr.com/careers`,
            url,
          )
        : null;
    },
  },
  {
    platform: 'breezy',
    displayName: 'Breezy HR',
    fetchAdapter: 'breezy',
    accessMode: 'public_career_page',
    defaultRequestsPerMinute: 2,
    defaultRequestsPerDay: 150,
    urlHosts: ['*.breezy.hr'],
    detect(url) {
      const match = url.hostname.match(/^([a-z0-9-]+)\.breezy\.hr$/i);
      const token = validTenantSubdomain(match?.[1]);
      return token
        ? identity('breezy', token, `https://${token}.breezy.hr`, url)
        : null;
    },
  },
];

export const ATS_PLATFORM_PLUGINS: readonly AtsPlatformPlugin[] =
  Object.freeze(plugins);

export function getAtsPlatformPlugin(platform: PriorityAtsPlatform) {
  return ATS_PLATFORM_PLUGINS.find((plugin) => plugin.platform === platform);
}

export function detectAtsBoardFromUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  url.hostname = url.hostname.toLowerCase();

  for (const plugin of ATS_PLATFORM_PLUGINS) {
    const supportedHost = plugin.urlHosts.some((candidate) =>
      candidate.startsWith('*.')
        ? url.hostname.endsWith(candidate.slice(1))
        : url.hostname === candidate,
    );
    if (!supportedHost) continue;
    const detected = plugin.detect(url);
    if (detected) return detected;
  }
  return null;
}

export function detectAtsBoardsInHtml(html: string) {
  const matches = html.matchAll(
    /\b(?:href|src|action)\s*=\s*(["'])(?<url>.*?)\1/gi,
  );
  const detected = new Map<string, AtsBoardIdentity>();
  for (const match of matches) {
    const value = match.groups?.url?.replace(/&amp;/gi, '&');
    if (!value) continue;
    const board = detectAtsBoardFromUrl(value);
    if (!board) continue;
    detected.set(`${board.platform}:${board.boardToken}`, board);
  }
  return [...detected.values()];
}
