import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeWidgetAnalyticsProperties } from '../src/widget/widget-platform';
import { normalizeExtensionWidgetAnalytics } from '../../web/lib/extension/widget-analytics';

const raw = {
  site_family: 'workday', submission_outcome: 'confirmed', confirmation_source: 'automatic',
  evidence_kind: 'network', network_detector_mode: 'shadow', network_verdict: 'success',
  job_url: 'https://acme.wd5.myworkdayjobs.com/job/1', company_name: 'Acme', attempt_id: 'attempt_0000000000000001',
  response_body: '{"id":"x"}', network_verdict_extra: 'free text',
};
const expected = {
  source: 'chrome_extension', site_family: 'workday', submission_outcome: 'confirmed', confirmation_source: 'automatic',
  evidence_kind: 'network', network_detector_mode: 'shadow', network_verdict: 'success',
};

test('submission analytics keep only value-free enums, in the extension and on the server', () => {
  assert.deepEqual(normalizeWidgetAnalyticsProperties('extension_submission_outcome', raw), expected);
  assert.deepEqual(normalizeExtensionWidgetAnalytics({ event: 'extension_submission_outcome', properties: raw })?.properties, expected);
  const tampered = { ...raw, network_verdict: 'success <script>', submission_outcome: 'Applied at Acme' };
  const cleaned = normalizeWidgetAnalyticsProperties('extension_submission_outcome', tampered);
  assert.equal(cleaned.network_verdict, undefined);
  assert.equal(cleaned.submission_outcome, undefined);
});
