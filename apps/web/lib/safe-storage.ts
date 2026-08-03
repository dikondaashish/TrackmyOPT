/**
 * Guarded `localStorage` access.
 *
 * `window.localStorage` is not reliably a usable Storage object. Privacy modes,
 * embedded webviews (Gmail/Instagram in-app browsers), and disabled-storage
 * settings expose it as `null`, or leave it present but make every property
 * access throw `SecurityError`. Touching it directly surfaced as
 * `TypeError: Cannot read properties of null (reading 'getItem')` in production
 * and broke consent bootstrap and Google sign-in on the affected browsers.
 *
 * Every helper degrades to a no-op instead of throwing: stored data is a
 * convenience (remembered email, referral attribution, dismissal flags), never
 * a correctness requirement.
 */

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

export function safeStorageGet(key: string): string | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

/** Returns false when the value could not be persisted. */
export function safeStorageSet(key: string, value: string): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    // Quota exceeded or private-mode write rejection.
    return false;
  }
}

export function safeStorageRemove(key: string): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    /* storage unavailable — nothing to clean up */
  }
}
