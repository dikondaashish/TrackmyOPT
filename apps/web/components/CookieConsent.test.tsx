import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  COOKIE_CONSENT_KEY,
  COOKIE_CONSENT_TIMESTAMP_KEY,
  requestOpenPrivacyChoices,
} from '@/lib/cookie-consent';
import { CookieConsent } from './CookieConsent';

const postHogConsent = vi.hoisted(() => vi.fn());
const mockPathname = vi.hoisted(() => vi.fn(() => '/'));

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

vi.mock('@/lib/posthog/posthog-browser', () => ({
  setPostHogAnalyticsConsent: postHogConsent,
}));

function storeChoice(choice: 'accepted' | 'declined') {
  localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  localStorage.setItem(COOKIE_CONSENT_TIMESTAMP_KEY, Date.now().toString());
}

describe('CookieConsent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    postHogConsent.mockReset();
    mockPathname.mockReturnValue('/');
    document.getElementById('ga4-script')?.remove();
    document.getElementById('ga4-init')?.remove();
    document.getElementById('adsense-script')?.remove();
    delete (window as Window & { gtag?: unknown }).gtag;
    delete (window as Window & { dataLayer?: unknown }).dataLayer;
    delete (window as Window & { googleConsentInitialized?: unknown }).googleConsentInitialized;
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('offers an equal Essential Only choice before optional browser tools load', () => {
    render(<CookieConsent />);

    act(() => {
      vi.advanceTimersByTime(1_500);
    });

    expect(
      screen.getByRole('region', { name: 'Privacy choices' })
    ).toBeInTheDocument();
    expect(screen.getByText(/server-side events/i)).toBeInTheDocument();
    expect(document.getElementById('ga4-script')).toBeNull();
    expect(document.getElementById('adsense-script')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Essential Only' }));

    expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBe('declined');
    expect(postHogConsent).toHaveBeenLastCalledWith(false);
    expect(
      screen.getByRole('button', { name: 'Open privacy choices' })
    ).toBeInTheDocument();
  });

  it('loads optional browser tools for an accepted stored choice', () => {
    storeChoice('accepted');

    render(<CookieConsent />);

    expect(postHogConsent).toHaveBeenLastCalledWith(true);
    expect(document.getElementById('ga4-script')).toHaveAttribute(
      'src',
      'https://www.googletagmanager.com/gtag/js?id=G-SC3M6PN10V'
    );
    expect(document.getElementById('adsense-script')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Open privacy choices' })
    ).toBeInTheDocument();
  });

  it('keeps dashboard routes free of advertising scripts and floating triggers', () => {
    storeChoice('accepted');
    mockPathname.mockReturnValue('/dashboard/career/resume-generator');

    render(<CookieConsent />);

    expect(
      screen.queryByRole('button', { name: 'Open privacy choices' })
    ).not.toBeInTheDocument();
    expect(document.getElementById('adsense-script')).toBeNull();
  });

  it('opens the panel when privacy choices are requested elsewhere', () => {
    storeChoice('accepted');
    mockPathname.mockReturnValue('/dashboard');

    render(<CookieConsent />);

    act(() => {
      requestOpenPrivacyChoices();
    });

    expect(
      screen.getByRole('region', { name: 'Privacy choices' })
    ).toBeInTheDocument();
  });

  it('lets an accepted user switch to Essential Only and restarts without optional tags', () => {
    storeChoice('accepted');
    const reloadPage = vi.fn();
    const gtag = vi.fn();
    (window as Window & { gtag?: (...args: unknown[]) => void }).gtag = gtag;

    render(<CookieConsent reloadPage={reloadPage} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Open privacy choices' })
    );

    expect(screen.getByText(/Current choice:/i)).toHaveTextContent(
      'Accept All'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Essential Only' }));

    expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBe('declined');
    expect(postHogConsent).toHaveBeenLastCalledWith(false);
    expect(gtag).toHaveBeenCalledWith('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
    expect(reloadPage).toHaveBeenCalledOnce();
  });

  it('closes reopened choices without changing the saved decision', () => {
    storeChoice('accepted');
    const reloadPage = vi.fn();

    render(<CookieConsent reloadPage={reloadPage} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Open privacy choices' })
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Close privacy choices' })
    );

    expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBe('accepted');
    expect(reloadPage).not.toHaveBeenCalled();
  });
  it('queues denied defaults and granted consent before configuring the tag only once', () => {
    storeChoice('accepted');
    const { unmount } = render(<CookieConsent />);
    const commands = (window as Window & { dataLayer?: IArguments[] }).dataLayer!.map((entry) => Array.from(entry));
    expect(commands[0]).toEqual(['consent', 'default', {
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied',
    }]);
    expect(commands[1]).toEqual(['consent', 'update', {
      ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted',
    }]);
    expect(commands[3]).toEqual(['config', 'G-SC3M6PN10V']);
    unmount();
    render(<CookieConsent />);
    const updated = (window as Window & { dataLayer?: IArguments[] }).dataLayer!.map((entry) => Array.from(entry));
    expect(updated.filter((entry) => entry[0] === 'config')).toHaveLength(1);
    expect(document.querySelectorAll('#ga4-script')).toHaveLength(1);
  });

  it('loads the new tag only after a visitor accepts', () => {
    render(<CookieConsent />);
    act(() => { vi.advanceTimersByTime(1_500); });
    expect(document.getElementById('ga4-script')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Accept All' }));
    expect(document.getElementById('ga4-script')).toHaveAttribute('src', 'https://www.googletagmanager.com/gtag/js?id=G-SC3M6PN10V');
    expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBe('accepted');
  });

});
