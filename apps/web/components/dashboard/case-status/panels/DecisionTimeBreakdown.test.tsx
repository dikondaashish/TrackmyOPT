import { fireEvent, render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { DecisionTimeBreakdown } from './DecisionTimeBreakdown';

const distribution = [
  { label: 'Under 60d', count: 20 },
  { label: '60–119d', count: 80 },
];

it('shows exact counts and shares in an accessible table and highlights a selected range', () => {
  render(<DecisionTimeBreakdown distribution={distribution} total={100} />);
  const table = screen.getByRole('table');
  expect(within(table).getByText('20.0%')).toBeVisible();
  const button = screen.getByRole('button', { name: 'Under 60d' });
  fireEvent.click(button);
  expect(button).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('20 cases')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Show all time ranges' }));
  expect(button).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByText('100')).toBeVisible();
});

it.each([0, 101])(
  'does not draw a misleading whole for invalid total %s',
  (total) => {
    render(<DecisionTimeBreakdown distribution={distribution} total={total} />);
    expect(
      screen.getByText(/complete decision-time breakdown is not available/)
    ).toBeVisible();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  }
);

it('distinguishes small nonzero shares from zero', () => {
  render(
    <DecisionTimeBreakdown
      distribution={[
        { label: 'Small', count: 1 },
        { label: 'Empty', count: 0 },
        { label: 'Other', count: 9999 },
      ]}
      total={10000}
    />
  );
  expect(screen.getByText('<0.1%')).toBeVisible();
  expect(screen.getByText('0%')).toBeVisible();
});

it('handles a complete single group without division by zero', () => {
  render(
    <DecisionTimeBreakdown
      distribution={[{ label: 'Under 60d', count: 10 }]}
      total={10}
    />
  );
  expect(screen.getByText('100.0%')).toBeVisible();
});
