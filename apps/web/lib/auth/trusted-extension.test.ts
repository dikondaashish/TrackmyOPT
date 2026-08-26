import { describe, expect, it } from 'vitest';
import {
  buildExtensionTokenRedirectUrl,
  isAllowedExtensionRedirectUri,
  isValidExtensionAuthState,
} from '@/lib/auth/trusted-extension';

const extensionRedirect =
  'https://hfljbefkccdmlnhclfojlafipjnjbajm.chromiumapp.org/callback';

describe('trusted extension redirect URIs', () => {
  it('accepts only the published extension identity redirect origin', () => {
    expect(isAllowedExtensionRedirectUri(extensionRedirect)).toBe(true);
    expect(isAllowedExtensionRedirectUri('https://attacker.example/callback')).toBe(false);
    expect(
      isAllowedExtensionRedirectUri(
        'https://hfljbefkccdmlnhclfojlafipjnjbajm.chromiumapp.org.attacker.example/'
      )
    ).toBe(false);
    expect(
      isAllowedExtensionRedirectUri(
        'chrome-extension://hfljbefkccdmlnhclfojlafipjnjbajm/'
      )
    ).toBe(false);
  });

  it('keeps the token out of the request URL and safely encodes the state', () => {
    const url = buildExtensionTokenRedirectUrl(
      extensionRedirect,
      'state with spaces & symbols',
      'header.payload.signature'
    );

    expect(url.search).toBe('');
    expect(url.hash).toBe(
      '#id_token=header.payload.signature&state=state+with+spaces+%26+symbols'
    );
  });

  it('bounds callback state before it is echoed back to the extension', () => {
    expect(isValidExtensionAuthState('nonce-123')).toBe(true);
    expect(isValidExtensionAuthState('')).toBe(false);
    expect(isValidExtensionAuthState('x'.repeat(513))).toBe(false);
  });
});
