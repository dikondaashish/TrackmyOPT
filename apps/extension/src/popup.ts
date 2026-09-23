import { applyPopupTheme } from './design/popup-theme';
import { API_ENDPOINTS } from './config.js';
import { EXTENSION_LOCAL_SIGNOUT_KEY } from './signOut.js';
import { getIdToken, setIdToken } from './token-store.js';
import { renderHome } from './home.js';
import { renderLocked } from './locked.js';
import { renderOptApply } from './pages/opt-apply.js';
import { renderStemApply } from './pages/stem-apply.js';
import { renderClock } from './pages/clock.js';
import { renderStemClock } from './pages/stem-clock.js';
import { setCurrentPage, getLastPage, getPageData } from './navigation.js';

/**
 * Returns true if a JWT string has more than 60 seconds of validity remaining.
 * Decodes only the payload (no signature verification — server verifies on use).
 */
function isTokenStillValid(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1])) as { exp?: number };
    if (typeof payload.exp !== 'number') return false;
    // Refresh if fewer than 60 seconds remain
    return payload.exp * 1000 > Date.now() + 60_000;
  } catch {
    return false;
  }
}

/**
 * Check if user is signed in for the extension UI.
 * - Respects extension-only sign-out (web session can still exist).
 * - Uses stored JWT first so dashboard sign-out (cookies cleared) does not lock the extension until the JWT expires.
 */
async function isSignedIn(): Promise<boolean> {
  try {
    const { [EXTENSION_LOCAL_SIGNOUT_KEY]: localOut } = await chrome.storage.sync.get(
      EXTENSION_LOCAL_SIGNOUT_KEY
    );
    if (localOut === true) {
      return false;
    }

    const idToken = await getIdToken();

    if (typeof idToken === 'string' && idToken.length > 0) {
      const bearerRes = await fetch(API_ENDPOINTS.ME, {
        method: 'GET',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (bearerRes.ok) {
        await chrome.storage.sync.set({ signedIn: true });
        try {
          const needsRefresh = !isTokenStillValid(idToken);
          if (needsRefresh) {
            const tokenRes = await fetch(API_ENDPOINTS.EXTENSION_TOKEN, {
              credentials: 'include',
            });
            if (tokenRes.ok) {
              const body = (await tokenRes.json()) as { token?: string };
              if (typeof body.token === 'string' && body.token.length > 0) {
                await setIdToken(body.token);
              }
            }
          }
        } catch {
          /* ignore */
        }
        return true;
      }
    }

    const response = await fetch(API_ENDPOINTS.ME, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      await chrome.storage.sync.set({ signedIn: true });
      try {
        const stored = await getIdToken();
        const needsRefresh = typeof stored !== 'string' || !isTokenStillValid(stored);
        if (needsRefresh) {
          const tokenRes = await fetch(API_ENDPOINTS.EXTENSION_TOKEN, {
            credentials: 'include',
          });
          if (tokenRes.ok) {
            const body = (await tokenRes.json()) as { token?: string };
            if (typeof body.token === 'string' && body.token.length > 0) {
              await setIdToken(body.token);
            }
          }
        }
      } catch {
        // Background will mint on demand for job save
      }
      return true;
    }

    await chrome.storage.sync.set({ signedIn: false });
    return false;
  } catch {
    return false;
  }
}

/**
 * Apply saved theme on load
 */
async function applyTheme(): Promise<void> {
  const { theme } = await chrome.storage.sync.get('theme');
  applyPopupTheme(theme);
  
}

/**
 * Navigate to a specific page
 */
async function navigateToPage(page: string, data?: any): Promise<void> {
  const root = document.getElementById('root');
  if (!root) return;

  switch (page) {
    case 'opt-apply':
      setCurrentPage('opt-apply');
      renderOptApply(root, () => navigateToPage('home'));
      break;
    case 'stem-apply':
      setCurrentPage('stem-apply');
      renderStemApply(root, () => navigateToPage('home'));
      break;
    case 'clock':
      setCurrentPage('clock');
      renderClock(root, () => navigateToPage('home'));
      break;
    case 'stem-clock':
      setCurrentPage('stem-clock');
      renderStemClock(root, () => navigateToPage('home'));
      break;
    case 'opt-countdown':
      if (data && data.results) {
        setCurrentPage('opt-countdown');
        const { renderOptCountdown } = await import('./pages/opt-countdown.js');
        const latestEnd = new Date(data.results.latestEnd);
        const uscisDeadline = data.results.uscisDeadline ? new Date(data.results.uscisDeadline) : null;
        // Convert ISO strings back to Date objects
        const results = {
          earliestStart: new Date(data.results.earliestStart),
          latestEnd,
          uscisDeadline,
          filingDeadline: data.results.filingDeadline
            ? new Date(data.results.filingDeadline)
            : (uscisDeadline && uscisDeadline < latestEnd ? uscisDeadline : latestEnd),
          programEndDate: new Date(data.results.programEndDate),
          dsoRecommendationDate: data.results.dsoRecommendationDate
            ? new Date(data.results.dsoRecommendationDate)
            : null,
        };
        renderOptCountdown(root, () => navigateToPage('opt-apply'), results);
      } else {
        navigateToPage('opt-apply');
      }
      break;
    case 'stem-countdown':
      // Recompute from the server, including dashboard edits/clears. The form
      // owns loading/errors so stale cached dates are never shown or saved.
      setCurrentPage('stem-apply');
      renderStemApply(root, () => navigateToPage('home'), true);
      break;
    case 'clock-tracker':
      if (data && data.startDate) {
        setCurrentPage('clock-tracker');
        const { renderClockTracker } = await import('./pages/clock-tracker.js');
        const startDate = new Date(data.startDate);
        renderClockTracker(root, () => navigateToPage('clock'), startDate);
      } else {
        navigateToPage('clock');
      }
      break;
    case 'stem-clock-tracker':
      if (data && data.startDate) {
        setCurrentPage('stem-clock-tracker');
        const { renderStemClockTracker } = await import('./pages/stem-clock-tracker.js');
        const startDate = new Date(data.startDate);
        renderStemClockTracker(root, () => navigateToPage('stem-clock'), startDate);
      } else {
        navigateToPage('stem-clock');
      }
      break;
    case 'home':
    default:
      setCurrentPage('home');
      renderHome(root, navigateToPage);
      break;
  }
}

/**
 * Main render function - decides which view to show
 */
async function render(): Promise<void> {
  const root = document.getElementById('root');
  if (!root) return;

  // Apply saved theme first
  await applyTheme();

  const signedIn = await isSignedIn();

  if (signedIn) {
    void chrome.runtime.sendMessage({ type: 'TOUR_SIGNED_IN' }).catch(() => {});
    const lastPage = await getLastPage();
    
    if (lastPage && lastPage !== 'home') {
      const pageData = await getPageData(lastPage);
      await navigateToPage(lastPage, pageData);
    } else {
      await navigateToPage('home');
    }
  } else {
    renderLocked(root);
  }
}

/**
 * Initialize on DOM load
 */
document.addEventListener('DOMContentLoaded', () => {
  render();
});

/**
 * Listen for storage changes to re-render when sign-in state changes
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (
    areaName === 'sync' &&
    (changes.signedIn || changes[EXTENSION_LOCAL_SIGNOUT_KEY])
  ) {
    render();
  }
});
