import { act, renderHook, waitFor } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useToolDates } from './useToolDates';

let root: Root | undefined;
let container: HTMLDivElement;

function DateLabel() {
  const { today } = useToolDates();
  return <span>{today || 'Checking local date…'}</span>;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    'fetch',
    vi.fn(() => new Promise(() => {}))
  );
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(async () => {
  await act(async () => root?.unmount());
  root = undefined;
  container.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it('hydrates a page built on a different day and then shows the visitor’s local date', async () => {
  vi.setSystemTime(new Date(2026, 9, 8, 12));
  container.innerHTML = renderToString(<DateLabel />);

  vi.setSystemTime(new Date(2026, 9, 12, 12));
  const errors: unknown[] = [];
  await act(async () => {
    root = hydrateRoot(container, <DateLabel />, {
      onRecoverableError: (error) => errors.push(error),
    });
  });

  expect(errors).toEqual([]);
  expect(container).toHaveTextContent('2026-10-12');
});

it('refreshes the date on focus and each minute after hydration', async () => {
  vi.setSystemTime(new Date(2026, 9, 12, 23, 59));
  container.innerHTML = renderToString(<DateLabel />);
  await act(async () => {
    root = hydrateRoot(container, <DateLabel />);
  });

  await act(async () => vi.advanceTimersByTime(60_000));
  expect(container).toHaveTextContent('2026-10-13');

  vi.setSystemTime(new Date(2026, 9, 14, 12));
  await act(async () => window.dispatchEvent(new Event('focus')));
  expect(container).toHaveTextContent('2026-10-14');
});

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

it.each([
  ['/api/opt/calculator', 'OPT tools: failed to load saved dates'],
  ['/api/premium/status', 'OPT tools: failed to load plan status'],
])(
  'reports unexpected load failures from %s without response details',
  async (route, message) => {
    vi.useRealTimers();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url === route
          ? response({ ok: false, error: 'Synthetic private response' })
          : response({ ok: true, data: {}, isPremium: false })
      )
    );
    renderHook(useToolDates);
    await waitFor(() => expect(log).toHaveBeenCalledWith(message));
    expect(log.mock.calls).toEqual([[message]]);
  }
);

it.each([401, 403, 404, 429])(
  'keeps expected HTTP %s outcomes out of error reports',
  async (status) => {
    vi.useRealTimers();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => response({}, status))
    );
    const { result } = renderHook(useToolDates);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(log).not.toHaveBeenCalled();
  }
);

it.each([500, 200, 401, 422, 429])(
  'reports unexpected save failures and keeps edits for HTTP %s',
  async (status) => {
    vi.useRealTimers();
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, options?: RequestInit) =>
        options?.method === 'POST'
          ? response({ ok: false, error: 'Synthetic private response' }, status)
          : response({ ok: true, data: {}, isPremium: false })
      )
    );
    const { result } = renderHook(useToolDates);
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.change('opt_start_date', '10/01/2026'));
    await act(async () => result.current.save(['opt_start_date']));
    expect(result.current.dates.opt_start_date).toBe('10/01/2026');
    expect(result.current.saveError).toBeTruthy();
    expect(log.mock.calls).toEqual(
      status >= 400 && status < 500 ? [] : [['OPT tools: failed to save dates']]
    );
  }
);

it('reports failed network requests without the rejected error contents', async () => {
  vi.useRealTimers();
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      throw new Error('Synthetic private network details');
    })
  );
  const { result } = renderHook(useToolDates);
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(log.mock.calls).toEqual([
    ['OPT tools: failed to load saved dates'],
    ['OPT tools: failed to load plan status'],
  ]);
});
