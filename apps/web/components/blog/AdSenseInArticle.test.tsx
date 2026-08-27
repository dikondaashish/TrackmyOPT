import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_TIMESTAMP_KEY,
  setStoredCookieConsent,
} from '@/lib/cookie-consent';
import { AdSenseInArticle } from './AdSenseInArticle';

describe('AdSenseInArticle', () => {
  beforeEach(() => {
    localStorage.clear();
    delete window.adsbygoogle;
  });

  afterEach(() => cleanup());

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
  });

  it('responds when a user accepts consent after the article mounts', () => {
    render(<AdSenseInArticle />);
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();

    act(() => {
      setStoredCookieConsent('accepted');
    });

    expect(screen.getByRole('complementary', { name: 'Advertisement' })).toBeInTheDocument();
  });
});
