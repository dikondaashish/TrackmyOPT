import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const postHogConsent = vi.hoisted(() => vi.fn());
const mockPathname = vi.hoisted(() => vi.fn(() => '/'));

vi.mock('next/navigation', () => ({ usePathname: () => mockPathname() }));
vi.mock('@/lib/posthog/posthog-browser', () => ({
  setPostHogAnalyticsConsent: postHogConsent,
}));
vi.mock('@vercel/analytics/next', () => ({
  Analytics: () => <div data-testid="vercel-analytics" />,
}));
vi.mock('@vercel/speed-insights/next', () => ({
  SpeedInsights: () => <div data-testid="vercel-speed-insights" />,
}));

import { PrivacyProvider } from '@/components/privacy/PrivacyProvider';
import { PrivacySettingsLink } from '@/components/privacy/PrivacySettingsLink';
import { resetPrivacyManagerForTests } from '@/lib/privacy/privacy-manager';
import { resetIntegrationsForTests } from '@/lib/privacy/integrations';

function setRegion(region: string) {
  document.cookie = `tmo_privacy_region=${region}; Path=/`;
}

function renderPrivacy() {
  const view = render(
    <>
      <PrivacySettingsLink />
      <PrivacyProvider />
    </>
  );
  act(() => {
    vi.advanceTimersByTime(1_500);
  });
  return view;
}

const banner = () => screen.queryByRole('region', { name: 'Privacy choices' });

beforeEach(() => {
  vi.useFakeTimers();
  for (const part of document.cookie.split(';')) {
    const name = part.split('=')[0]?.trim();
    if (name) document.cookie = `${name}=; Path=/; Max-Age=0`;
  }
  localStorage.clear();
  document.head.innerHTML = '';
  mockPathname.mockReturnValue('/');
  postHogConsent.mockReset();
  resetIntegrationsForTests();
  resetPrivacyManagerForTests();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('PrivacyProvider', () => {
  it('EU: offers equal Accept, Reject, and Customize choices and loads nothing optional', () => {
    setRegion('EU_EEA');
    renderPrivacy();
    const region = banner()!;
    expect(region).toBeInTheDocument();
    const accept = screen.getByRole('button', { name: 'Accept all' });
    const reject = screen.getByRole('button', { name: 'Reject non-essential' });
    expect(screen.getByRole('button', { name: 'Customize' })).toBeInTheDocument();
    expect(accept.className).toBe(reject.className);
    expect(screen.queryByTestId('vercel-analytics')).not.toBeInTheDocument();
    expect(document.getElementById('ga4-script')).toBeNull();
  });

  it('EU reject hides the banner and the site keeps working', () => {
    setRegion('EU_EEA');
    renderPrivacy();
    fireEvent.click(screen.getByRole('button', { name: 'Reject non-essential' }));
    expect(banner()).not.toBeInTheDocument();
    expect(screen.queryByTestId('vercel-analytics')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open privacy choices' })).toBeInTheDocument();
  });

  it('EU accept mounts consent-gated Vercel Analytics and Speed Insights', () => {
    setRegion('EU_EEA');
    renderPrivacy();
    fireEvent.click(screen.getByRole('button', { name: 'Accept all' }));
    expect(screen.getByTestId('vercel-analytics')).toBeInTheDocument();
    expect(screen.getByTestId('vercel-speed-insights')).toBeInTheDocument();
  });

  it('Customize: essential is locked and analytics can be enabled alone', () => {
    setRegion('UK');
    renderPrivacy();
    fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
    const dialog = screen.getByRole('dialog', { name: 'Your Privacy Choices' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const essential = screen.getByRole('switch', { name: 'Essential' });
    expect(essential).toBeDisabled();
    expect(essential).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('switch', { name: 'Marketing' })).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(screen.getByRole('switch', { name: 'Analytics' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save choices' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(banner()).not.toBeInTheDocument();
    expect(screen.getByTestId('vercel-analytics')).toBeInTheDocument();
    expect(decodeURIComponent(document.cookie)).toContain('"analytics":true');
    expect(decodeURIComponent(document.cookie)).toContain('"marketing":false');
  });

  it('Escape closes settings without saving and restores focus', () => {
    setRegion('EU_EEA');
    renderPrivacy();
    const customize = screen.getByRole('button', { name: 'Customize' });
    customize.focus();
    fireEvent.click(customize);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(banner()).toBeVisible();
    expect(document.activeElement).toBe(customize);
    expect(document.cookie).not.toContain('tmo_consent=');
  });

  it('US: no banner, analytics run, and Your Privacy Choices reopens settings', () => {
    setRegion('US');
    renderPrivacy();
    expect(banner()).not.toBeInTheDocument();
    expect(screen.getByTestId('vercel-analytics')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Your Privacy Choices' }));
    expect(screen.getByRole('dialog', { name: 'Your Privacy Choices' })).toBeInTheDocument();
    expect(screen.getByText(/opts you out of “sale” or “sharing”/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('switch', { name: 'Analytics' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save choices' }));
    expect(screen.queryByTestId('vercel-analytics')).not.toBeInTheDocument();
  });

  it('settings reopen after a previous choice', () => {
    setRegion('EU_EEA');
    renderPrivacy();
    fireEvent.click(screen.getByRole('button', { name: 'Accept all' }));
    fireEvent.click(screen.getByRole('button', { name: 'Your Privacy Choices' }));
    expect(screen.getByRole('switch', { name: 'Analytics' })).toHaveAttribute('aria-checked', 'true');
  });

  it('GPC locks marketing off with an explanation', () => {
    Object.defineProperty(navigator, 'globalPrivacyControl', { configurable: true, get: () => true });
    try {
      setRegion('US');
      renderPrivacy();
      fireEvent.click(screen.getByRole('button', { name: 'Your Privacy Choices' }));
      const marketing = screen.getByRole('switch', { name: 'Marketing' });
      expect(marketing).toBeDisabled();
      expect(marketing).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByText(/Global Privacy Control signal is on/)).toBeInTheDocument();
    } finally {
      Object.defineProperty(navigator, 'globalPrivacyControl', { configurable: true, get: () => undefined });
    }
  });

  it('hides the floating shortcut on dashboard pages', () => {
    setRegion('EU_EEA');
    mockPathname.mockReturnValue('/dashboard');
    renderPrivacy();
    fireEvent.click(screen.getByRole('button', { name: 'Reject non-essential' }));
    expect(screen.queryByRole('button', { name: 'Open privacy choices' })).not.toBeInTheDocument();
  });
});
