import { afterEach, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SavedOptDates } from './SavedOptDates';

afterEach(() => vi.unstubAllGlobals());

it('shows saved dates without turning them into an approval or permission to work', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          data: {
            program_end_date: '2026-05-15',
            opt_start_date: '2026-06-01',
            opt_ead_end_date: '2027-05-31',
            stem_start_date: null,
          },
        }),
      })
  );
  render(<SavedOptDates />);
  expect(await screen.findByText('Jun 1, 2026')).toBeInTheDocument();
  expect(screen.getByText('May 31, 2027')).toBeInTheDocument();
  expect(screen.getByText(/not a USCIS approval/i)).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: /manage opt dates/i })
  ).toHaveAttribute('href', '/dashboard/opt-dates');
});

it('offers setup instead of inventing missing dates', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, data: null }),
      })
  );
  render(<SavedOptDates />);
  expect(await screen.findByText(/add your opt dates/i)).toBeInTheDocument();
});

it('distinguishes an unavailable connection from an empty profile', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
  render(<SavedOptDates />);
  expect(
    await screen.findByText(/could not load your saved dates/i)
  ).toBeInTheDocument();
  expect(screen.queryByText(/add your opt dates/i)).not.toBeInTheDocument();
});
