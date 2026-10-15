/**
 * PrivacyManager: the one client-side owner of consent state.
 *
 * Components read it through `usePrivacy()` / `useConsent()`
 * (components/privacy/use-privacy.ts); non-React code calls `hasConsent()`.
 * Only this module persists decisions and only lib/privacy/integrations.ts
 * starts or stops non-essential scripts.
 */

import { applyIntegrations } from '@/lib/privacy/integrations';
import {
  readRegionCookie,
  readStoredConsent,
  writeStoredConsent,
} from '@/lib/privacy/consent-storage';
import { readGlobalPrivacyControl } from '@/lib/privacy/gpc';
import {
  NO_OPTIONAL_CONSENT,
  PENDING_PRIVACY_SNAPSHOT,
  resolvePrivacyState,
} from '@/lib/privacy/policy';
import type {
  ConsentCategory,
  ConsentChoices,
  ConsentMethod,
  PrivacySnapshot,
  StoredConsent,
} from '@/lib/privacy/types';

let snapshot: PrivacySnapshot = PENDING_PRIVACY_SNAPSHOT;
let started = false;
const listeners = new Set<() => void>();
let reloadPage = () => window.location.reload();

function resolve(stored: StoredConsent | null): PrivacySnapshot {
  return {
    ...resolvePrivacyState({
      region: readRegionCookie() ?? 'UNKNOWN',
      stored,
      gpc: readGlobalPrivacyControl(),
    }),
    settingsOpen: snapshot.settingsOpen,
  };
}

function setSnapshot(next: PrivacySnapshot): void {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

/**
 * Resolve lazily on first browser read so effects that run before the
 * provider's effect still see real permissions. Reading has no side effects.
 */
export function getPrivacySnapshot(): PrivacySnapshot {
  if (snapshot.status === 'pending' && typeof document !== 'undefined') {
    snapshot = resolve(readStoredConsent());
  }
  return snapshot;
}

export function getServerPrivacySnapshot(): PrivacySnapshot {
  return PENDING_PRIVACY_SNAPSHOT;
}

export function subscribeToPrivacy(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Called once from PrivacyProvider after hydration; starts permitted integrations. */
export function startPrivacyManager(): void {
  if (started || typeof window === 'undefined') return;
  started = true;
  applyIntegrations(getPrivacySnapshot().choices);
}

export function hasConsent(category: ConsentCategory): boolean {
  if (category === 'essential') return true;
  return getPrivacySnapshot().choices[category];
}

export function saveConsent(choices: ConsentChoices, method: ConsentMethod): void {
  if (typeof window === 'undefined') return;
  const current = getPrivacySnapshot();
  const record = writeStoredConsent(choices, current.region, method);
  setSnapshot({ ...resolve(record), settingsOpen: false });
  started = true;
  const { reloadRequired } = applyIntegrations(snapshot.choices);
  if (reloadRequired) reloadPage();
}

export function acceptAllOptional(): void {
  saveConsent({ functional: true, analytics: true, marketing: true }, 'accept_all');
}

export function rejectAllOptional(): void {
  saveConsent(NO_OPTIONAL_CONSENT, 'reject_all');
}

let settingsOpener: HTMLElement | null = null;

/** Reopen the settings dialog from footers, menus, or the floating button. */
export function openPrivacySettings(): void {
  if (typeof window === 'undefined') return;
  // Remember the control that opened settings so focus can return to it.
  settingsOpener =
    document.activeElement instanceof HTMLElement ? document.activeElement : null;
  setSnapshot({ ...getPrivacySnapshot(), settingsOpen: true });
}

/** The element focused when settings opened; read once by the dialog on close. */
export function takePrivacySettingsOpener(): HTMLElement | null {
  const opener = settingsOpener;
  settingsOpener = null;
  return opener;
}

export function closePrivacySettings(): void {
  if (!snapshot.settingsOpen) return;
  setSnapshot({ ...snapshot, settingsOpen: false });
}

/** Test-only: forget cached state and stub page reloads. */
export function resetPrivacyManagerForTests(onReload?: () => void): void {
  snapshot = PENDING_PRIVACY_SNAPSHOT;
  started = false;
  settingsOpener = null;
  listeners.clear();
  reloadPage = onReload ?? (() => undefined);
}
