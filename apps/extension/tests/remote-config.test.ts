import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  REMOTE_CONFIG_MAX_BYTES,
  detectorMode,
  featureBlock,
  normalizeEffectiveConfig,
  platformForHostname,
  resolveEffectiveConfig,
  validateRemoteConfig,
  type RemoteConfigV1,
} from '../src/platform-config/remote-config';
import { BASELINE_CONFIG, baselineEffectiveConfig } from '../src/platform-config/remote-config-baseline';
import {
  createRemoteConfigController,
  retryDelayMs,
  type RemoteConfigState,
} from '../src/background/background-remote-config';

const NOW = Date.parse('2026-10-17T12:00:00.000Z');
const valid = (overrides: Partial<RemoteConfigV1> = {}): RemoteConfigV1 => ({
  schemaVersion: 1,
  version: '2026-10-17.1',
  issuedAt: '2026-10-17T00:00:00.000Z',
  expiresAt: '2026-10-24T00:00:00.000Z',
  killSwitches: {},
  ...overrides,
});

test('accepts a minimal valid config and a full declarative one', () => {
  assert.equal(validateRemoteConfig(valid()).ok, true);
  const full = validateRemoteConfig(valid({
    minExtensionVersion: '0.2.4',
    killSwitches: {
      autofill: { disabled: true, reason: 'incident' },
      platforms: { workday: { disabled: true, reason: 'site_change' } },
      capabilities: { resumeUpload: { disabled: true, reason: 'maintenance' } },
      detectors: { workday_network: { disabled: true, reason: 'incident' } },
    },
    detectors: { workday_network: { mode: 'active' } },
    fieldRules: { workday: { labelAliases: [{ kind: 'postalCode', phrases: ['postal code', 'zip/postal'] }], ignoreLabels: ['referral email'] } },
  }));
  assert.equal(full.ok, true);
});

test('rejects unknown keys, executable-looking phrases, and unsupported kinds', () => {
  const unknownKey = validateRemoteConfig({ ...valid(), script: 'alert(1)' });
  assert.equal(unknownKey.ok, false);
  for (const phrase of ['input[name="x"]', '.*', '<b>zip</b>', 'zip${x}', 'Zip Code', 'a']) {
    const result = validateRemoteConfig(valid({ fieldRules: { workday: { labelAliases: [{ kind: 'postalCode', phrases: [phrase] }] } } }));
    assert.equal(result.ok, false, phrase);
  }
  const sensitive = validateRemoteConfig({ ...valid(), fieldRules: { workday: { labelAliases: [{ kind: 'workAuthorization', phrases: ['work authorization'] }] } } });
  assert.equal(sensitive.ok, false, 'remote rules can never target sensitive answers');
  const domain = validateRemoteConfig({ ...valid(), fieldRules: { 'evil.com': { ignoreLabels: ['x y'] } } });
  assert.equal(domain.ok, false, 'remote rules can never add platforms or domains');
  const selectorKey = validateRemoteConfig({ ...valid(), fieldRules: { workday: { selectors: ['#x'] } } });
  assert.equal(selectorKey.ok, false);
});

test('rejects bad versions, lifetimes beyond 30 days, and oversized payloads', () => {
  assert.equal(validateRemoteConfig(valid({ version: 'latest' })).ok, false);
  assert.equal(validateRemoteConfig(valid({ expiresAt: '2026-12-30T00:00:00.000Z' })).ok, false);
  assert.equal(validateRemoteConfig(valid({ expiresAt: '2026-10-16T00:00:00.000Z' })).ok, false);
  assert.equal(validateRemoteConfig({ ...valid(), schemaVersion: 2 }).ok, false);
  assert.equal(validateRemoteConfig(valid(), REMOTE_CONFIG_MAX_BYTES + 1).ok, false);
  assert.equal(validateRemoteConfig(valid({ killSwitches: { autofill: { disabled: false as never, reason: 'incident' } } })).ok, false);
});

test('baseline ships the unverified Workday network detector in shadow mode', () => {
  const effective = baselineEffectiveConfig(NOW);
  assert.equal(effective.source, 'baseline');
  assert.equal(effective.detectors.workday_network, 'shadow');
  assert.equal(effective.detectors.page_confirmation, 'active');
  assert.equal(effective.ruleVersion, BASELINE_CONFIG.ruleVersion);
});

test('expired config falls back to bundled rules but keeps emergency switches', () => {
  const stored = valid({
    expiresAt: '2026-10-17T06:00:00.000Z',
    killSwitches: { platforms: { workday: { disabled: true, reason: 'site_change' } } },
    detectors: { workday_network: { mode: 'active' } },
  });
  const effective = resolveEffectiveConfig({ baseline: BASELINE_CONFIG, stored, now: NOW, extensionVersion: '0.2.4' });
  assert.equal(effective.source, 'remote_expired');
  assert.equal(effective.detectors.workday_network, 'shadow', 'an expired promotion is not trusted');
  assert.equal(featureBlock(effective, { platform: 'workday' }).blocked, true, 'never silently re-enabled');
  assert.equal(effective.killSwitchVersion, '2026-10-17.1');
});

