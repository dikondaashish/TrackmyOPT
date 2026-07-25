import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it } from 'vitest';

import { corsHeadersWebAndExtension } from './cors-policy';

const originalConfiguredId = process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID;
const originalConfiguredIds = process.env.CHROME_EXTENSION_IDS;

function request(origin: string): NextRequest {
  return new NextRequest('https://www.trackmyopt.com/api/example', {
    headers: { origin },
  });
}

afterEach(() => {
  if (originalConfiguredId === undefined) {
    delete process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID;
  } else {
    process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID = originalConfiguredId;
  }
  if (originalConfiguredIds === undefined) {
    delete process.env.CHROME_EXTENSION_IDS;
  } else {
    process.env.CHROME_EXTENSION_IDS = originalConfiguredIds;
  }
});

describe('web and extension CORS policy', () => {
  it('allows the published TrackMyOPT extension ID', () => {
    const origin = 'chrome-extension://hfljbefkccdmlnhclfojlafipjnjbajm';
    expect(corsHeadersWebAndExtension(request(origin))).toMatchObject({
      'Access-Control-Allow-Origin': origin,
      Vary: 'Origin',
    });
  });

  it('does not reflect an arbitrary extension origin', () => {
    const headers = corsHeadersWebAndExtension(
      request('chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
    );
    expect(headers).not.toHaveProperty('Access-Control-Allow-Origin');
  });

  it('allows an explicitly configured unpacked extension ID', () => {
    process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID =
      'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
    const origin = 'chrome-extension://bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
    expect(corsHeadersWebAndExtension(request(origin))).toMatchObject({
      'Access-Control-Allow-Origin': origin,
    });
  });
});
