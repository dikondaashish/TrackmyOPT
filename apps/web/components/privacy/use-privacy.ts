'use client';

import { useSyncExternalStore } from 'react';
import {
  getPrivacySnapshot,
  getServerPrivacySnapshot,
  subscribeToPrivacy,
} from '@/lib/privacy/privacy-manager';
import type { ConsentCategory, PrivacySnapshot } from '@/lib/privacy/types';

/**
 * Server render and hydration use the pending snapshot (nothing optional),
 * then React re-renders with the browser state — no hydration mismatch.
 */
export function usePrivacy(): PrivacySnapshot {
  return useSyncExternalStore(
    subscribeToPrivacy,
    getPrivacySnapshot,
    getServerPrivacySnapshot
  );
}

/** True only after hydration and only while the category is permitted. */
export function useConsent(category: ConsentCategory): boolean {
  const privacy = usePrivacy();
  if (category === 'essential') return true;
  return privacy.status === 'ready' && privacy.choices[category];
}
