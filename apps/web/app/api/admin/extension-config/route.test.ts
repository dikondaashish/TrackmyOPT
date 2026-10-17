import { NextRequest } from 'next/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ insert: vi.fn(), rpc: vi.fn(), list: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({ insert: mocks.insert, select: () => ({ order: () => ({ limit: mocks.list }) }) }),
    rpc: mocks.rpc,
  }),
}));
import { GET, POST } from './route';

const config = {
  schemaVersion: 1, version: '2026-10-17.2', issuedAt: '2026-10-17T00:00:00.000Z',
  expiresAt: '2026-10-24T00:00:00.000Z', killSwitches: { autofill: { disabled: true, reason: 'incident' } },
};
const call = (body: unknown, auth = 'Bearer test-admin-secret') => POST(new NextRequest('https://www.trackmyopt.com/api/admin/extension-config', {
  method: 'POST', headers: { authorization: auth }, body: JSON.stringify(body),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('ADMIN_SECRET', 'test-admin-secret');
  mocks.insert.mockResolvedValue({ error: null });
  mocks.rpc.mockResolvedValue({ error: null });
  mocks.list.mockResolvedValue({ data: [], error: null });
});
afterEach(() => { vi.unstubAllEnvs(); });

it('is restricted to operators holding ADMIN_SECRET', async () => {
  expect((await call({ action: 'publish', config, created_by: 'ops' }, 'Bearer wrong')).status).toBe(401);
  expect((await call({ action: 'publish', config, created_by: 'ops' }, '')).status).toBe(401);
  expect((await GET(new NextRequest('https://www.trackmyopt.com/api/admin/extension-config'))).status).toBe(401);
  vi.stubEnv('ADMIN_SECRET', '');
  expect((await call({ action: 'publish', config, created_by: 'ops' })).status).toBe(401);
  expect(mocks.insert).not.toHaveBeenCalled();
});

it('publishes only configs that pass the bundled schema, as inactive versions', async () => {
  const bad = await call({ action: 'publish', config: { ...config, fieldRules: { workday: { labelAliases: [{ kind: 'postalCode', phrases: ['input#zip'] }] } } }, created_by: 'ops' });
  expect(bad.status).toBe(400);
  expect(mocks.insert).not.toHaveBeenCalled();
  const ok = await call({ action: 'publish', config, created_by: 'ops', notes: 'kill autofill' });
  expect(ok.status).toBe(200);
  expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ version: config.version, schema_version: 1, created_by: 'ops' }));
  expect(mocks.insert.mock.calls[0][0]).not.toHaveProperty('status');
  mocks.insert.mockResolvedValueOnce({ error: { code: '23505' } });
  expect((await call({ action: 'publish', config, created_by: 'ops' })).status).toBe(409);
});

it('activates (and rolls back to) a named version atomically', async () => {
  expect((await call({ action: 'activate', version: '2026-10-17.1' })).status).toBe(200);
  expect(mocks.rpc).toHaveBeenCalledWith('activate_extension_remote_config', { p_version: '2026-10-17.1' });
  mocks.rpc.mockResolvedValueOnce({ error: { code: 'P0002' } });
  expect((await call({ action: 'activate', version: '2026-10-17.9' })).status).toBe(404);
  expect((await call({ action: 'activate', version: 'latest' })).status).toBe(400);
  expect((await call({ action: 'delete' })).status).toBe(400);
});
