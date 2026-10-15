import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { OnboardingWizard } from './OnboardingWizard';
import {
  captureClientEvent,
  captureOnboardingStepCompleted,
} from '@/lib/posthog-client';
import { hasConsent } from '@/lib/privacy/privacy-manager';

vi.mock('next/link', () => ({
  default: ({
    onNavigate,
    children,
    ...props
  }: React.ComponentProps<'a'> & { onNavigate?: () => void }) => (
    <a
      {...props}
      onClick={(e) => {
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          onNavigate?.();
        }
      }}
    >
      {children}
    </a>
  ),
}));
vi.mock('@/hooks/useToast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/hooks/useOnboardingReceiptVariant', () => ({
  useOnboardingReceiptVariant: () => ({ variant: 'control' }),
}));
vi.mock('@/lib/privacy/privacy-manager', () => ({
  hasConsent: vi.fn(() => true),
}));
vi.mock('@/lib/posthog-client', () => ({
  captureClientEvent: vi.fn(),
  captureOnboardingStepViewed: vi.fn(),
  captureOnboardingStepCompleted: vi.fn(),
  captureOnboardingReceiptPromptShown: vi.fn(),
  captureOnboardingReceiptSkipped: vi.fn(),
  captureCaseStatusCheckCompletedClient: vi.fn(),
  captureOnboardingSkipped: vi.fn(),
  captureOnboardingCompleted: vi.fn(),
}));
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(hasConsent).mockReturnValue(true);
  vi.stubGlobal('fetch', vi.fn());
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('onboarding starting choices', () => {
  it('goes straight to case tracking without writing completion flags or reloading', () => {
    const onSkip = vi.fn();
    const onComplete = vi.fn();
    render(<OnboardingWizard isOpen onSkip={onSkip} onComplete={onComplete} />);
    const link = screen.getByRole('link', { name: /track my case/i });
    expect(link).toHaveAttribute('href', '/dashboard/case-status');
    fireEvent.click(link);
    expect(onSkip).toHaveBeenCalledOnce();
    expect(onComplete).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(captureClientEvent).toHaveBeenCalledWith(
      'onboarding_intent_selected',
      { intent: 'case_tracking', source: 'onboarding_wizard' }
    );
    expect(captureOnboardingStepCompleted).not.toHaveBeenCalled();
  });
  it('keeps OPT date setup on its existing wizard path', () => {
    const onSkip = vi.fn();
    render(<OnboardingWizard isOpen onSkip={onSkip} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /set up OPT dates/i }));
    expect(
      screen.queryByRole('link', { name: /track my case/i })
    ).not.toBeInTheDocument();
    expect(captureOnboardingStepCompleted).toHaveBeenCalledWith({
      step: 'welcome',
    });
    expect(captureClientEvent).toHaveBeenCalledWith(
      'onboarding_intent_selected',
      { intent: 'opt_dates', source: 'onboarding_wizard' }
    );
    expect(onSkip).not.toHaveBeenCalled();
  });
  it('does not capture intent without consent or dismiss for a new-tab click', () => {
    vi.mocked(hasConsent).mockReturnValue(false);
    const onSkip = vi.fn();
    render(<OnboardingWizard isOpen onSkip={onSkip} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole('link', { name: /track my case/i }), {
      metaKey: true,
    });
    expect(onSkip).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('link', { name: /track my case/i }));
    expect(onSkip).toHaveBeenCalledOnce();
    expect(captureClientEvent).not.toHaveBeenCalled();
  });
});
