import { afterEach, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { CheckSchedule } from './CheckSchedule';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function schedule(state: string, scheduledFor: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ next: { state, scheduled_for: scheduledFor } }),
    })
  );
}

it('does not confuse a running check with a completed check', async () => {
  schedule('running', '2026-09-24T14:00:00Z');
  render(<CheckSchedule caseId="synthetic" />);
  expect(
    await screen.findByText('Started · not yet completed')
  ).toBeInTheDocument();
  expect(screen.queryByText(/Delayed/)).not.toBeInTheDocument();
});

it('updates an overdue queue label while the page remains open', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-24T13:59:30Z'));
  schedule('queued', '2026-09-24T14:00:00Z');
  await act(async () => {
    render(<CheckSchedule caseId="synthetic" />);
  });
  expect(screen.getByText('Queued · scheduled start')).toBeInTheDocument();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(60000);
  });
  expect(
    screen.getByText('Delayed · refresh manually to retry')
  ).toBeInTheDocument();
});

it('does not invent a next check when the schedule cannot be loaded', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
  await act(async () => {
    render(<CheckSchedule caseId="synthetic" />);
  });
  expect(screen.getByText('Queue time not confirmed')).toBeInTheDocument();
  expect(
    screen.queryByText('Queued · scheduled start')
  ).not.toBeInTheDocument();
});
