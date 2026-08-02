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

test('mount fallback stays hidden when no resume was expected yet', () => {
  const fallbackHost = host();
  const visible = renderInactiveArtifactFallback({
    host: fallbackHost as unknown as HTMLElement,
    artifactAvailable: false,
    wasExpected: false,
  });

  assert.equal(visible, false);
  assert.equal(fallbackHost.textContent, '');
  assert.equal(fallbackHost.style.display, 'none');
  assert.equal(fallbackHost.hasAttribute('role'), false);
});

test('mount fallback warns only when a resume was expected but is gone', () => {
  const fallbackHost = host();
  const visible = renderInactiveArtifactFallback({
    host: fallbackHost as unknown as HTMLElement,
    artifactAvailable: false,
    wasExpected: true,
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
    wasExpected: true,
  });

  assert.equal(visible, false);
  assert.equal(fallbackHost.textContent, '');
  assert.equal(fallbackHost.style.display, 'none');
  assert.equal(fallbackHost.hasAttribute('role'), false);
});

test('widget mount peeks the resolver without discarding a rejected artifact', () => {
  const source = readFileSync('src/content-job-portal.ts', 'utf8');
  const block = source.slice(
    source.indexOf('async function reconcileArtifactAvailabilityOnWidgetMount'),
    source.indexOf('function generatedResumeFor'),
  );

  assert.match(block, /RESOLVE_V1_PREFILL_PAYLOAD/);
  assert.match(block, /discardRejectedArtifact:\s*false/);
  assert.match(block, /artifactExpectedForSession/);
});
