import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { OptApplyTool } from './tools/OptApplyTool';
import { OptClockTool } from './tools/OptClockTool';
import { StemClockTool } from './tools/StemClockTool';
import { LiveStatsWidget } from './LiveStatsWidget';
import { EmailReminder } from './EmailReminder';
import { ToolWorkspace } from './ToolWorkspace';
import { DateInput } from '../opt/OptDateInput';
vi.mock('@/components/pricing/PricingModal', () => ({
  PricingModal: () => null,
}));
vi.mock('@/hooks/useEmploymentSetupAck', () => ({
  useEmploymentSetupAck: () => ({ ack: null, setAck: vi.fn() }),
}));
const saved = {
  program_end_date: '05/15/2025',
  dso_recommendation_date: '04/01/2025',
  opt_start_date: '01/01/2025',
  opt_ead_end_date: '12/31/2025',
  stem_start_date: '01/01/2026',
};
const jobs = [
  {
    id: 'job',
    employer_name: 'Synthetic employer',
    start_date: '2025-01-21',
    end_date: null,
    is_current: true,
  },
];
const response = (body: unknown, status = 200) => ({
  ok: status < 400,
  status,
  json: async () => body,
});
type MockFetch = (
  url: string,
  options?: RequestInit
) => Promise<ReturnType<typeof response>>;
let fetchMock: ReturnType<typeof vi.fn<MockFetch>>;
beforeEach(() => {
  fetchMock = vi.fn(async (url, options) => {
    if (url === '/api/opt/calculator')
      return response(
        options?.method === 'POST' ? { ok: true } : { ok: true, data: saved }
      );
    if (url === '/api/employment-spans')
      return response({ ok: true, spans: jobs });
    if (url === '/api/premium/status') return response({ isPremium: false });
    if (url === '/api/user/tool-email')
      return response({ ok: true, emails: {} });
    return response({});
  });
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
it('does not invent a DSO date when program end changes and saves only the changed field', async () => {
  render(<OptApplyTool />);
  const field = screen.getByLabelText('Program End Date');
  await waitFor(() => expect(field).toHaveValue(saved.program_end_date));
  fireEvent.change(field, { target: { value: '05/20/2025' } });
  expect(screen.getByLabelText(/DSO Recommendation/)).toHaveValue(
    saved.dso_recommendation_date
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await screen.findByRole('button', { name: 'Saved!' });
  const post = fetchMock.mock.calls.find(
    ([, options]) => options?.method === 'POST'
  );
  expect(JSON.parse(post![1]!.body as string)).toEqual({
    program_end_date: '05/20/2025',
  });
});
it('clears old estimates when a date becomes invalid and exposes the error', async () => {
  render(<OptApplyTool />);
  const field = screen.getByLabelText('Program End Date');
  await waitFor(() => expect(field).toHaveValue(saved.program_end_date));
  fireEvent.change(field, { target: { value: '02/30/2025' } });
  expect(field).toHaveAttribute('aria-invalid', 'true');
  expect(
    screen.queryByRole('region', { name: 'Filing estimate' })
  ).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
});
it('keeps the actual EAD end when OPT start is edited', async () => {
  render(<OptClockTool />);
  const field = screen.getByLabelText('OPT Start Date');
  await waitFor(() => expect(field).toHaveValue(saved.opt_start_date));
  fireEvent.change(field, { target: { value: '01/02/2025' } });
  expect(screen.getByLabelText('OPT EAD End Date')).toHaveValue(
    saved.opt_ead_end_date
  );
});
it('loads saved STEM employment history and uses combined initial plus STEM counts', async () => {
  render(<StemClockTool />);
  const result = screen.getByRole('region', { name: 'Unemployment estimate' });
  await waitFor(() => expect(result).toHaveTextContent('Initial OPT: 20 days'));
  expect(result).toHaveTextContent('STEM: 0 days');
  expect(result).toHaveTextContent('150 available');
});
it('does not show unemployment counts if history cannot load and supports retry', async () => {
  const original = fetchMock.getMockImplementation()!;
  fetchMock.mockImplementation(async (url, options) =>
    url === '/api/employment-spans' ? response({}, 500) : original(url, options)
  );
  render(<OptClockTool />);
  expect(
    await screen.findByText(/Could not load employment history/)
  ).toBeInTheDocument();
  expect(
    within(
      screen.getByRole('region', { name: 'Unemployment estimate' })
    ).queryByRole('progressbar')
  ).not.toBeInTheDocument();
  fetchMock.mockImplementation(original);
  fireEvent.click(
    screen.getByRole('button', { name: 'Retry employment history' })
  );
  await waitFor(() =>
    expect(
      within(
        screen.getByRole('region', { name: 'Unemployment estimate' })
      ).getByRole('progressbar')
    ).toBeInTheDocument()
  );
});
it('allows guest previews without failed-save alerts or account writes', async () => {
  fetchMock.mockResolvedValue(response({}, 401));
  render(<OptClockTool />);
  await screen.findByText('Sign in to save your dates');
  fireEvent.change(screen.getByLabelText('OPT Start Date'), {
    target: { value: '01/01/2025' },
  });
  fireEvent.change(screen.getByLabelText('OPT EAD End Date'), {
    target: { value: '12/31/2025' },
  });
  expect(
    screen.queryByRole('button', { name: 'Save' })
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('checkbox', { name: /no qualifying employment/ })
  );
  expect(
    within(
      screen.getByRole('region', { name: 'Unemployment estimate' })
    ).getByRole('progressbar')
  ).toBeInTheDocument();
  expect(
    fetchMock.mock.calls.some(([, options]) => options?.method === 'POST')
  ).toBe(false);
});
it('does not treat an expired history session as no employment for a signed-in user', async () => {
  const original = fetchMock.getMockImplementation()!;
  fetchMock.mockImplementation(async (url, options) =>
    url === '/api/employment-spans' ? response({}, 401) : original(url, options)
  );
  render(<OptClockTool />);
  expect(
    await screen.findByText(/Could not load employment history/)
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('checkbox', { name: /no qualifying employment/ })
  ).not.toBeInTheDocument();
});
it('does not display legacy fabricated baseline statistics', async () => {
  fetchMock.mockResolvedValue(
    response({
      'opt-apply': {
        mainStat: { value: 90 },
        secondaryStat: { value: 12 },
        sampleSize: 0,
        dataSource: 'baseline',
      },
    })
  );
  render(<LiveStatsWidget />);
  expect(await screen.findByText('USCIS processing time')).toBeInTheDocument();
  expect(screen.queryByText('90')).not.toBeInTheDocument();
});
it('displays API failures explicitly instead of an empty statistics card', async () => {
  fetchMock.mockResolvedValue(response({}, 500));
  render(<LiveStatsWidget />);
  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent(
      'temporarily unavailable'
    )
  );
});
it('shows median and sample size for real aggregates', async () => {
  fetchMock.mockResolvedValue(
    response({
      'opt-apply': {
        mainStat: { value: 42 },
        secondaryStat: { value: 2 },
        sampleSize: 8,
        dataSource: 'trackmyopt',
      },
    })
  );
  render(<LiveStatsWidget />);
  expect(await screen.findByText(/8 qualifying cases/)).toBeInTheDocument();
  expect(screen.getByText('Median recorded approval time')).toBeInTheDocument();
});
it('does not silently show success when updating reminder settings fails', async () => {
  render(<EmailReminder toolType="opt-clock" isPremium />);
  const field = await screen.findByLabelText('Reminder email');
  fireEvent.change(field, { target: { value: 'synthetic@example.com' } });
  fetchMock.mockResolvedValueOnce(response({ ok: false }, 500));
  await act(async () => fireEvent.submit(field.closest('form')!));
  expect(await screen.findByRole('status')).toHaveTextContent(
    'Could not update reminders'
  );
  expect(field).toHaveValue('synthetic@example.com');
});
it.each([
  ['opt-apply', 'bg-blue-700'],
  ['opt-clock', 'bg-orange-700'],
  ['stem-apply', 'bg-teal-700'],
  ['stem-clock', 'bg-violet-700'],
] as const)('preserves the established palette for %s', (slug, color) => {
  render(<ToolWorkspace slug={slug}>Preview</ToolWorkspace>);
  const activeLink = screen
    .getAllByRole('link')
    .find((link) => link.getAttribute('aria-current') === 'page');
  expect(activeLink).toHaveClass(color);
});
it('opens the entered calendar month and returns focus on Escape', () => {
  render(
    <DateInput
      id="calendar-test"
      label="Test date"
      value="02/29/2024"
      onChange={vi.fn()}
    />
  );
  const trigger = screen.getByRole('button', { name: 'Open calendar' });
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(
    screen.getByRole('button', { name: 'February 29, 2024' })
  ).toHaveAttribute('aria-pressed', 'true');
  fireEvent.keyDown(trigger, { key: 'Escape' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByLabelText('Test date')).toHaveFocus();
});
it('does not silently select a rolled-over invalid date in the calendar', () => {
  render(
    <DateInput
      id="calendar-test"
      label="Test date"
      value="02/30/2024"
      onChange={vi.fn()}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
  expect(
    screen.queryByRole('button', { pressed: true })
  ).not.toBeInTheDocument();
});
