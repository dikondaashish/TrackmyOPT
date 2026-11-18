import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { LateCaseHelp } from './LateCaseHelp';

const capture = vi.hoisted(() => vi.fn());
vi.mock('@/lib/posthog-client', () => ({ captureClientEvent: capture }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const assessment = {
  level: 'past_typical' as const,
  daysSinceFiled: 120,
  medianDays: 96,
  daysPastTypical: 24,
};
const details = {
  receiptNumber: 'IOE0000000001',
  filedDate: '2026-07-01',
  daysSinceFiled: 120,
  stemExtension: false,
};

it('shows a Free account which steps exist, without their content', () => {
  const onUpgrade = vi.fn();
  render(
    <LateCaseHelp
      assessment={assessment}
      details={details}
      isPro={false}
      onUpgrade={onUpgrade}
    />
  );
  expect(
    screen.getByRole('heading', { name: 'Your case is past the typical wait' })
  ).toBeInTheDocument();
  expect(screen.getByText(/You are 120 days in/)).toHaveTextContent(
    'typical reported wait for a case like yours is 96 days'
  );
  expect(screen.getAllByRole('listitem')).toHaveLength(6);
  expect(screen.getByText('Consider premium processing')).toBeInTheDocument();
  expect(screen.queryByText(/800-375-5283/)).not.toBeInTheDocument();
  expect(screen.queryByText(/IOE0000000001/)).not.toBeInTheDocument();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', { name: 'Unlock the steps with Pro' })
  );
  expect(onUpgrade).toHaveBeenCalledOnce();
  expect(capture).toHaveBeenCalledWith('late_case_help_shown', {
    plan_tier: 'free',
    level: 'past_typical',
  });
});

it('gives Pro the steps, official links and text to copy', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });
  render(
    <LateCaseHelp
      assessment={{ ...assessment, level: 'slow_quarter' }}
      details={details}
      isPro
      onUpgrade={vi.fn()}
    />
  );
  expect(
    screen.getByText(/longer than about three in four reported cases/)
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Unlock the steps with Pro' })
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /USCIS Case Processing Times/ })
  ).toHaveAttribute('href', 'https://egov.uscis.gov/processing-times');
  for (const link of screen.getAllByRole('link'))
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  expect(screen.getByText(/800-375-5283/)).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole('button', { name: 'Copy' })[0]!);
  expect(writeText).toHaveBeenCalledWith(
    expect.stringContaining('receipt number IOE0000000001')
  );
  expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
  expect(screen.getByText(/not legal advice/)).toBeInTheDocument();
});
