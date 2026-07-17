import { beforeEach, describe, expect, it } from 'vitest';
import {
  INACTIVE_ARTIFACT_FALLBACK_MESSAGE,
  renderInactiveArtifactFallback,
} from '../../../extension/src/artifact-fallback-ui';

describe('artifact fallback after content-script recreation', () => {
  beforeEach(() => {
    document.body.textContent = '';
  });

  it('renders the documented fallback instead of a blank state when memory is lost', () => {
    // A recreated content script must explain a missing background artifact
    // even when no page-scoped session marker survived the navigation.
    const host = document.createElement('div');
    document.body.appendChild(host);
    const rendered = renderInactiveArtifactFallback({
      host,
      artifactAvailable: false,
    });

    expect(rendered).toBe(true);
    expect(host.getAttribute('role')).toBe('alert');
    expect(host.textContent).toBe(INACTIVE_ARTIFACT_FALLBACK_MESSAGE);
    expect(host.textContent).toBe(
      'This generated resume is no longer active for this job. Generate again or continue with profile-only prefill.',
    );
  });

  it('does not show the fallback while the background resolver has an artifact', () => {
    const host = document.createElement('div');

    expect(renderInactiveArtifactFallback({
      host,
      artifactAvailable: true,
    })).toBe(false);
    expect(host.textContent).toBe('');
  });
});
