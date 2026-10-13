import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { captureClientEvent } from '@/lib/posthog-client';
import { OptDecisionWindowTool } from './OptDecisionWindowTool';

vi.mock('@/lib/posthog-client', () => ({ captureClientEvent: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it('submits and finishes after the browser translates the button label', async () => {
  let resolveResponse!: (value: Response) => void;
  vi.stubGlobal(
    'fetch',
    vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveResponse = resolve;
        })
    )
  );
  render(<OptDecisionWindowTool />);
  fireEvent.change(screen.getByLabelText('USCIS received / receipt date'), {
    target: { value: '2026-01-15' },
  });
  const button = screen.getByRole('button', {
    name: 'Show my decision window',
  });
  const walker = document.createTreeWalker(button, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.textContent?.includes('Show my decision window')) {
      const font = document.createElement('font');
      font.textContent = 'Mostrar mi ventana de decisión';
      node.parentNode!.replaceChild(font, node);
      break;
    }
  }
  expect(button).toHaveTextContent('Mostrar mi ventana de decisión');
  fireEvent.click(button);
  expect(button).toBeDisabled();
  expect(button).toHaveTextContent('Checking similar cases…');

  await act(async () =>
    resolveResponse(
      new Response(
        JSON.stringify({
          ok: true,
          estimate: null,
          daysSinceFiled: 30,
        }),
        { status: 200 }
      )
    )
  );
  expect(button).toBeEnabled();
  expect(button).toHaveTextContent('Show my decision window');
  expect(
    screen.getByRole('link', { name: 'Track live status free' })
  ).toBeVisible();
});

it('hydrates a cached page with the visitor’s current local date limit', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 8, 12));
  const container = document.createElement('div');
  container.innerHTML = renderToString(<OptDecisionWindowTool />);
  document.body.appendChild(container);
  vi.setSystemTime(new Date(2026, 9, 12, 12));
  const errors: unknown[] = [];
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  let root: Root | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, <OptDecisionWindowTool />, {
        onRecoverableError: (error) => errors.push(error),
      });
    });
    expect(container.querySelector('input[type="date"]')).toHaveAttribute(
      'max',
      '2026-10-12'
    );
    expect(errors).toEqual([]);
    expect(log).not.toHaveBeenCalled();
  } finally {
    await act(async () => root?.unmount());
    container.remove();
  }
});

function submit() {
  render(<OptDecisionWindowTool />);
  fireEvent.change(screen.getByLabelText('USCIS received / receipt date'), {
    target: { value: '2026-01-15' },
  });
  fireEvent.click(
    screen.getByRole('button', { name: 'Show my decision window' })
  );
}

describe('decision-window outcome analytics', () => {
  it('records a network failure without sending request details', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    submit();
    await screen.findByText('Network error. Please try again.');
    expect(captureClientEvent).toHaveBeenCalledExactlyOnceWith(
      'opt_decision_window_failed',
      {
        case_kind: 'initial_opt',
        failure_kind: 'network_or_response',
      }
    );
    expect(
      screen.getByRole('button', { name: 'Show my decision window' })
    ).toBeEnabled();
    expect(log).toHaveBeenCalledExactlyOnceWith(
      'OPT decision window: failed to load estimate (stage=network, status=none)'
    );
  });

  it('records API errors once and preserves the HTTP status', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ ok: false, error: 'Try again later' }),
      })
    );
    submit();
    await screen.findByText('Try again later');
    expect(captureClientEvent).toHaveBeenCalledExactlyOnceWith(
      'opt_decision_window_failed',
      {
        case_kind: 'initial_opt',
        status: 429,
        failure_kind: 'api',
      }
    );
  });

  it('counts an insufficient cohort as a valid result, not a failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, estimate: null, daysSinceFiled: 30 }),
      })
    );
    submit();
    await waitFor(() =>
      expect(captureClientEvent).toHaveBeenCalledExactlyOnceWith(
        'opt_decision_window_viewed',
        {
          case_kind: 'initial_opt',
          has_estimate: false,
          days_since_filed: 30,
          cohort_size: 0,
        }
      )
    );
    expect(
      screen.getByRole('link', { name: 'Track live status free' })
    ).toHaveAttribute('href', '/login?next=/dashboard/case-status');
  });
});

it.each([
  [500, { ok: false, error: 'Synthetic private API failure' }, 'http'],
  [200, { ok: false, error: 'Synthetic private API failure' }, 'payload'],
  [200, null, 'payload'],
  [
    200,
    { ok: true, daysSinceFiled: 30, estimate: { cohortSize: null } },
    'payload',
  ],
])(
  'reports an unexpected HTTP %s response with a private payload as a fixed diagnostic',
  async (status, payload, stage) => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(payload), { status }))
    );
    submit();
    await waitFor(() =>
      expect(log).toHaveBeenCalledExactlyOnceWith(
        `OPT decision window: failed to load estimate (stage=${stage}, status=${status})`
      )
    );
    expect(
      screen.getByRole('button', { name: 'Show my decision window' })
    ).toBeEnabled();
    expect(
      screen.queryByRole('link', { name: 'Track live status free' })
    ).not.toBeInTheDocument();
  }
);

it('reports invalid JSON without retaining its contents', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response('Synthetic private invalid JSON', { status: 200 })
      )
  );
  submit();
  await screen.findByText('Network error. Please try again.');
  expect(log).toHaveBeenCalledExactlyOnceWith(
    'OPT decision window: failed to load estimate (stage=json, status=200)'
  );
});

it.each([400, 401, 403, 404, 429])(
  'keeps expected HTTP %s outcomes quiet even without a JSON body',
  async (status) => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('Request unavailable', { status }))
    );
    submit();
    await screen.findByText('Could not load your decision window.');
    expect(log).not.toHaveBeenCalled();
    expect(captureClientEvent).toHaveBeenCalledExactlyOnceWith(
      'opt_decision_window_failed',
      {
        case_kind: 'initial_opt',
        status,
        failure_kind: 'api',
      }
    );
  }
);

it('renders a validated estimate and its outcome analytics', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          daysSinceFiled: 30,
          estimate: {
            medianDays: 70,
            p25Days: 50,
            p75Days: 90,
            cohortSize: 100,
            caseKind: 'initial_opt',
            matchLevel: 'category',
            sourceNote: 'Community reports',
          },
        }),
        { status: 200 }
      )
    )
  );
  submit();
  expect(await screen.findByText('50–90')).toBeVisible();
  expect(screen.getByText(/Based on 100 completed community/)).toBeVisible();
  expect(captureClientEvent).toHaveBeenCalledExactlyOnceWith(
    'opt_decision_window_viewed',
    {
      case_kind: 'initial_opt',
      has_estimate: true,
      days_since_filed: 30,
      cohort_size: 100,
    }
  );
});
