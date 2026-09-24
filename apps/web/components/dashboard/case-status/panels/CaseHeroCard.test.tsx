import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { CaseHeroCard } from './CaseHeroCard';
import { deriveJourneyPhase } from '@/lib/community-opt/stages';

afterEach(cleanup);
const caseStatus = {
  id: 'fixture',
  receipt_number: 'IOE0000000000',
  current_status: 'Case Was Received',
  filing_category: 'initial_opt',
};

it('always displays milestones without a collapsible control', () => {
  render(<CaseHeroCard caseStatus={caseStatus} caseState="pending" />);
  const region = screen.getByRole('region', { name: 'Case milestones' });
  expect(region.querySelector('details, summary')).toBeNull();
  expect(region).toHaveTextContent('Received');
});

it.each([
  { current_status: 'Case Was Updated To Show Fingerprints Were Taken' },
  {
    status_history: [{ status: 'Fingerprints Were Taken', date: '2026-09-01' }],
  },
  { status_description: 'Your biometrics have been completed.' },
  {
    status_history: [
      {
        status: 'Case update',
        description: 'Your fingerprints were applied to your case.',
        date: '2026-09-01',
      },
    ],
  },
])('shows completed biometrics from recorded evidence: %j', (evidence) => {
  render(
    <CaseHeroCard
      caseStatus={{ ...caseStatus, ...evidence }}
      caseState="pending"
    />
  );
  expect(screen.getAllByText('Biometrics completed').length).toBeGreaterThan(0);
});

it('does not mark a scheduled appointment complete just because review started', () => {
  render(
    <CaseHeroCard
      caseStatus={{
        ...caseStatus,
        current_status: 'Case Is Being Actively Reviewed',
        status_history: [
          {
            status: 'Biometrics Appointment Was Scheduled',
            date: '2026-09-01',
          },
        ],
      }}
      caseState="pending"
    />
  );
  expect(screen.queryByText('Biometrics completed')).not.toBeInTheDocument();
  expect(
    screen.getAllByText('Biometrics — completion not recorded').length
  ).toBeGreaterThan(0);
});

it('keeps next-stage guidance consistent with historical biometrics completion', () => {
  expect(
    deriveJourneyPhase('Case Is Being Actively Reviewed', [
      { status: 'Fingerprints Were Taken' },
    ])
  ).toBe('biometrics_done');
  expect(deriveJourneyPhase('Biometrics Appointment Was Scheduled')).toBe(
    'filed'
  );
});

it('keeps date-only filing records on their saved calendar date in local time', () => {
  render(
    <CaseHeroCard
      caseStatus={{ ...caseStatus, received_date: '2026-06-15' }}
      caseState="pending"
    />
  );
  expect(screen.getByText('Filed: Jun 15, 2026')).toBeInTheDocument();
});

it('makes the actual USCIS status the heading and keeps unknown dates explicit', () => {
  render(<CaseHeroCard caseStatus={caseStatus} caseState="pending" />);
  expect(
    screen.getByRole('heading', { name: 'Case Was Received', level: 2 })
  ).toBeInTheDocument();
  expect(screen.getByText('Filing date not added')).toBeInTheDocument();
  expect(screen.getByText('Not recorded')).toBeInTheDocument();
});

it('does not invent a current status when one has not arrived', () => {
  render(
    <CaseHeroCard
      caseStatus={{ ...caseStatus, current_status: null }}
      caseState="pending"
    />
  );
  expect(
    screen.getByRole('heading', { name: 'Awaiting USCIS status' })
  ).toBeInTheDocument();
});

it('reports clipboard failure instead of falsely saying copied', async () => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
  });
  render(<CaseHeroCard caseStatus={caseStatus} caseState="pending" />);
  fireEvent.click(screen.getByRole('button', { name: 'Copy receipt' }));
  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent('Could not copy')
  );
  expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
});
