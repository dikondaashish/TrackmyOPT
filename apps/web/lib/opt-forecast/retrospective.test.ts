import { describe, expect, it } from 'vitest';
import { normalizeObservations } from './normalize';
import { communityAsOfLandmarks, reconstructObservations } from './retrospective';

const row = {
  case_id: 'case-1',
  application_id: 'app-1',
  case_type: 'I-765',
  received_date: '2026-03-02',
  current_status: 'Card Was Delivered To Me By The Post Office',
  status_history: [
    { status: 'Card Was Delivered To Me By The Post Office', date: '' },
    {
      status: 'Your Form I-765, Application for Employment Authorization, has been approved.',
      date: '2026-06-10',
    },
    {
      status: 'We received your Form I-765, Application for Employment Authorization, and sent you a receipt notice.',
      date: '2026-03-02',
    },
  ],
  last_checked_at: '2026-10-13T14:01:00.000Z',
  filing_category: 'initial_opt',
  filing_category_confirmed_at: null,
  reported_filing_date: null,
  reported_premium_start: null,
  pp_start_date: null,
};

describe('retrospective reconstruction', () => {
  it('shows only events dated on or before each past check', () => {
    const obs = reconstructObservations([row], {
      landmarks: ['2026-06-01T23:59:59.999Z'],
      assumeCategory: true,
    });
    const june1 = normalizeObservations(obs, '2026-06-01T23:59:59.999Z')[0]!;
    expect(june1.outcome).toBe('pending');
    expect(june1.eventDate).toBeNull();
    expect(june1.lastSyncedAt.slice(0, 10)).toBe('2026-06-01');
    const now = normalizeObservations(obs, '2026-10-14T00:00:00.000Z')[0]!;
    expect(now.outcome).toBe('approval');
    expect(now.eventDate).toBe('2026-06-10');
    expect(now.firstPendingAt?.slice(0, 10)).toBe('2026-03-02');
  });
  it('keeps the unconfirmed category unless the sensitivity option is set', () => {
    const obs = reconstructObservations([row], { landmarks: [] });
    expect(
      normalizeObservations(obs, '2026-10-14T00:00:00.000Z')[0]!.flags
    ).toContain('unconfirmed_category');
  });
  it('exposes community approvals only from their approval date', () => {
    const rows = communityAsOfLandmarks(
      [
        { id: 't1', external_id: 'optt_1', case_kind: 'initial_opt', premium_processing: false, init_date: '2026-01-01', approve_date: '2026-05-15', days_to_approval: 134 },
      ],
      ['2026-05-01T23:59:59.999Z', '2026-06-01T23:59:59.999Z']
    );
    expect(rows.map((r) => r.observed_at)).toEqual(['2026-06-01T23:59:59.999Z']);
  });
});
