import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { triggerInitialCaseCheck } from './trigger-initial-check';

const fetchMock = vi.fn();
let report: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  report = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('initial check partial-failure monitoring', () => {
  it.each([400, 401, 403, 404, 422, 429])(
    'keeps expected HTTP %s outcomes separate',
    async (status) => {
      fetchMock.mockResolvedValue(new Response('{}', { status }));
      await triggerInitialCaseCheck('IOE1234567890', 'synthetic-user');
      expect(report).not.toHaveBeenCalled();
    }
  );
  it('reports a rejected background check even though enrollment succeeded', async () => {
    fetchMock.mockResolvedValue(
      new Response('private response body', { status: 503 })
    );
    await triggerInitialCaseCheck('IOE1234567890', 'synthetic-user');
    expect(report).toHaveBeenCalledExactlyOnceWith(
      'Initial case check returned HTTP 503'
    );
  });
  it('reports network errors without applicant or credential details', async () => {
    fetchMock.mockRejectedValue(
      new Error('IOE1234567890 synthetic-user secret')
    );
    await triggerInitialCaseCheck('IOE1234567890', 'synthetic-user');
    expect(report).toHaveBeenCalledExactlyOnceWith(
      'Initial case check request failed'
    );
  });
  it('reports HTTP 200 application failures', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: false, error: 'private' }))
    );
    await triggerInitialCaseCheck('IOE1234567890', 'synthetic-user');
    expect(report).toHaveBeenCalledExactlyOnceWith(
      'Initial case check returned an unsuccessful response'
    );
  });
});
