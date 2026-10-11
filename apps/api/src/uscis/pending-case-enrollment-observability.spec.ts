import { reportPendingCaseEnrollmentFailure } from './pending-case-enrollment-observability';

afterEach(() => jest.restoreAllMocks());

it('sends only an authenticated fixed signal to TrackMyOPT, with redirects forbidden', async () => {
  const request = jest
    .spyOn(global, 'fetch')
    .mockResolvedValue({ ok: true } as Response);
  expect(
    await reportPendingCaseEnrollmentFailure('synthetic-test-secret'),
  ).toBe(true);
  expect(request.mock.calls[0][0]).toBe(
    'https://www.trackmyopt.com/api/internal/pending-case-enrollment-failure',
  );
  expect(request.mock.calls[0][1]).toMatchObject({
    method: 'POST',
    headers: { Authorization: 'Bearer synthetic-test-secret' },
    redirect: 'error',
  });
  expect(request.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  expect(request.mock.calls[0][1]).not.toHaveProperty('body');
});

it('does not call out without the existing shared secret', async () => {
  const request = jest.spyOn(global, 'fetch');
  expect(await reportPendingCaseEnrollmentFailure(undefined)).toBe(false);
  expect(request).not.toHaveBeenCalled();
});

it('keeps reporting outages from failing a successful USCIS lookup', async () => {
  jest
    .spyOn(global, 'fetch')
    .mockRejectedValue(new Error('private transport detail'));
  expect(
    await reportPendingCaseEnrollmentFailure('synthetic-test-secret'),
  ).toBe(false);
});

it('reports rejection without interpreting a rejected signal as delivered', async () => {
  jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false } as Response);
  expect(
    await reportPendingCaseEnrollmentFailure('synthetic-test-secret'),
  ).toBe(false);
});
