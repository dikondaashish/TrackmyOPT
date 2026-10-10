import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_TIMESTAMP_KEY,
  setStoredCookieConsent,
} from '@/lib/cookie-consent';
import { AdSenseInArticle } from './AdSenseInArticle';

describe('AdSenseInArticle', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(320);
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      disconnect() {}
    });
    localStorage.clear();
    delete window.adsbygoogle;
    document.getElementById('adsense-script')?.remove();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('does not render an ad request without advertising consent', () => {
    render(<AdSenseInArticle />);

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    expect(window.adsbygoogle).toBeUndefined();
  });

  it('renders and queues the unit after consent', () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    localStorage.setItem(COOKIE_CONSENT_TIMESTAMP_KEY, Date.now().toString());

    render(<AdSenseInArticle />);

    expect(screen.getByRole('complementary', { name: 'Advertisement' })).toBeInTheDocument();
    expect(screen.getByRole('complementary').querySelector('[data-ad-slot="5965065084"]')).toBeInTheDocument();
    expect(window.adsbygoogle).toHaveLength(1);
    expect(document.getElementById('adsense-script')).toBeInTheDocument();
  });

  it('responds when a user accepts consent after the article mounts', () => {
    render(<AdSenseInArticle />);
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();

    act(() => {
      setStoredCookieConsent('accepted');
    });

    expect(screen.getByRole('complementary', { name: 'Advertisement' })).toBeInTheDocument();
  });

  it('does not queue a fluid ad in a container narrower than 250px', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(200);
    setStoredCookieConsent('accepted');
    render(<AdSenseInArticle />);
    expect(screen.getByRole('complementary')).toBeInTheDocument();
    expect(window.adsbygoogle).toBeUndefined();
  });
});
