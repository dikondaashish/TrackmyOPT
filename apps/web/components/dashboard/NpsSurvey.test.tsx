import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  capture: vi.fn(),
  submitted: vi.fn(),
  shown: vi.fn(),
}));
vi.mock('@/lib/privacy/privacy-manager', () => ({ hasConsent: () => true }));
vi.mock('@/lib/premium/usePremiumStatus', () => ({
  usePremiumStatus: () => ({ isPremium: false, planName: null }),
}));
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: async () => ({
        data: { user: { id: 'user-1', created_at: '2026-11-01T00:00:00Z' } },
      }),
    },
  },
}));
vi.mock('@/lib/posthog-client', () => ({
  captureClientEvent: m.capture,
  captureNpsDismissed: vi.fn(),
  captureNpsShown: m.shown,
  captureNpsSubmitted: m.submitted,
  setNpsLastShownPersonProperty: vi.fn(),
}));

import { NpsSurvey } from './NpsSurvey';
import {
  NPS_SHOW_DELAY_MS,
  requestNpsSurvey,
} from '@/lib/posthog/nps-survey';

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

async function openSurvey() {
  render(<NpsSurvey />);
  await act(async () => {
    requestNpsSurvey({ trigger: 'case_approved_viewed', planTier: 'free' });
    // Let the auth lookup resolve, then run the show delay.
    await Promise.resolve();
    await Promise.resolve();
    vi.advanceTimersByTime(NPS_SHOW_DELAY_MS);
  });
  expect(
    screen.getByText('How likely are you to recommend TrackMyOPT?')
  ).toBeInTheDocument();
}

it('asks a promoter to share a link or send a story', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });
  await openSurvey();
  expect(m.shown).toHaveBeenCalledWith(
    expect.objectContaining({ trigger: 'case_approved_viewed' })
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'Rate TrackMyOPT 10 out of 10' })
  );
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(m.submitted).toHaveBeenCalledWith(
    expect.objectContaining({ score: 10, category: 'promoter' })
  );
  expect(screen.getByText('Thank you. That helps a lot.')).toBeInTheDocument();
  expect(m.capture).toHaveBeenCalledWith('nps_promoter_followup_shown', {
    trigger: 'case_approved_viewed',
    plan_tier: 'free',
  });

  await act(async () => {
    fireEvent.click(
      screen.getByRole('button', { name: 'Copy a link to share' })
    );
    await Promise.resolve();
  });
  expect(writeText).toHaveBeenCalledWith(
    expect.stringContaining('https://www.trackmyopt.com/')
  );
  expect(m.capture).toHaveBeenCalledWith('share_link_copied', {
    source: 'nps',
  });
  const story = screen.getByRole('link', {
    name: 'Send us your story by email',
  });
  expect(story.getAttribute('href')).toMatch(
    /^mailto:support@trackmyopt\.com\?subject=My%20TrackMyOPT%20story/
  );
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(
    screen.queryByText('Thank you. That helps a lot.')
  ).not.toBeInTheDocument();
});

it('closes without the follow-up for a lower score', async () => {
  await openSurvey();
  fireEvent.click(
    screen.getByRole('button', { name: 'Rate TrackMyOPT 6 out of 10' })
  );
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(m.submitted).toHaveBeenCalledWith(
    expect.objectContaining({ score: 6, category: 'detractor' })
  );
  expect(
    screen.queryByText('Thank you. That helps a lot.')
  ).not.toBeInTheDocument();
  expect(m.capture).not.toHaveBeenCalledWith(
    'nps_promoter_followup_shown',
    expect.anything()
  );
});
