import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { BiometricsMilestones } from './BiometricsMilestones';
const props = {
  caseId: '11111111-1111-4111-8111-111111111111',
  currentStatus: 'We scheduled you for a biometrics appointment',
  history: [],
};
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('shows scheduled, confirms attendance, edits and undoes without changing the USCIS text', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
  vi.stubGlobal('fetch', fetchMock);
  render(<BiometricsMilestones {...props} />);
  expect(
    screen.getAllByText('Biometrics appointment scheduled').length
  ).toBeGreaterThan(0);
  fireEvent.click(screen.getByText('Yes, I attended'));
  fireEvent.change(screen.getByLabelText('Date you completed biometrics'), {
    target: { value: '2026-01-01' },
  });
  fireEvent.click(screen.getByText('Confirm attendance'));
  await screen.findByText('Attendance confirmed by you: 2026-01-01');
  expect(
    screen.getAllByText('Biometrics completed · Confirmed by you').length
  ).toBeGreaterThan(0);
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
    case_id: props.caseId,
    completed_date: '2026-01-01',
  });
  fireEvent.click(screen.getByText('Edit attendance date'));
  expect(screen.getByLabelText('Date you completed biometrics')).toHaveValue(
    '2026-01-01'
  );
  fireEvent.click(screen.getByText('Cancel'));
  fireEvent.click(screen.getByText('Undo confirmation'));
  await screen.findByText('Yes, I attended');
  expect(
    screen.queryByText('Attendance confirmed by you: 2026-01-01')
  ).not.toBeInTheDocument();
});
it('does not claim success when saving fails', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) })
  );
  render(<BiometricsMilestones {...props} />);
  fireEvent.click(screen.getByText('Yes, I attended'));
  fireEvent.change(screen.getByLabelText('Date you completed biometrics'), {
    target: { value: '2026-01-01' },
  });
  fireEvent.click(screen.getByText('Confirm attendance'));
  await screen.findByRole('alert');
  expect(
    screen.queryByText('Attendance confirmed by you: 2026-01-01')
  ).not.toBeInTheDocument();
});
it('restores saved attendance and prefers explicit USCIS completion when available', () => {
  const { rerender } = render(
    <BiometricsMilestones {...props} attendedDate="2026-01-01" />
  );
  expect(
    screen.getAllByText('Biometrics completed · Confirmed by you').length
  ).toBeGreaterThan(0);
  rerender(
    <BiometricsMilestones
      {...props}
      attendedDate="2026-01-01"
      currentStatus="Fingerprints Were Taken"
    />
  );
  expect(
    screen.queryByText('Biometrics completed · Confirmed by you')
  ).not.toBeInTheDocument();
  expect(screen.getAllByText('Biometrics completed').length).toBeGreaterThan(0);
});
