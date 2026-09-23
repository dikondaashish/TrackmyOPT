import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { AnalyticsTabs } from './AnalyticsTabs';

vi.mock('@/components/dashboard/case-status/CaseProcessingBenchmarks', () => ({
  CaseProcessingBenchmarks: () => <p>Internal benchmarks</p>,
}));
afterEach(cleanup);
const props = {
  receiptNumber: 'IOE0000000000',
  isPremium: true,
  onUpgrade: vi.fn(),
};

it('shows the comparison first and keeps detailed charts collapsed initially', () => {
  render(<AnalyticsTabs {...props} />);
  expect(
    screen.getByRole('heading', { name: 'How your wait compares' })
  ).toBeInTheDocument();
  const disclosure = screen
    .getByText('Explore detailed comparisons')
    .closest('details');
  expect(disclosure).not.toHaveAttribute('open');
  expect(
    screen.getByText(/not a prediction of your own outcome/).closest('details')
  ).toBeNull();
});

it('moves both selection and keyboard focus through chart tabs, including wrapping', () => {
  render(<AnalyticsTabs {...props} />);
  const disclosure = screen
    .getByText('Explore detailed comparisons')
    .closest('details')!;
  disclosure.open = true;
  const first = screen.getByRole('tab', { name: 'Similar cases' });
  first.focus();
  fireEvent.keyDown(first, { key: 'ArrowRight' });
  const trend = screen.getByRole('tab', { name: 'Trend' });
  expect(trend).toHaveFocus();
  expect(trend).toHaveAttribute('aria-selected', 'true');
  fireEvent.keyDown(trend, { key: 'End' });
  const last = screen.getByRole('tab', { name: 'Heatmap' });
  expect(last).toHaveFocus();
  fireEvent.keyDown(last, { key: 'ArrowRight' });
  expect(first).toHaveFocus();
  expect(screen.getByRole('tabpanel')).toHaveAttribute(
    'aria-labelledby',
    first.id
  );
});

it('does not offer OPT comparison charts for a non-OPT case', () => {
  render(<AnalyticsTabs {...props} estimatesAvailable={false} />);
  expect(
    screen.queryByText('Explore detailed comparisons')
  ).not.toBeInTheDocument();
  expect(
    screen.getByText(/Status tracking still works for all USCIS forms/)
  ).toBeInTheDocument();
});

it('retains free-plan restrictions when detailed charts are opened', () => {
  render(<AnalyticsTabs {...props} isPremium={false} />);
  screen.getByText('Explore detailed comparisons').closest('details')!.open = true;
  fireEvent.click(screen.getByRole('tab', { name: 'Trend' }));
  expect(screen.getByText('Is processing speeding up or slowing down?')).toBeInTheDocument();
  expect(screen.queryByText('Loading community trend…')).not.toBeInTheDocument();
});

it('announces comparison loading without showing an invented estimate', () => {
  render(<AnalyticsTabs {...props} estimateLoading />);
  expect(screen.getByRole('status')).toHaveTextContent('Loading community timeline comparison');
  expect(screen.queryByText('Historical approval range · middle 50%')).not.toBeInTheDocument();
});
