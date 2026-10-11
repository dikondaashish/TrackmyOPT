import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ProductEmailPreference } from './ProductEmailPreference';
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ enabled: false }) })
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('starts off and loading never opts a user in', async () => {
  render(<ProductEmailPreference />);
  const box = screen.getByRole('checkbox', { name: /Product emails/ });
  expect(box).not.toBeChecked();
  await waitFor(() => expect(box).not.toBeDisabled());
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(vi.mocked(fetch).mock.calls[0][1]?.method).toBeUndefined();
});
it('saves a deliberate choice and retains the prior preference when saving fails', async () => {
  render(<ProductEmailPreference />);
  const box = screen.getByRole('checkbox');
  await waitFor(() => expect(box).not.toBeDisabled());
  vi.mocked(fetch).mockResolvedValueOnce({
    ok: false,
    status: 503,
  } as Response);
  fireEvent.click(box);
  await screen.findByRole('alert');
  expect(box).not.toBeChecked();
  vi.mocked(fetch).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ enabled: true }),
  } as Response);
  fireEvent.click(box);
  await waitFor(() => expect(box).toBeChecked());
  expect(fetch).toHaveBeenLastCalledWith(
    '/api/email/marketing-preferences',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ enabled: true }),
    })
  );
});
