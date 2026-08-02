import { beforeEach, describe, expect, it } from 'vitest';
import {
  INACTIVE_ARTIFACT_FALLBACK_MESSAGE,
  renderInactiveArtifactFallback,
} from '../../../extension/src/artifact-fallback-ui';

describe('artifact fallback after content-script recreation', () => {
  beforeEach(() => {
    document.body.textContent = '';
  });

  it('stays hidden when no resume was expected for this job yet', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const rendered = renderInactiveArtifactFallback({
      host,
      artifactAvailable: false,
      wasExpected: false,
    });

    expect(rendered).toBe(false);
    expect(host.textContent).toBe('');
    expect(host.hasAttribute('role')).toBe(false);
  });

  it('renders the documented fallback when a resume was expected but is gone', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const rendered = renderInactiveArtifactFallback({
      host,
      artifactAvailable: false,
      wasExpected: true,
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
      wasExpected: true,
    })).toBe(false);
    expect(host.textContent).toBe('');
  });
});
