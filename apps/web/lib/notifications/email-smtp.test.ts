import { afterEach, expect, it, vi } from 'vitest';

const sendMail = vi.hoisted(() => vi.fn());
vi.mock('nodemailer', () => ({
  default: { createTransport: () => ({ sendMail, close: vi.fn() }) },
}));

import { isSmtpAuthError, sendMailWithRetry } from './email-smtp';

afterEach(() => {
  vi.restoreAllMocks();
  sendMail.mockReset();
});

const authError = () =>
  Object.assign(new Error('Invalid login: 535 5.7.8 Authentication Failed'), {
    code: 'EAUTH',
    responseCode: 535,
  });

it('recognises rejected SMTP logins', () => {
  expect(isSmtpAuthError(authError())).toBe(true);
  expect(isSmtpAuthError(Object.assign(new Error('x'), { responseCode: 534 }))).toBe(true);
  expect(isSmtpAuthError(new Error('Connection timeout'))).toBe(false);
  expect(isSmtpAuthError(null)).toBe(false);
});

it('stops after one attempt and logs one error when SMTP rejects the login (TRACKMYOPT-3K)', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  sendMail.mockRejectedValue(authError());
  await expect(sendMailWithRetry({ to: 'synthetic@example.test' })).rejects.toThrow(
    'Authentication Failed'
  );
  expect(sendMail).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledWith(
    'Email send failed: SMTP login rejected; check SMTP_USER/SMTP_PASS'
  );
});

it('warns on intermediate failures and reports only the last one', async () => {
  vi.useFakeTimers();
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
  sendMail.mockRejectedValue(new Error('Connection timeout'));
  const sent = sendMailWithRetry({ to: 'synthetic@example.test' }, 2);
  const settled = expect(sent).rejects.toThrow('Connection timeout');
  await vi.runAllTimersAsync();
  await settled;
  expect(warn).toHaveBeenCalledTimes(1);
  expect(error).toHaveBeenCalledTimes(1);
  vi.useRealTimers();
});
