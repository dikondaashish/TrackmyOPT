import { describe, expect, it, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { scrubSentryEvent } from '@/lib/sentry/options';
import {
  dbFailureKind,
  retryOnDbTransportFailure,
} from './db-transport-retry';

const ok = { status: 200, error: null, data: { id: 'case' } };
const transport = {
  status: 0,
  error: { code: '', message: 'TypeError: fetch failed' },
  data: null,
};
const database = {
  status: 400,
  error: { code: '23514', message: 'check constraint violated' },
  data: null,
};

describe('retryOnDbTransportFailure', () => {
  it('retries once when no HTTP response arrived', async () => {
    const run = vi
      .fn()
      .mockResolvedValueOnce(transport)
      .mockResolvedValueOnce(ok);
    await expect(retryOnDbTransportFailure(run, 0)).resolves.toBe(ok);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('returns the second transport failure without looping', async () => {
    const run = vi.fn().mockResolvedValue(transport);
    await expect(retryOnDbTransportFailure(run, 0)).resolves.toBe(transport);
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('never retries database errors or successes', async () => {
    for (const result of [database, ok]) {
      const run = vi.fn().mockResolvedValue(result);
      await expect(retryOnDbTransportFailure(run, 0)).resolves.toBe(result);
      expect(run).toHaveBeenCalledTimes(1);
    }
  });

  it('recovers a real supabase-js update from a dropped connection', async () => {
    let calls = 0;
    const fetchImpl = vi.fn(async () => {
      calls += 1;
      if (calls === 1) throw new TypeError('fetch failed');
      return new Response(JSON.stringify({ id: 'case' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    const supabase = createClient('https://example.supabase.co', 'key', {
      global: { fetch: fetchImpl as unknown as typeof fetch },
      auth: { persistSession: false },
    });
    const result = await retryOnDbTransportFailure(
      () =>
        supabase
          .from('case_status')
          .update({ current_status: 'Case Was Received' })
          .eq('id', 'case')
          .select('id')
          .maybeSingle(),
      0
    );
    expect(result.error).toBeNull();
    expect(result.data).toEqual({ id: 'case' });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});

describe('dbFailureKind', () => {
  it('labels failures without message text', () => {
    expect(dbFailureKind(transport)).toBe('transport');
    expect(dbFailureKind(database)).toBe('http 400 23514');
    expect(dbFailureKind({ status: 502, error: { code: 'x y' } })).toBe(
      'http 502'
    );
    const message = `USCIS case persistence failed (${dbFailureKind(database)})`;
    expect(scrubSentryEvent({ type: undefined, message }, {}).message).toBe(
      message
    );
  });
});
