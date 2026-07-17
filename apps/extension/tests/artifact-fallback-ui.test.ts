import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  INACTIVE_ARTIFACT_FALLBACK_MESSAGE,
  renderInactiveArtifactFallback,
} from '../src/artifact-fallback-ui';

function host() {
  const attributes = new Map<string, string>();
  return {
    textContent: '',
    style: { display: '' },
    setAttribute(name: string, value: string) {
      attributes.set(name, value);
    },
    removeAttribute(name: string) {
      attributes.delete(name);
    },
    hasAttribute(name: string) {
      return attributes.has(name);
    },
  };
}

test('mount fallback is visible for a missing artifact even without a session marker', () => {
  const fallbackHost = host();
  const visible = renderInactiveArtifactFallback({
    host: fallbackHost as unknown as HTMLElement,
    artifactAvailable: false,
  });

  assert.equal(visible, true);
  assert.equal(fallbackHost.textContent, INACTIVE_ARTIFACT_FALLBACK_MESSAGE);
  assert.equal(fallbackHost.style.display, 'block');
  assert.equal(fallbackHost.hasAttribute('role'), true);
});

test('mount fallback is suppressed when the background resolver has an artifact', () => {
  const fallbackHost = host();
  const visible = renderInactiveArtifactFallback({
    host: fallbackHost as unknown as HTMLElement,
    artifactAvailable: true,
  });

  assert.equal(visible, false);
  assert.equal(fallbackHost.textContent, '');
  assert.equal(fallbackHost.style.display, 'none');
  assert.equal(fallbackHost.hasAttribute('role'), false);
});

test('every widget mount calls the background resolver without marker-gated early return', () => {
  const source = readFileSync('src/content-job-portal.ts', 'utf8');
  const block = source.slice(
    source.indexOf('async function reconcileArtifactAvailabilityOnWidgetMount'),
    source.indexOf('function generatedResumeFor'),
  );

  assert.match(block, /RESOLVE_V1_PREFILL_PAYLOAD/);
  assert.doesNotMatch(block, /artifactExpectedForSession/);
  assert.doesNotMatch(block, /if \(!storage[^)]*\) return/);
});
