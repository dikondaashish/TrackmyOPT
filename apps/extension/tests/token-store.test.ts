import assert from 'node:assert/strict';
import test from 'node:test';

import { readCachedToken, tokenUserId } from '../src/shared/token-store';

function jwt(payload: Record<string, unknown>) {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'HS256' })}.${encode(payload)}.signature`;
}

function withLocalStorage(values: Record<string, unknown>, run: () => Promise<void>) {
  const originalChrome = globalThis.chrome;
  globalThis.chrome = {
    storage: {
      local: {
        get: async (keys: string[]) =>
          Object.fromEntries(keys.filter((key) => key in values).map((key) => [key, values[key]])),
      },
    },
  } as unknown as typeof chrome;
  return run().finally(() => {
    globalThis.chrome = originalChrome;
  });
}

test('reads the user id claim from a TrackMyOPT token', () => {
  assert.equal(tokenUserId(jwt({ userId: 'user-1', email: 'a@example.test' })), 'user-1');
  assert.equal(tokenUserId(jwt({ email: 'a@example.test' })), undefined);
  assert.equal(tokenUserId('not-a-jwt'), undefined);
});

test('a token stored without a user id still has an owner for the resume cache', async () => {
  await withLocalStorage({ idToken: jwt({ userId: 'user-1' }), idTokenIssuedAt: 5 }, async () => {
    assert.deepEqual(await readCachedToken(), {
      token: jwt({ userId: 'user-1' }),
      issuedAt: 5,
      userId: 'user-1',
    });
  });
});

test("the token's own claim wins over a user id left by an earlier sign-in", async () => {
  await withLocalStorage({ idToken: jwt({ userId: 'user-2' }), idTokenUserId: 'user-1' }, async () => {
    assert.equal((await readCachedToken())?.userId, 'user-2');
  });
});
