import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { EmploymentHistoryLog } from './EmploymentHistoryLog';
import type { EmploymentSpan } from './employment-history-helpers';

vi.mock('@/hooks/useEmploymentSetupAck', () => ({
  useEmploymentSetupAck: () => ({ ack: null, setAck: vi.fn() }),
}));
const initial: EmploymentSpan = {
  id: 'test',
  employer_name: 'Example Company',
  employer_domain: 'example.com',
  start_date: '2026-01-01',
  end_date: null,
  is_current: true,
};
let saved: EmploymentSpan[];
beforeEach(() => {
  vi.useFakeTimers();
  saved = [initial];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, options) => {
      if (String(url).startsWith('https://api.brandfetch.io/')) {
        return {
          ok: true,
          json: async () => [{ name: 'New Company', domain: 'newcompany.com' }],
        };
      }
      if (options?.method === 'POST') {
        saved = JSON.parse(options.body).spans.map((span: EmploymentSpan) => ({
          ...span,
          id: span.id || 'added',
          is_current: !span.end_date,
        }));
      }
      return { ok: true, json: async () => ({ ok: true, spans: saved }) };
    })
  );
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const tick = () =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(300);
  });

it('saves a user-confirmed company website, reloads it, and clears it when the employer changes', async () => {
  const view = render(<EmploymentHistoryLog employmentSpans={[initial]} />);
  fireEvent.click(screen.getByRole('button', { name: /^Edit$/ }));
  expect(screen.getByLabelText('Company website (optional)')).toHaveValue(
    'example.com'
  );
  fireEvent.change(screen.getByRole('combobox'), {
    target: { value: 'New Company' },
  });
  expect(screen.getByLabelText('Company website (optional)')).toHaveValue('');
  await tick();
  fireEvent.click(screen.getByRole('option', { name: /New Company/ }));
  expect(screen.getByLabelText('Company website (optional)')).toHaveValue(
    'newcompany.com'
  );
  expect(
    vi.mocked(fetch).mock.calls.filter(([, opts]) => opts?.method === 'POST')
  ).toHaveLength(0);
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  });
  expect(saved[0]).toMatchObject({
    employer_name: 'New Company',
    employer_domain: 'newcompany.com',
  });
  view.unmount();
  const reloaded = render(
    <EmploymentHistoryLog employmentSpans={JSON.parse(JSON.stringify(saved))} />
  );
  expect(
    new URL(reloaded.container.querySelector('img')!.src).searchParams.get(
      'url'
    )
  ).toBe('https://newcompany.com');
});

it('blocks invalid websites, then allows clearing the website and saving', async () => {
  render(<EmploymentHistoryLog employmentSpans={[initial]} />);
  fireEvent.click(screen.getByRole('button', { name: /^Edit$/ }));
  fireEvent.change(screen.getByLabelText('Company website (optional)'), {
    target: { value: 'not a website' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  expect(screen.getByText(/Enter a valid company website/)).toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Company website (optional)'), {
    target: { value: '' },
  });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  });
  expect(saved[0].employer_domain).toBeNull();
});

it('includes the website when adding employment', async () => {
  render(<EmploymentHistoryLog employmentSpans={[initial]} />);
  fireEvent.click(screen.getByRole('button', { name: 'Add Employment' }));
  fireEvent.change(screen.getByRole('combobox'), {
    target: { value: 'Manual Company' },
  });
  fireEvent.change(screen.getByLabelText('Company website (optional)'), {
    target: { value: 'https://manualcompany.com/team' },
  });
  fireEvent.change(screen.getByPlaceholderText('08/01/2025'), {
    target: { value: '09/01/2026' },
  });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save Employment' }));
  });
  expect(saved[0]).toMatchObject({
    employer_name: 'Manual Company',
    employer_domain: 'manualcompany.com',
  });
});
