import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { CaseHeroCard } from './CaseHeroCard';

afterEach(cleanup);
const caseStatus = {
  id: 'fixture',
  receipt_number: 'IOE0000000000',
  current_status: 'Case Was Received',
  filing_category: 'initial_opt',
};

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