test('config requiring a newer extension keeps switches and ignores rules', () => {
  const stored = valid({ minExtensionVersion: '9.0.0', killSwitches: { autofill: { disabled: true, reason: 'incident' } },
    fieldRules: { workday: { ignoreLabels: ['middle name'] } } });
  const effective = resolveEffectiveConfig({ baseline: BASELINE_CONFIG, stored, now: NOW, extensionVersion: '0.2.4' });
  assert.equal(effective.source, 'remote_incompatible');
  assert.deepEqual(effective.fieldRules, {});
  assert.equal(featureBlock(effective, { autofill: true }).blocked, true);
});

test('feature blocks cover all autofill, one platform, one capability, and one detector', () => {
  const effective = resolveEffectiveConfig({ baseline: BASELINE_CONFIG, now: NOW, extensionVersion: '0.2.4', stored: valid({
    killSwitches: {
      platforms: { greenhouse: { disabled: true, reason: 'site_change' } },
      capabilities: { resumeUpload: { disabled: true, reason: 'maintenance' } },
      detectors: { workday_network: { disabled: true, reason: 'incident' } },
    },
    detectors: { workday_network: { mode: 'active' } },
  }) });
  assert.deepEqual(featureBlock(effective, { platform: 'greenhouse' }), { blocked: true, scope: 'platform', reason: 'site_change' });
  assert.equal(featureBlock(effective, { platform: 'lever' }).blocked, false);
  assert.equal(featureBlock(effective, { platform: 'lever', capability: 'resumeUpload' }).blocked, true);
  assert.equal(featureBlock(effective, { platform: 'lever', capability: 'contact' }).blocked, false);
  assert.equal(detectorMode(effective, 'workday_network'), 'off', 'a killed detector is off even if promoted');
  assert.equal(detectorMode(effective, 'page_confirmation'), 'active');
  const allOff = resolveEffectiveConfig({ baseline: BASELINE_CONFIG, now: NOW, extensionVersion: '0.2.4',
    stored: valid({ killSwitches: { autofill: { disabled: true, reason: 'incident' } } }) });
  assert.equal(featureBlock(allOff, { platform: 'lever', capability: 'contact' }).scope, 'autofill');
  assert.equal(featureBlock(allOff, { detector: 'page_confirmation', autofill: false }).blocked, false,
    'disabling autofill does not stop manual tracking or detection');
});

test('platform ids come only from bundled host lists', () => {
  assert.equal(platformForHostname('acme.wd5.myworkdayjobs.com'), 'workday');
  assert.equal(platformForHostname('boards.greenhouse.io'), 'greenhouse');
  assert.equal(platformForHostname('myworkdayjobs.com.evil.example'), 'generic');
  assert.equal(platformForHostname('jobs.ashbyhq.com'), 'ashby');
});

test('content-side normalization rejects tampered storage', () => {
  const fallback = baselineEffectiveConfig(NOW);
  assert.equal(normalizeEffectiveConfig({ version: 1, ruleVersion: 'x', detectors: { workday_network: 'turbo' }, killSwitches: {} }, fallback), fallback);
  assert.equal(normalizeEffectiveConfig('nope', fallback), fallback);
  const ok = normalizeEffectiveConfig({ ...fallback, killSwitches: { autofill: { disabled: true, reason: 'incident' } } }, fallback);
  assert.equal(featureBlock(ok, { autofill: true }).blocked, true);
});

function harness(responses: Array<() => Response | Promise<Response>>, initial?: RemoteConfigState) {
  let state = initial;
  let effective: unknown;
  let now = NOW;
  const requests: Array<Record<string, string>> = [];
  const reports: string[] = [];
  let bearerCalls = 0;
  const controller = createRemoteConfigController({
    read: async () => state,
    write: async (next, nextEffective) => { state = next; effective = nextEffective; },
    fetch: async headers => { requests.push(headers); const next = responses.shift(); if (!next) throw new Error('no response'); return next(); },
    bearer: async () => { bearerCalls += 1; return 'token'; },
    now: () => now,
    version: () => '0.2.4',
    random: () => 0.5,
    report: async input => { reports.push(`${input.code}:${input.stage}`); return true; },
  });
  return { controller, requests, reports, get state() { return state!; }, get effective() { return effective as ReturnType<typeof baselineEffectiveConfig>; },
    advance: (ms: number) => { now += ms; }, get bearerCalls() { return bearerCalls; } };
}

const json = (body: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(body), { status: 200, ...init });

