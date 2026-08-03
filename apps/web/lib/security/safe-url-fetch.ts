import { lookup as dnsLookup } from 'node:dns/promises';
import { request as httpsRequest } from 'node:https';
import { isIP, type LookupFunction } from 'node:net';
import type { Readable } from 'node:stream';

export class UnsafeUrlError extends Error {}
export class ResponseTooLargeError extends Error {}
export class SafeFetchTimeoutError extends Error {}

type SafeFetchResponse = {
  status: number;
  statusText: string;
  headers: Headers;
  body: Buffer;
  url: string;
};

type ResolvedPublicUrl = {
  parsed: URL;
  addresses: Array<{ address: string; family: number }>;
};

function ipv4Parts(address: string): number[] | null {
  const parts = address.split('.').map(Number);
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return null;
  }
  return parts;
}

function ipv6ToBigInt(address: string): bigint | null {
  let normalized = address.toLowerCase().split('%')[0] ?? '';
  if (normalized.includes('.')) {
    const lastColon = normalized.lastIndexOf(':');
    const ipv4 = ipv4Parts(normalized.slice(lastColon + 1));
    if (!ipv4) return null;
    const high = ((ipv4[0] ?? 0) << 8) | (ipv4[1] ?? 0);
    const low = ((ipv4[2] ?? 0) << 8) | (ipv4[3] ?? 0);
    normalized = `${normalized.slice(0, lastColon)}:${high.toString(16)}:${low.toString(16)}`;
  }

  const halves = normalized.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves[1] ? halves[1].split(':') : [];
  const missing = 8 - head.length - tail.length;
  if (
    (halves.length === 1 && missing !== 0) ||
    (halves.length === 2 && missing < 1)
  ) {
    return null;
  }
  const groups = [
    ...head,
    ...Array.from({ length: Math.max(0, missing) }, () => '0'),
    ...tail,
  ];
  if (
    groups.length !== 8 ||
    groups.some((group) => !/^[0-9a-f]{1,4}$/i.test(group))
  ) {
    return null;
  }
  return groups.reduce(
    (value, group) => (value << BigInt(16)) | BigInt(`0x${group}`),
    BigInt(0),
  );
}

export function isPrivateOrReservedIp(rawAddress: string): boolean {
  const address = rawAddress.toLowerCase().split('%')[0] ?? '';
  if (address.startsWith('::ffff:')) {
    return isPrivateOrReservedIp(address.slice('::ffff:'.length));
  }

  if (isIP(address) === 4) {
    const parts = ipv4Parts(address);
    if (!parts) return true;
    const [a = 0, b = 0] = parts;
    return (
      a === 0 ||
      a === 10 ||
      (a === 100 && b >= 64 && b <= 127) ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 0 || b === 168)) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }

  if (isIP(address) === 6) {
    const value = ipv6ToBigInt(address);
    if (value === null) return true;
    return (
      value === BigInt(0) ||
      value === BigInt(1) ||
      value >> BigInt(121) === BigInt(0x7e) || // fc00::/7 unique local
      value >> BigInt(118) === BigInt(0x3fa) || // fe80::/10 link local
      value >> BigInt(120) === BigInt(0xff) || // multicast
      value >> BigInt(96) === BigInt(0x20010db8) // documentation-only
    );
  }

  return true;
}

async function resolvePublicHttpsUrl(
  rawUrl: string,
): Promise<ResolvedPublicUrl> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError('Invalid URL format');
  }

  if (
    parsed.protocol !== 'https:' ||
    parsed.username ||
    parsed.password ||
    (parsed.port && parsed.port !== '443')
  ) {
    throw new UnsafeUrlError(
      'Only public HTTPS URLs on the standard port are supported.',
    );
  }

  let addresses: Array<{ address: string; family: number }>;
  try {
    addresses = await dnsLookup(parsed.hostname, {
      all: true,
      verbatim: true,
    });
  } catch {
    throw new UnsafeUrlError('Could not resolve URL hostname.');
  }

  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => isPrivateOrReservedIp(address))
  ) {
    throw new UnsafeUrlError(
      'URL resolves to a private or reserved address.',
    );
  }
  return { parsed, addresses };
}

export async function readStreamWithLimit(
  stream: AsyncIterable<Uint8Array>,
  maxBytes: number,
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;
  for await (const chunk of stream) {
    const buffer = Buffer.from(chunk);
    totalBytes += buffer.byteLength;
    if (totalBytes > maxBytes) {
      if ('destroy' in stream && typeof stream.destroy === 'function') {
        (stream as Readable).destroy();
      }
      throw new ResponseTooLargeError('Remote response exceeded the size limit.');
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks, totalBytes);
}

function pinnedLookup(
  addresses: Array<{ address: string; family: number }>,
): LookupFunction {
  return (_hostname, options, callback) => {
    if (options.all) {
      callback(null, addresses);
      return;
    }
    const selected = addresses[0];
    if (!selected) {
      callback(new Error('No validated address available'), '', 0);
      return;
    }
    callback(null, selected.address, selected.family);
  };
}

async function requestValidatedUrl(
  resolved: ResolvedPublicUrl,
  options: { maxBytes: number; timeoutMs: number },
): Promise<SafeFetchResponse> {
  return new Promise((resolve, reject) => {
    const request = httpsRequest(
      resolved.parsed,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'TrackMyOPT URL Importer/1.0',
          Accept:
            'text/html,application/xhtml+xml,application/pdf;q=0.9',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        lookup: pinnedLookup(resolved.addresses),
      },
      async (response) => {
        try {
          const declaredLength = Number(response.headers['content-length']);
          if (
            Number.isFinite(declaredLength) &&
            declaredLength > options.maxBytes
          ) {
            response.destroy();
            throw new ResponseTooLargeError(
              'Remote response exceeded the size limit.',
            );
          }
          const body = await readStreamWithLimit(response, options.maxBytes);
          const headers = new Headers();
          for (const [name, value] of Object.entries(response.headers)) {
            if (Array.isArray(value)) {
              for (const item of value) headers.append(name, item);
            } else if (value !== undefined) {
              headers.set(name, String(value));
            }
          }
          resolve({
            status: response.statusCode ?? 500,
            statusText: response.statusMessage ?? '',
            headers,
            body,
            url: resolved.parsed.toString(),
          });
        } catch (error) {
          reject(error);
        }
      },
    );

    request.setTimeout(options.timeoutMs, () => {
      request.destroy(new SafeFetchTimeoutError('Remote request timed out.'));
    });
    request.on('error', reject);
    request.end();
  });
}

export async function safeFetchPublicHttps(
  rawUrl: string,
  options: {
    maxBytes: number;
    timeoutMs: number;
    maxRedirects: number;
  },
): Promise<SafeFetchResponse> {
  let currentUrl = rawUrl;

  for (let hop = 0; hop <= options.maxRedirects; hop += 1) {
    const resolved = await resolvePublicHttpsUrl(currentUrl);
    const response = await requestValidatedUrl(resolved, options);
    if (response.status < 300 || response.status >= 400) {
      return response;
    }

    const location = response.headers.get('location');
    if (!location) return response;
    if (hop === options.maxRedirects) {
      throw new UnsafeUrlError('Too many redirects.');
    }
    currentUrl = new URL(location, resolved.parsed).toString();
  }

  throw new UnsafeUrlError('Too many redirects.');
}
