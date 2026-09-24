import {
  isTerminalCase,
  nextDailyCheck,
  checkFailureCode,
} from './check-schedule';
it.each([
  ['2026-09-23T13:59:59Z', '2026-09-23T14:00:00.000Z'],
  ['2026-09-23T14:00:00Z', '2026-09-24T14:00:00.000Z'],
  ['2026-12-31T23:59:59Z', '2027-01-01T14:00:00.000Z'],
])('schedules UTC without daylight-saving drift: %s', (now, expected) => {
  expect(nextDailyCheck(new Date(now)).toISOString()).toBe(expected);
});
it.each([
  ['HTTP 429', 'USCIS_RATE_LIMITED'],
  ['timeout', 'USCIS_TIMEOUT'],
  ['HTTP 401 private body', 'USCIS_AUTH_UNAVAILABLE'],
  ['USCIS_CIRCUIT_OPEN', 'USCIS_UNAVAILABLE'],
  ['unknown private body', 'CHECK_RETRIES_EXHAUSTED'],
])('maps failures to public-safe codes', (message, code) =>
  expect(checkFailureCode(message)).toBe(code),
);
it('never treats a notice or approval awaiting card delivery as terminal', () => {
  for (const status of [
    'Notice Explaining USCIS Actions Was Mailed',
    'Case Was Approved',
    'Card Was Picked Up By The United States Postal Service',
  ])
    expect(isTerminalCase(status)).toBe(false);
  expect(isTerminalCase('Card Was Delivered To Me By The Post Office')).toBe(
    true,
  );
});