test('stores a valid config with its ETag and revalidates with If-None-Match', async () => {
  const h = harness([
    () => json({ config: valid() }, { headers: { ETag: '"v1"' } }),
    () => new Response(null, { status: 304 }),
  ]);
  assert.equal(await h.controller.refresh(), 'updated');
  assert.equal(h.state.etag, '"v1"');
  assert.equal(h.effective.ruleVersion, '2026-10-17.1');
  h.advance(56 * 60 * 1000);
  assert.equal(await h.controller.refresh(), 'not_modified');
  assert.equal(h.requests[1]['If-None-Match'], '"v1"');
  assert.equal(h.effective.ruleVersion, '2026-10-17.1');
});

test('malformed or unavailable responses keep the last-known-good config and back off', async () => {
  const good = valid({ killSwitches: { platforms: { lever: { disabled: true, reason: 'site_change' } } } });
  const h = harness([
    () => json({ config: good }, { headers: { ETag: '"g"' } }),
    () => json({ config: { ...good, version: 'bad' } }),
    () => new Response('{', { status: 200 }),
    () => new Response('oops', { status: 503 }),
    () => { throw new TypeError('offline'); },
  ]);
  await h.controller.refresh();
  for (const expected of ['rejected_invalid', 'rejected_invalid', 'failed', 'failed']) {
    h.advance(7 * 60 * 60 * 1000);
    assert.equal(await h.controller.refresh(), expected);
    assert.equal(h.effective.ruleVersion, good.version, 'last-known-good survives');
    assert.equal(featureBlock(h.effective, { platform: 'lever' }).blocked, true);
  }
  assert.equal(h.state.failures, 4);
  assert.ok(h.state.nextAttemptAt > NOW);
  assert.deepEqual(h.reports, ['remote_config_invalid:validation', 'remote_config_invalid:json',
    'remote_config_fetch_failed:http', 'remote_config_fetch_failed:network']);
});

test('backoff skips requests until the retry time, then grows with jitter bounds', async () => {
  const h = harness([() => new Response('', { status: 500 })]);
  assert.equal(await h.controller.refresh(), 'failed');
  assert.equal(await h.controller.refresh(), 'skipped_backoff');
  assert.equal(h.requests.length, 1);
  assert.equal(retryDelayMs(1, () => 0.5), 5 * 60 * 1000);
  assert.equal(retryDelayMs(3, () => 0.5), 20 * 60 * 1000);
  assert.equal(retryDelayMs(20, () => 0.5), 6 * 60 * 60 * 1000);
  assert.ok(retryDelayMs(1, () => 0) >= 4 * 60 * 1000);
});

test('no active server config keeps current switches; a newer config is required to clear one', async () => {
  const killed = valid({ killSwitches: { autofill: { disabled: true, reason: 'incident' } } });
  const h = harness([
    () => json({ config: killed }),
    () => new Response(null, { status: 204 }),
    () => json({ config: valid({ version: '2026-10-17.2' }) }),
  ]);
  await h.controller.refresh();
  h.advance(60 * 60 * 1000);
  assert.equal(await h.controller.refresh(), 'no_remote_config');
  assert.equal(featureBlock(h.effective, { autofill: true }).blocked, true);
  h.advance(60 * 60 * 1000);
  assert.equal(await h.controller.refresh(), 'updated');
  assert.equal(featureBlock(h.effective, { autofill: true }).blocked, false);
});

test('rollback: the server re-activating an older version is applied and identifiable', async () => {
  const h = harness([
    () => json({ config: valid({ version: '2026-10-17.3', detectors: { workday_network: { mode: 'active' } } }) }),
    () => json({ config: valid({ version: '2026-10-17.1' }) }),
  ]);
  await h.controller.refresh();
  assert.equal(h.effective.detectors.workday_network, 'active');
  h.advance(60 * 60 * 1000);
  await h.controller.refresh();
  assert.equal(h.effective.ruleVersion, '2026-10-17.1');
  assert.equal(h.effective.detectors.workday_network, 'shadow');
});

test('expiry is applied by an offline recompute without network', async () => {
  const h = harness([() => json({ config: valid({ detectors: { workday_network: { mode: 'active' } } }) })]);
  await h.controller.refresh();
  h.advance(8 * 24 * 60 * 60 * 1000);
  const effective = await h.controller.recompute();
  assert.equal(effective.source, 'remote_expired');
  assert.equal(effective.detectors.workday_network, 'shadow');
});

test('concurrent refreshes share one request', async () => {
  const h = harness([() => json({ config: valid() })]);
  const [first, second] = await Promise.all([h.controller.refresh(), h.controller.refresh()]);
  assert.equal(first, 'updated');
  assert.equal(second, 'updated');
  assert.equal(h.requests.length, 1);
});

test('tampered stored state is discarded before use', async () => {
  const h = harness([() => new Response(null, { status: 304 })], {
    config: { ...valid(), killSwitches: { autofill: { disabled: true, reason: 'evil' } } } as never,
    etag: '"x"', receivedAt: null, lastCheckedAt: null, failures: 0, nextAttemptAt: 0,
  });
  await h.controller.refresh();
  assert.equal(h.requests[0]['If-None-Match'], undefined, 'no ETag without a usable config');
  assert.equal(h.effective.source, 'baseline');
});
