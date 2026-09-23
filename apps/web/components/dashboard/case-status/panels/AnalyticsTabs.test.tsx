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

it('keeps detailed comparisons visible without a collapse control', () => {
  render(<AnalyticsTabs {...props} />);
  expect(
    screen.getByRole('heading', { name: 'How your wait compares' })
  ).toBeInTheDocument();
  const heading = screen.getByRole('heading', {
    name: 'Explore detailed comparisons',
  });
  expect(heading.closest('details')).toBeNull();
  expect(
    screen.queryByRole('button', { name: 'Explore detailed comparisons' })
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole('tablist', { name: 'Community analytics' })
  ).toBeVisible();
  fireEvent.click(heading);
  expect(screen.getByRole('tabpanel')).toBeVisible();
  expect(
    screen.getByText(/not a prediction of your own outcome/).closest('details')
  ).toBeNull();
});

it('shows two tabs per row and moves focus in the matching grid direction', () => {
  render(<AnalyticsTabs {...props} />);
  const tablist = screen.getByRole('tablist', { name: 'Community analytics' });
  expect(tablist).toHaveClass('grid-cols-2');
  expect(
    screen.getAllByRole('tab').map((tab) => tab.textContent?.trim())
  ).toEqual(['Similar cases', 'Trend', 'Spread', 'Heatmap']);

  const first = screen.getByRole('tab', { name: 'Similar cases' });
  first.focus();
  fireEvent.keyDown(first, { key: 'ArrowRight' });
  const trend = screen.getByRole('tab', { name: 'Trend' });
  expect(trend).toHaveFocus();
  expect(trend).toHaveAttribute('aria-selected', 'true');
  fireEvent.keyDown(trend, { key: 'ArrowDown' });
  const last = screen.getByRole('tab', { name: 'Heatmap' });
  expect(last).toHaveFocus();
  fireEvent.keyDown(last, { key: 'ArrowLeft' });
  const spread = screen.getByRole('tab', { name: 'Spread' });
  expect(spread).toHaveFocus();
  fireEvent.keyDown(spread, { key: 'ArrowUp' });
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

it('retains free-plan restrictions with detailed charts always visible', () => {
  render(<AnalyticsTabs {...props} isPremium={false} />);
  fireEvent.click(screen.getByRole('tab', { name: 'Trend' }));
  expect(
    screen.getByText('Is processing speeding up or slowing down?')
  ).toBeInTheDocument();
  expect(
    screen.queryByText('Loading community trend…')
  ).not.toBeInTheDocument();
});

it('announces comparison loading without showing an invented estimate', () => {
  render(<AnalyticsTabs {...props} estimateLoading />);
  expect(screen.getByRole('status')).toHaveTextContent(
    'Loading community timeline comparison'
  );
  expect(
    screen.queryByText('Historical approval range · middle 50%')
  ).not.toBeInTheDocument();
});
