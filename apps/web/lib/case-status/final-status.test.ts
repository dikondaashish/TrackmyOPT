import { describe, expect, it } from 'vitest';
import { isFinalCaseStatus } from './final-status';

describe('isFinalCaseStatus', () => {
  it.each([
    'Card Was Delivered To Me By The Post Office',
    'Case Was Denied',
    'Withdrawal Acknowledged',
  ])('treats %s as final', (status) => {
    expect(isFinalCaseStatus(status)).toBe(true);
  });

  it.each([null, undefined, '', 'Case Was Approved', 'Card Was Mailed To Me'])(
    'keeps checking %s',
    (status) => {
      expect(isFinalCaseStatus(status)).toBe(false);
    }
  );
});
