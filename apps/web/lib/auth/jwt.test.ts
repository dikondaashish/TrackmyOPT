// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SignJWT } from 'jose';

const SECRET = 'test-signing-secret-that-is-long-enough-123';
const getServerSideEnv = vi.fn(() => ({ JWT_SIGNING_SECRET: SECRET }));
vi.mock('../env', () => ({ getServerSideEnv: () => getServerSideEnv() }));

import { verifyToken } from './jwt';

function token(expiresAt: number, secret = SECRET) {
  return new SignJWT({ userId: 'user-1', email: 'a@example.test' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(expiresAt - 3600)
    .setIssuer('trackmyopt-web')
    .setAudience('trackmyopt-extension')
    .setSubject('user-1')
    .setExpirationTime(expiresAt)
    .sign(new TextEncoder().encode(secret));
}

describe('verifyToken', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    getServerSideEnv.mockImplementation(() => ({ JWT_SIGNING_SECRET: SECRET }));
  });

  it('accepts a valid extension token', async () => {
    const now = Math.floor(Date.now() / 1000);
    await expect(verifyToken(await token(now + 600))).resolves.toMatchObject({
      userId: 'user-1',
    });
  });

  it('treats expired, forged and malformed tokens as expected auth outcomes', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const now = Math.floor(Date.now() / 1000);
    const invalid = [
      await token(now - 60),
      await token(now + 600, 'another-secret-that-is-also-long-enough'),
      'not-a-jwt',
    ];
    for (const value of invalid) await expect(verifyToken(value)).resolves.toBeNull();
    expect(error).not.toHaveBeenCalled();
  });

  it('still reports unexpected verification failures without token content', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    getServerSideEnv.mockImplementation(() => {
      throw new Error('Invalid server environment variables');
    });
    await expect(verifyToken('header.payload.signature')).resolves.toBeNull();
    expect(error).toHaveBeenCalledWith(
      'JWT verification failed unexpectedly',
      'Error'
    );
  });
});
