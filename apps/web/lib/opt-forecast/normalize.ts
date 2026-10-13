import type { Observation, Outcome, SurvivalRecord, Timeline } from './types';

const DAY = 86_400_000;
/** Strict UTC date-only arithmetic: no impossible calendars or timezone drift. */
export function isoDay(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = /^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value)
    ? value.slice(0, 10)
    : /^(?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}$/i.test(
          value
        )
      ? (() => {
          const m = value.match(/^([A-Za-z]+) (\d{1,2}), (\d{4})$/)!;
          const months = [
            'january',
            'february',
            'march',
            'april',
            'may',
            'june',
            'july',
            'august',
            'september',
            'october',
            'november',
            'december',
          ];
          return `${m[3]}-${String(months.indexOf(m[1]!.toLowerCase()) + 1).padStart(2, '0')}-${m[2]!.padStart(2, '0')}`;
        })()
      : /^\d{2}\/\d{2}\/\d{4}$/.test(value)
        ? `${value.slice(6)}-${value.slice(0, 2)}-${value.slice(3, 5)}`
        : null;
  if (!date) return null;
  const ms = Date.parse(date + 'T00:00:00Z');
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === date
    ? date
    : null;
}
export const days = (start: string, end: string) =>
  Math.round(
    (Date.parse(end.slice(0, 10) + 'T00:00:00Z') -
      Date.parse(start.slice(0, 10) + 'T00:00:00Z')) /
      DAY
  );
export const addDays = (start: string, amount: number) =>
  new Date(Date.parse(start.slice(0, 10) + 'T00:00:00Z') + amount * DAY)
    .toISOString()
    .slice(0, 10);

/** Deliberately conservative: a card event is never an exact approval date. */
export function classify(status: string): Outcome {
  if (/\b(?:reopen|revok|rescind)/i.test(status)) return 'unknown';
  if (/\b(?:denied|rejected)\b/i.test(status)) return 'denial';
  if (/\bwithdrawn\b|withdrawal.*(?:acknowledg|approved)/i.test(status))
    return 'withdrawal';
  if (
    (/\bapproved\b/i.test(status) ||
      /^approval case decision rendered$/i.test(status.trim())) &&
    !/not approved|approval.*revo/i.test(status)
  )
    return 'approval';
  if (
    /card.*(?:produc|mail|deliver)|closed|terminated|revoked|reopened/i.test(
      status
    )
  )
    return 'unknown';
  if (
    /case.*receiv|application.*receiv|\breceived your\b|currently processing|actively review|fingerprint|biometric|request.*evidence|response.*receiv|transferred|premium.*processing|interview|notice of intent/i.test(
      status
    )
  )
    return 'pending';
  return 'unknown';
}
// USCIS history uses both short titles ("Case Was Received") and long sentences
// ("We received your Form I-765, ... and sent you a receipt notice.").
const received = (status: string) =>
  (/^(?:case|application)(?: was| is)? received(?:$| and| on)/i.test(
    status.trim()
  ) ||
    /^we received your (?:form|application)\b/i.test(status.trim())) &&
  !/response|premium/i.test(status);
export const fatalFlags = new Set([
  'conflicting_category',
  'conflicting_receipt',
  'conflicting_premium_start',
  'invalid_event_date',
  'contradictory_outcome',
  'unconfirmed_category',
  'unsupported_form',
  'invalid_premium_start',
]);

