import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import EmailCampaignsPage from './page';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('shows separate offer counts from an authenticated aggregate report', async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ campaignId: 'product_update_2026_09_29', subject: 'Product update', sent: 50, failed: 0, needsReview: 1, observedOpens: 20, recordedClickers: 10, knownAutomatedRequests: 2, links: [{ key: 'pro_intro', clickers: 7, knownAutomatedClickers: 1 }, { key: 'free_dashboard', clickers: 4, knownAutomatedClickers: 0 }] }) });
  vi.stubGlobal('fetch', fetch);
  render(<EmailCampaignsPage />);
  fireEvent.change(screen.getByLabelText('Admin secret'), { target: { value: 'test-only-secret' } });
  fireEvent.click(screen.getByRole('button', { name: 'Load report' }));
  await waitFor(() => expect(screen.getByText('$0.99 offer clickers')).toBeInTheDocument());
  expect(screen.getByText('$0.99 offer clickers').parentElement).toHaveTextContent('7');
  expect(screen.getByText('Free link clickers').parentElement).toHaveTextContent('4');
  expect(fetch).toHaveBeenCalledWith('/api/admin/email-campaigns?id=product_update_2026_09_29', { headers: { Authorization: 'Bearer test-only-secret' }, cache: 'no-store' });
  expect(window.localStorage.getItem('ADMIN_SECRET')).toBeNull();
});
it('shows report errors without inventing zero engagement counts', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'No tracked campaign with this ID yet' }) }));
  render(<EmailCampaignsPage />);
  fireEvent.change(screen.getByLabelText('Admin secret'), { target: { value: 'test-only-secret' } });
  fireEvent.click(screen.getByRole('button', { name: 'Load report' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('No tracked campaign with this ID yet');
  expect(screen.queryByRole('region', { name: 'Campaign results' })).not.toBeInTheDocument();
});
