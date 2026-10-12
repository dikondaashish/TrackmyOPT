import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_TIMESTAMP_KEY,
  setStoredCookieConsent,
} from '@/lib/cookie-consent';
import { ADSENSE_READY_EVENT } from '@/lib/adsense';
import { AdSenseInArticle } from './AdSenseInArticle';

describe('AdSenseInArticle', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(320);
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      }
    );
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

    expect(
      screen.getByRole('complementary', { name: 'Advertisement' })
    ).toBeInTheDocument();
    expect(
      screen
        .getByRole('complementary')
        .querySelector('[data-ad-slot="5965065084"]')
    ).toBeInTheDocument();
    expect(window.adsbygoogle).toHaveLength(1);
    expect(document.getElementById('adsense-script')).toBeInTheDocument();
  });

  it('responds when a user accepts consent after the article mounts', () => {
    render(<AdSenseInArticle />);
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();

    act(() => {
      setStoredCookieConsent('accepted');
    });

    expect(
      screen.getByRole('complementary', { name: 'Advertisement' })
    ).toBeInTheDocument();
  });

  it('queues each element once while the SDK status attribute is still absent', () => {
    setStoredCookieConsent('accepted');
    render(<AdSenseInArticle />);
    act(() => {
      window.dispatchEvent(new Event(ADSENSE_READY_EVENT));
      window.dispatchEvent(new Event(ADSENSE_READY_EVENT));
    });
    expect(window.adsbygoogle).toHaveLength(1);
  });

  it('waits for the actual ad width, even when its container is wide', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(
      function (this: HTMLElement) {
        return this.tagName === 'INS' ? 139 : 320;
      }
    );
    setStoredCookieConsent('accepted');
    render(<AdSenseInArticle />);
    expect(window.adsbygoogle).toBeUndefined();
  });

  it('rechecks current width when the SDK becomes ready', () => {
    setStoredCookieConsent('accepted');
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(0);
    render(<AdSenseInArticle />);
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(320);
    act(() => window.dispatchEvent(new Event(ADSENSE_READY_EVENT)));
    expect(window.adsbygoogle).toHaveLength(1);
  });

  it('initializes after a resize without repeated requests', () => {
    let notifyResize = () => {};
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          notifyResize = callback;
        }
        observe() {}
        disconnect() {}
      }
    );
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(0);
    setStoredCookieConsent('accepted');
    render(<AdSenseInArticle />);
    expect(window.adsbygoogle).toBeUndefined();
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(320);
    act(() => {
      notifyResize();
      notifyResize();
    });
    expect(window.adsbygoogle).toHaveLength(1);
  });

  it('reports an unexpected initialization failure without vendor payloads', () => {
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});
    window.adsbygoogle = [];
    vi.spyOn(window.adsbygoogle, 'push').mockImplementation(() => {
      throw new Error('private vendor payload');
    });
    setStoredCookieConsent('accepted');
    render(<AdSenseInArticle />);
    act(() => window.dispatchEvent(new Event(ADSENSE_READY_EVENT)));
    expect(report).toHaveBeenCalledExactlyOnceWith(
      '[AdSenseInArticle] ad initialization failed'
    );
  });

  it('does not queue a fluid ad in a container narrower than 250px', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(200);
    setStoredCookieConsent('accepted');
    render(<AdSenseInArticle />);
    expect(screen.getByRole('complementary')).toBeInTheDocument();
    expect(window.adsbygoogle).toBeUndefined();
  });
});
