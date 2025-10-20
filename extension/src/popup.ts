import { renderHome } from './home.js';
import { renderLocked } from './locked.js';
import { renderOptApply } from './pages/opt-apply.js';
import { renderStemApply } from './pages/stem-apply.js';
import { renderClock } from './pages/clock.js';
import { renderStemClock } from './pages/stem-clock.js';
import { getCurrentPage, setCurrentPage, getLastPage, getPageData } from './navigation.js';

/**
 * Check if user is signed in - with caching for performance
 */
async function isSignedIn(): Promise<boolean> {
  try {
    // First check cached status for instant load
    const { signedIn: cachedStatus, lastCheck } = await chrome.storage.sync.get(['signedIn', 'lastCheck']);
    const now = Date.now();
    const cacheValid = lastCheck && (now - lastCheck) < 5000; // Cache for 5 seconds
    
    // Return cached status if valid
    if (cacheValid && cachedStatus !== undefined) {
      console.log('⚡ Extension: Using cached sign-in status:', cachedStatus);
      return cachedStatus;
    }
    
    console.log('🔍 Extension: Checking if user is signed in...');
    
    // Check /api/me to see if there's a valid session
    const response = await fetch('https://www.trackmyopt.com/api/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const isAuthenticated = response.ok;
    
    if (isAuthenticated) {
      const data = await response.json();
      console.log('✅ Extension: User is signed in!', data.user?.email);
    } else {
      console.log('❌ Extension: User is not signed in');
    }
    
    // Cache the result
    await chrome.storage.sync.set({ 
      signedIn: isAuthenticated,
      lastCheck: now
    });
    
    return isAuthenticated;
  } catch (error) {
    console.error('❌ Extension: Error checking sign in status:', error);
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
  console.log('Applied theme:', theme || 'light (default)');
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
 * Main render function - optimized for speed
 */
async function render(): Promise<void> {
  const root = document.getElementById('root');
  if (!root) {
    console.error('Root element not found');
    return;
  }

  // Show loading state immediately (minimal, fast)
  root.innerHTML = '<div style="padding:20px;text-align:center;color:#9ca3af;font-size:12px;">⚡ Loading...</div>';

  // Apply theme and check auth in parallel for speed
  const [, signedIn] = await Promise.all([
    applyTheme(),
    isSignedIn()
  ]);
  
  console.log('Popup render - signedIn:', signedIn);

  if (signedIn) {
    // Try to restore last page
    const lastPage = await getLastPage();
    console.log('Last page:', lastPage);
    
    if (lastPage && lastPage !== 'home') {
      // Get saved page data
      const pageData = await getPageData(lastPage);
      console.log('Restoring page:', lastPage, 'with data:', pageData);
      
      // Navigate to last page with data
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
  console.log('Popup loaded');
  render();
});

/**
 * Listen for storage changes to re-render when sign-in state changes
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.signedIn) {
    console.log('Sign-in state changed, re-rendering...');
    render();
  }
});
