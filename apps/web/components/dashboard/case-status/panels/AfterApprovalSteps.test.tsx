import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AfterApprovalSteps } from './AfterApprovalSteps';

const m = vi.hoisted(() => ({ capture: vi.fn(), nps: vi.fn() }));
vi.mock('@/lib/posthog-client', () => ({ captureClientEvent: m.capture }));
vi.mock('@/lib/posthog/nps-survey', () => ({ requestNpsSurvey: m.nps }));

const fetchMock = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify({ optStatus: null, employmentSpans: [] }))
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('lists the next steps for an approved initial OPT case on Free', async () => {
  const onUpgrade = vi.fn();
  render(
    <AfterApprovalSteps
      stemExtension={false}
      isPro={false}
      onUpgrade={onUpgrade}
    />
  );
  expect(
    screen.getByRole('heading', {
      name: 'Your case is approved. Here is what to do next',
    })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /Save my EAD dates/ })
  ).toHaveAttribute('href', '/dashboard/opt-dates');
  expect(
    screen.getByRole('link', { name: /Open my unemployment clock/ })
  ).toHaveAttribute('href', '/dashboard/opt-tools/opt-clock');
  expect(
    screen.getByRole('link', { name: /Check my STEM window/ })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'See Pro' }));
  expect(onUpgrade).toHaveBeenCalledOnce();

  // The recommendation question is asked here, at approval.
  expect(m.nps).toHaveBeenCalledWith({
    trigger: 'case_approved_viewed',
    planTier: 'free',
  });
  expect(m.capture).toHaveBeenCalledWith('after_approval_steps_shown', {
    plan_tier: 'free',
    case_kind: 'initial_opt',
  });
  await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
});

it('marks saved dates and employment as done, and hides the Pro line on Pro', async () => {
  fetchMock.mockResolvedValue(
    new Response(
      JSON.stringify({
        optStatus: { stem_start_date: '2026-07-15' },
        employmentSpans: [{ start_date: '2026-05-13', end_date: null }],
      })
    )
  );
  render(<AfterApprovalSteps stemExtension isPro />);
  expect(
    await screen.findByRole('link', { name: /Review my dates/ })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /Review my employment/ })
  ).toBeInTheDocument();
  expect(screen.getAllByText('Done')).toHaveLength(2);
  expect(screen.getByText('Watch your 150 unemployment days')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'See Pro' })).not.toBeInTheDocument();
  expect(
    screen.queryByRole('link', { name: /Check my STEM window/ })
  ).not.toBeInTheDocument();
});

it('still shows the steps when saved data cannot be loaded', async () => {
  fetchMock.mockRejectedValue(new Error('offline'));
  render(<AfterApprovalSteps stemExtension={false} isPro />);
  await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
  expect(screen.getByRole('link', { name: /Save my EAD dates/ })).toBeInTheDocument();
  expect(screen.queryByText('Done')).not.toBeInTheDocument();
});

it('copies the share link and records the click on a step', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });
  render(<AfterApprovalSteps stemExtension={false} isPro />);
  fireEvent.click(screen.getByRole('button', { name: 'Copy the link' }));
  expect(writeText).toHaveBeenCalledWith(
    expect.stringContaining('utm_campaign=after_approval')
  );
  expect(
    await screen.findByRole('button', { name: 'Link copied' })
  ).toBeInTheDocument();
  expect(m.capture).toHaveBeenCalledWith('share_link_copied', {
    source: 'after_approval',
  });
  fireEvent.click(screen.getByRole('link', { name: /See verified jobs/ }));
  expect(m.capture).toHaveBeenCalledWith('after_approval_step_clicked', {
    step: 'jobs',
    plan_tier: 'pro',
  });
});
