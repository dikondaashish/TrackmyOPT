import { describe, expect, it } from 'vitest';
import { POST } from './route';

describe('manual signup endpoint', () => {
  it('rejects legacy server-side account creation', async () => {
    const response = await POST();

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toMatchObject({ ok: false });
  });
});
