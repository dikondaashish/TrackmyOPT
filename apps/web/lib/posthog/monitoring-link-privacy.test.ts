import { expect, it } from 'vitest';
import {
  isMonitoringCapabilityPage,
  redactMonitoringAnalytics,
} from './monitoring-link-privacy';
it('removes monitoring capabilities from current, referrer and nested identity URLs', () => {
  const link =
    'https://www.trackmyopt.com/premium/monitoring?token=signed-private';
  const login =
    'https://www.trackmyopt.com/login?returnTo=' +
    encodeURIComponent('/premium/monitoring?token=signed-private');
  const event = {
    $current_url: link,
    $referrer: link,
    $set_once: { $initial_current_url: link },
    $set: { $initial_referrer: login },
    source: 'pending_case_email',
  };
  expect(JSON.stringify(redactMonitoringAnalytics(event))).not.toContain(
    'signed-private'
  );
  expect(redactMonitoringAnalytics(event)).toMatchObject({
    source: 'pending_case_email',
    $current_url: 'https://www.trackmyopt.com/premium/monitoring',
  });
  expect(isMonitoringCapabilityPage(link)).toBe(true);
  expect(isMonitoringCapabilityPage(login)).toBe(true);
  expect(isMonitoringCapabilityPage('https://www.trackmyopt.com/pricing')).toBe(
    false
  );
});
it('preserves unrelated attribution and normal analytics', () => {
  const event = {
    $current_url: 'https://www.trackmyopt.com/blog/guide?utm_source=email',
    count: 2,
  };
  expect(redactMonitoringAnalytics(event)).toEqual(event);
});
