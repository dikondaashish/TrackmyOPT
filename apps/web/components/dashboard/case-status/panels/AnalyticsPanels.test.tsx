import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AnalyticsPanels } from './AnalyticsPanels';

vi.mock('@/components/dashboard/case-status/CaseProcessingBenchmarks', () => ({
  CaseProcessingBenchmarks: () => <p>Internal benchmarks</p>,
}));
afterEach(cleanup);
const props = {
  receiptNumber: 'IOE0000000000',
  isPremium: true,
  onUpgrade: vi.fn(),
};

it.each(['approved', 'card_produced', 'delivered'] as const)(
  'replaces the approval-wait prediction after %s',
  (phase) => {
    render(<AnalyticsPanels {...props} phase={phase} />);
    expect(
      screen.getByRole('heading', { name: 'After your decision' })
    ).toBeVisible();
    expect(
      screen.queryByText('Historical approval range · middle 50%')
    ).not.toBeInTheDocument();
    for (const name of ['Similar cases', 'Trend', 'Spread', 'Heatmap'])
      expect(screen.getByRole('heading', { name })).toBeVisible();
  }
);

it('does not predict approval after a denial', () => {
  render(<AnalyticsPanels {...props} currentStatus="Case Was Denied" />);
  expect(
    screen.getByText(/approval-wait estimate no longer applies/)
  ).toBeVisible();
});

it('shows all four detailed comparisons open together on initial render', () => {
  render(<AnalyticsPanels {...props} />);
  expect(
    screen.getByRole('heading', { name: 'How your wait compares' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'Explore detailed comparisons' })
  ).toBeVisible();
  const panels = ['Similar cases', 'Trend', 'Spread', 'Heatmap'];
  for (const panel of panels) {
    expect(screen.getByRole('heading', { name: panel })).toBeVisible();
  }
  const comparisonsGrid = screen
    .getByRole('heading', { name: 'Similar cases' })
    .closest('section')?.parentElement;
  expect(comparisonsGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2');
  expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
  expect(
    screen.getByText(/Not enough resolved community cases yet/)
  ).toBeVisible();
  expect(
    screen.getByText(/Not enough matched community reports yet/)
  ).toBeVisible();
  expect(
    screen.getByText(/Heatmap appears after community timelines are synced/)
  ).toBeVisible();
});

it('does not offer OPT comparison charts for a non-OPT case', () => {
  render(<AnalyticsPanels {...props} estimatesAvailable={false} />);
  expect(
    screen.queryByText('Explore detailed comparisons')
  ).not.toBeInTheDocument();
  expect(
    screen.getByText(/Status tracking still works for all USCIS forms/)
  ).toBeInTheDocument();
});

it('does not show broad I-765 data on other USCIS form types', () => {
  render(<AnalyticsPanels {...props} caseType="I-129" />);
  expect(screen.queryByRole('heading', { name: 'Broader I-765 data' })).not.toBeInTheDocument();
});

it('keeps all comparison panels visible with their free-plan upgrade previews', () => {
  render(<AnalyticsPanels {...props} isPremium={false} />);
  expect(
    screen.getByText('Is processing speeding up or slowing down?')
  ).toBeInTheDocument();
  expect(
    screen.getByText('The full spread, not just the middle')
  ).toBeVisible();
  expect(screen.getByText('Does filing month matter?')).toBeVisible();
  expect(screen.getByText('Cases that filed when you did')).toBeVisible();
});

it('announces comparison loading without showing an invented estimate', () => {
  render(<AnalyticsPanels {...props} estimateLoading />);
  expect(
    screen.getByText('Loading community timeline comparison…')
  ).toBeVisible();
  expect(screen.getByText('Loading community heatmap…')).toBeVisible();
  expect(
    screen.queryByText('Historical approval range · middle 50%')
  ).not.toBeInTheDocument();
});