/** Reconstruct knowledge as it existed at cutoff, never from today's mutable row. */
export function normalizeObservations(
  observations: Observation[],
  cutoff: string
): Timeline[] {
  const groups = new Map<string, Observation[]>();
  for (const row of observations) {
    if (
      !Number.isFinite(Date.parse(row.observed_at)) ||
      Date.parse(row.observed_at) > Date.parse(cutoff) ||
      Date.parse(row.synced_at) > Date.parse(cutoff)
    )
      continue;
    const list = groups.get(row.application_id) ?? [];
    list.push(row);
    groups.set(row.application_id, list);
  }
  return [...groups].map(([applicationId, rows]) => {
    rows.sort(
      (a, b) => a.observed_at.localeCompare(b.observed_at) || a.id - b.id
    );
    const latest = rows.at(-1)!;
    const flags = new Set<string>();
    // Compare the latest declaration for each enrollment, allowing dated corrections.
    const perOwner = new Map(rows.map((r) => [r.case_id, r]));
    const categories = new Set(
      [...perOwner.values()].map((r) => r.reported.category)
    );
    if (categories.size > 1) flags.add('conflicting_category');
    if (
      new Set([...perOwner.values()].map((r) => r.reported.premium_start))
        .size > 1
    )
      flags.add('conflicting_premium_start');
    const kind =
      latest.reported.category === 'initial_opt' ||
      latest.reported.category === 'stem_extension'
        ? latest.reported.category
        : null;
    if (!latest.reported.category_confirmed_at)
      flags.add('unconfirmed_category');
    if (latest.provider.form.replace(/\s/g, '').toUpperCase() !== 'I-765')
      flags.add('unsupported_form');
    const today = isoDay(latest.synced_at)!;
    const validDate = (value: string | null) => {
      const d = isoDay(value);
      return d && d <= today ? d : null;
    };
    const receiptEvents = latest.provider.events
      .filter((e) => received(e.status))
      .map((e) => validDate(e.date))
      .filter((x): x is string => !!x);
    const receiptDates = [...new Set(receiptEvents)].sort();
    const explicitReceipt = validDate(latest.provider.received);
    if (
      receiptDates.length > 1 ||
      (explicitReceipt && receiptDates.some((d) => d !== explicitReceipt))
    )
      flags.add('conflicting_receipt');
    const receiptDate = explicitReceipt ?? receiptDates[0] ?? null;
    if (!receiptDate) flags.add('missing_verified_receipt');
    // First upgrade/start, never a later clock restart. Clock guarantees and approval
    // forecasts are different clocks; RFE restarts stay in the original PP episode.
    const providerPp =
      latest.provider.events
        .filter((e) =>
          /premium[ -]processing clock (?:was )?started|started the premium[ -]processing clock/i.test(
            e.status
          )
        )
        .map((e) => validDate(e.date))
        .filter((d): d is string => !!d)
        .sort()[0] ?? null;
    const declaredPp = validDate(latest.reported.premium_start);
    const pp =
      providerPp ??
      declaredPp ??
      validDate(latest.reported.legacy_premium_start ?? null);
    if (providerPp && declaredPp && providerPp !== declaredPp)
      flags.add('conflicting_premium_start');
    if (
      (latest.reported.premium_start && !declaredPp) ||
      (pp && receiptDate && pp < receiptDate)
    )
      flags.add('invalid_premium_start');
    const premiumText = rows.some(
      (r) =>
        /premium/i.test(r.provider.status) ||
        r.provider.events.some((e) => /premium/i.test(e.status))
    );
    if (premiumText && !pp) flags.add('missing_premium_start');
    if (pp)
      flags.add(
        providerPp
          ? 'verified_premium_start'
          : declaredPp
            ? 'user_reported_premium_start'
            : 'legacy_premium_start_source_unknown'
      );
    else flags.add('regular_processing_unconfirmed');
    const terminal = latest.provider.events.filter((e) =>
      ['approval', 'denial', 'withdrawal'].includes(classify(e.status))
    );
    const outcomeKinds = new Set(terminal.map((e) => classify(e.status)));
    const current = classify(latest.provider.status);
    // A current pending/reopened state contradicting a past terminal event needs review.
    if (
      outcomeKinds.size > 1 ||
      (terminal.length &&
        (current === 'pending' || /reopen|revok/i.test(latest.provider.status)))
    )
      flags.add('contradictory_outcome');
    let outcome: Outcome = current;
    if (
      current === 'unknown' &&
      /\bcard\b/i.test(latest.provider.status) &&
      outcomeKinds.has('approval')
    )
      outcome = 'approval';
    const eventDates = [
      ...new Set(
        terminal
          .filter((e) => classify(e.status) === outcome)
          .map((e) => validDate(e.date))
          .filter((d): d is string => !!d)
      ),
    ];
    const eventDate = eventDates.length === 1 ? eventDates[0]! : null;
    if (
      eventDates.length > 1 ||
      (eventDate && receiptDate && eventDate < receiptDate)
    )
      flags.add('invalid_event_date');
    if (['approval', 'denial', 'withdrawal'].includes(outcome) && !eventDate)
      flags.add('missing_event_date');
    const pending = rows.filter(
      (r) => classify(r.provider.status) === 'pending'
    );
    if (eventDate && pending.some((r) => isoDay(r.synced_at)! > eventDate))
      flags.add('delayed_event_reporting');
    const origin = pp ?? receiptDate;
    const comparablePending = pending.filter(
      (r) =>
        origin &&
        isoDay(r.synced_at)! >= origin &&
        (!eventDate || isoDay(r.synced_at)! < eventDate)
    );
    return {
      applicationId,
      caseIds: [...perOwner.keys()],
      kind,
      processing: pp || premiumText ? 'premium' : 'regular_unconfirmed',
      receiptDate,
      reportedFilingDate: validDate(latest.reported.filing_date),
      premiumStart: pp,
      origin,
      firstPendingAt: comparablePending[0]?.synced_at ?? null,
      lastPendingAt: comparablePending.at(-1)?.synced_at ?? null,
      lastObservedAt: latest.observed_at,
      lastSyncedAt: latest.synced_at,
      currentStatus: latest.provider.status,
      outcome,
      eventDate,
      flags: [...flags],
    };
  });
}

