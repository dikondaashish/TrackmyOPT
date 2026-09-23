import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { buildOptDatesStatusSnapshot } from '@/lib/immigration/opt-dates-page-utils';
import { OptDatesStatusSummary } from './OptDatesStatusSummary';

afterEach(cleanup);

const status = {
  ...buildOptDatesStatusSnapshot({}, 0, null, [], '2026-09-23'),
  hasOptStart: true,
  unemploymentLabel: '50 / 150',
  unemploymentDetail: '100 days remaining',
  unemploymentTone: 'good' as const,
  optEndHeading: 'STEM end estimate',
  optEndLabel: '660 days',
  optEndDetail: 'STEM 24-month estimate — verify your EAD',
  optEndDaysLeft: 660,
  filingLabel: 'Closed',
  filingDetail: 'Filing deadline passed',
};

it('preserves all summary information and the employment-history link', () => {
  render(<OptDatesStatusSummary status={status} />);
  expect(screen.getByText('100 days remaining')).toBeVisible();
  expect(screen.getByText('660 days')).toBeVisible();
  expect(
    screen.getByText('STEM 24-month estimate — verify your EAD')
  ).toBeVisible();
  expect(screen.getByText('Closed')).toBeVisible();
  expect(
    screen.getByRole('link', { name: /Open employment history/ })
  ).toHaveAttribute('href', '#employment');
  const progress = screen.getByRole('progressbar');
  expect(progress).toHaveAttribute('aria-valuenow', '50');
  expect(progress).toHaveAttribute('aria-valuemax', '150');
  expect(progress.firstElementChild?.firstElementChild).toHaveStyle({
    width: '33%',
  });
});

it('keeps critical values readable and caps the visual progress at the limit', () => {
  render(
    <OptDatesStatusSummary
      status={{
        ...status,
        unemploymentLabel: '151 / 150',
        unemploymentTone: 'critical',
        unemploymentDetail: 'Limit exceeded',
      }}
    />
  );
  expect(screen.getByText('151')).toHaveClass('text-red-700');
  expect(screen.getByRole('progressbar')).toHaveAttribute(
    'aria-valuenow',
    '150'
  );
  expect(screen.getByRole('progressbar')).toHaveAttribute(
    'aria-valuetext',
    '151 of 150 unemployment days used. Limit exceeded.'
  );
});

it('does not display a misleading progress bar before unemployment is calculated', () => {
  render(
    <OptDatesStatusSummary
      status={{
        ...status,
        hasOptStart: false,
        hasProgramEnd: true,
        unemploymentLabel: 'Not started',
      }}
    />
  );
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});

it('does not display the summary before any dates are saved', () => {
  const { container } = render(
    <OptDatesStatusSummary
      status={{ ...status, hasOptStart: false, hasProgramEnd: false }}
    />
  );
  expect(container).toBeEmptyDOMElement();
});
