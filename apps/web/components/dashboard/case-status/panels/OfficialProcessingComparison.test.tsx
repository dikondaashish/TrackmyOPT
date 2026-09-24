import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { OfficialProcessingComparison } from './OfficialProcessingComparison';

it('keeps official and community metrics visibly separate', () => {
  render(<OfficialProcessingComparison medianDays={118} premium={false} />);

  expect(screen.getByText('USCIS published measure')).toBeVisible();
  expect(screen.getByText('Matched community reports')).toBeVisible();
  expect(screen.getByText('118 days')).toBeVisible();
  expect(screen.getByText(/different measures and samples/i)).toBeVisible();
  expect(
    screen.getByRole('link', { name: /Check USCIS times/i })
  ).toHaveAttribute('href', 'https://egov.uscis.gov/processing-times');
});
