import { renderHome } from './home.js';
import { renderLocked } from './locked.js';
import { renderOptApply } from './pages/opt-apply.js';
import { renderStemApply } from './pages/stem-apply.js';
import { renderClock } from './pages/clock.js';
import { renderStemClock } from './pages/stem-clock.js';
import { getCurrentPage, setCurrentPage, getLastPage, getPageData } from './navigation.js';

/**
 * Check if user is signed in by calling /api/me
 */
async function isSignedIn(): Promise<boolean> {
  try {
    const response = await fetch('https://www.trackmyopt.com/api/me', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.ok) {
      await chrome.storage.sync.set({ signedIn: true });
      return true;
    } else {
      await chrome.storage.sync.set({ signedIn: false });
      return false;
    }
  } catch {
    return false;
  }
}

/**
 * Apply saved theme on load
 */
async function applyTheme(): Promise<void> {
  const { theme } = await chrome.storage.sync.get('theme');
  
  // Default to light mode if no theme is saved
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  } else {
    // Light mode is default (no class needed for light mode)
    document.body.classList.remove('dark-mode');
    document.body.classList.remove('light-mode');
  }
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
        // Convert ISO strings back to Date objects
        const results = {
          earliestStart: new Date(data.results.earliestStart),
          latestEnd: new Date(data.results.latestEnd),
          uscisDeadline: data.results.uscisDeadline ? new Date(data.results.uscisDeadline) : null,
          programEndDate: new Date(data.results.programEndDate)
        };
        renderOptCountdown(root, () => navigateToPage('opt-apply'), results);
      } else {
        navigateToPage('opt-apply');
      }
      break;
    case 'stem-countdown':
      if (data && data.results) {
        setCurrentPage('stem-countdown');
        const { renderStemCountdown } = await import('./pages/stem-countdown.js');
        // Convert ISO strings back to Date objects
        const results = {
          earliestStart: new Date(data.results.earliestStart),
          latestEnd: new Date(data.results.latestEnd),
          currentOptEndDate: new Date(data.results.currentOptEndDate)
        };
        renderStemCountdown(root, () => navigateToPage('stem-apply'), results);
      } else {
        navigateToPage('stem-apply');
      }
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
  if (areaName === 'sync' && changes.signedIn) {
    render();
  }
});
