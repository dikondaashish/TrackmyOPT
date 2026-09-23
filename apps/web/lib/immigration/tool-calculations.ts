import { calendarDateISO, localTodayISO } from './calendar-days';
import {
  addDays,
  calculateUnemploymentDays,
  daysBetween,
  getFilingWindow,
  getStemFilingWindow,
  type EmploymentSpan,
} from './opt-calculations';

/** Calendar-only previews. These do not establish eligibility or USCIS approval. */
export function filingPreview(
  kind: 'opt' | 'stem',
  endInput: string,
  recommendationInput: string,
  today = localTodayISO()
) {
  const end = calendarDateISO(endInput);
  const recommendation = calendarDateISO(recommendationInput);
  if (!end || (recommendationInput.trim() && !recommendation)) return null;
  const window =
    kind === 'opt'
      ? getFilingWindow(end, recommendation)
      : getStemFilingWindow(end, recommendation);
  const transitionReview =
    kind === 'opt' && today >= '2026-09-15' && addDays(end, 60) >= '2026-09-15';
  const daysLeft = daysBetween(today, window.hardDeadline);
  const noWindow =
    window.hardDeadline < window.earliestFile ||
    (!!recommendation && recommendation > window.hardDeadline);
  const status = transitionReview
    ? 'DSO review needed'
    : noWindow
      ? 'Recommendation needs review'
      : daysLeft < 0
        ? 'Deadline passed'
        : today < window.earliestFile
          ? 'Not open yet'
          : !recommendation || recommendation > today
            ? 'DSO recommendation needed'
            : daysLeft === 0
              ? 'Deadline is today'
              : 'Within estimated filing window';
  return {
    ...window,
    end,
    recommendation,
    transitionReview,
    status,
    daysLeft,
    noWindow,
    requestedStartEarliest: addDays(end, 1),
    requestedStartLatest: addDays(end, 60),
    pendingExtensionEnd: addDays(end, 180),
  };
}

export function clockPreview(
  kind: 'opt' | 'stem',
  startInput: string,
  endInput: string,
  stemInput: string,
  spans: EmploymentSpan[],
  today = localTodayISO()
) {
  const start = calendarDateISO(startInput);
  const end = calendarDateISO(endInput);
  const stem = calendarDateISO(stemInput);
  if (
    !start ||
    !end ||
    end < start ||
    (kind === 'stem' && (!stem || stem !== addDays(end, 1)))
  )
    return null;
  // Reject incomplete history instead of silently dropping jobs and inflating unemployment.
  if (
    spans.some(
      (s) =>
        !calendarDateISO(s.start_date) ||
        (s.end_date &&
          (!calendarDateISO(s.end_date) ||
            calendarDateISO(s.end_date)! < calendarDateISO(s.start_date)!))
    )
  )
    return null;
  return calculateUnemploymentDays(
    start,
    end,
    spans,
    kind === 'stem' ? stem : null,
    null,
    today
  );
}
