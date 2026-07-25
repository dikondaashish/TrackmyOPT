import { Readable } from 'node:stream';

import { describe, expect, it } from 'vitest';

import {
  ResponseTooLargeError,
  isPrivateOrReservedIp,
  readStreamWithLimit,
} from './safe-url-fetch';

describe('safe URL fetch boundaries', () => {
  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '100.64.0.1',
    '169.254.169.254',
    '192.168.1.1',
    '::1',
    'fc00::1',
    'fd12:3456::1',
    'fe80::1',
    'ff02::1',
    '::ffff:127.0.0.1',
  ])('rejects private or reserved address %s', (address) => {
    expect(isPrivateOrReservedIp(address)).toBe(true);
  });

  it.each(['8.8.8.8', '1.1.1.1', '2606:4700:4700::1111'])(
    'allows public address %s',
    (address) => {
      expect(isPrivateOrReservedIp(address)).toBe(false);
    },
  );

  it('stops reading as soon as the byte limit is exceeded', async () => {
    const stream = Readable.from([
      Buffer.alloc(4, 'a'),
      Buffer.alloc(4, 'b'),
    ]);

    await expect(readStreamWithLimit(stream, 6)).rejects.toBeInstanceOf(
      ResponseTooLargeError,
    );
  });
});