export function toSurvivalRecord(t: Timeline): SurvivalRecord | null {
  if (
    !t.kind ||
    !t.origin ||
    !t.firstPendingAt ||
    t.flags.some((f) => fatalFlags.has(f)) ||
    (t.processing === 'premium' && !t.premiumStart)
  )
    return null;
  const entry = days(t.origin, t.firstPendingAt);
  const terminal =
    ['approval', 'denial', 'withdrawal'].includes(t.outcome) && t.eventDate;
  // Unknown event dates/statuses contribute only their last confirmed pending time.
  const exitDate = terminal ? t.eventDate! : t.lastPendingAt;
  if (!exitDate) return null;
  const exit = days(t.origin, exitDate);
  if (entry < 0 || exit <= entry) return null;
  return {
    id: t.applicationId,
    entry,
    exit,
    event: terminal
      ? (t.outcome as 'approval' | 'denial' | 'withdrawal')
      : 'censored',
  };
}

/** Regular episodes end at an observed upgrade, a competing transition (not approval). */
export function trainingRecords(
  observations: Observation[],
  cutoff: string,
  kind: Timeline['kind'],
  processing: Timeline['processing']
): SurvivalRecord[] {
  const latest = normalizeObservations(observations, cutoff);
  const records: SurvivalRecord[] = [];
  for (const t of latest) {
    if (t.kind !== kind) continue;
    if (t.processing === processing) {
      const r = toSurvivalRecord(t);
      if (r) records.push(r);
      continue;
    }
    if (
      processing !== 'regular_unconfirmed' ||
      !t.premiumStart ||
      !t.receiptDate ||
      t.flags.some((f) => fatalFlags.has(f))
    )
      continue;
    const pendingBefore = observations
      .filter(
        (o) =>
          o.application_id === t.applicationId &&
          Date.parse(o.observed_at) <= Date.parse(cutoff) &&
          classify(o.provider.status) === 'pending' &&
          isoDay(o.synced_at)! < t.premiumStart!
      )
      .sort((a, b) => a.synced_at.localeCompare(b.synced_at));
    if (!pendingBefore.length) continue;
    const entry = days(t.receiptDate, pendingBefore[0]!.synced_at);
    const exit = days(t.receiptDate, t.premiumStart);
    if (entry >= 0 && exit > entry)
      records.push({ id: t.applicationId, entry, exit, event: 'upgrade' });
  }
  return records;
}
