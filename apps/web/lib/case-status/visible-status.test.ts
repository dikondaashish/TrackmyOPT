import { expect, it } from 'vitest';
import { caseForViewer } from './visible-status';
const row = {
  id: 'owned',
  current_status: 'Approved',
  last_checked_at: '2026-10-12',
  status_history: [{ status: 'Approved' }],
  free_visible_status: {
    current_status: 'Received',
    last_checked_at: '2026-10-01',
    status_history: [{ status: 'Received' }],
  },
  free_first_refresh_pending: true,
  last_manual_check_at: null,
  change_log: [{ new_status: 'Approved' }],
  pp_start_date: '2026-10-10',
};
it('keeps automatic sync private to the stored free display snapshot', () => {
  const visible = caseForViewer(row, false);
  expect(visible.current_status).toBe('Received');
  expect(visible.last_checked_at).toBe('2026-10-01');
  expect(visible.status_history).toEqual([{ status: 'Received' }]);
  expect(visible.change_log).toEqual([]);
  expect(visible.pp_start_date).toBeNull();
  expect(visible).not.toHaveProperty('free_visible_status');
});
it('returns the latest stored result to premium, without exposing refresh bookkeeping', () => {
  const visible = caseForViewer(row, true);
  expect(visible.current_status).toBe('Approved');
  expect(visible).not.toHaveProperty('free_first_refresh_pending');
});
it('fails closed when a free snapshot is absent or invalid', () => {
  expect(
    caseForViewer({ ...row, free_visible_status: null }, false).current_status
  ).toBeNull();
});
