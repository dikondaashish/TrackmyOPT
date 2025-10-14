import { renderHome } from './home.js';
import { renderLocked } from './locked.js';
import { renderOptApply } from './pages/opt-apply.js';
import { renderStemApply } from './pages/stem-apply.js';
import { renderClock } from './pages/clock.js';
import { getCurrentPage, setCurrentPage } from './navigation.js';

/**
 * Check if user is signed in
 */
async function isSignedIn(): Promise<boolean> {
  const { signedIn } = await chrome.storage.sync.get('signedIn');
  return !!signedIn;
}

/**
 * Apply saved theme on load
 */
async function applyTheme(): Promise<void> {
  const { theme } = await chrome.storage.sync.get('theme');
  if (theme === 'light') {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
  console.log('Applied theme:', theme || 'dark');
}

/**
 * Navigate to a specific page
 */
function navigateToPage(page: string): void {
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
  if (!root) {
    console.error('Root element not found');
    return;
  }

  // Apply saved theme first
  await applyTheme();

  const signedIn = await isSignedIn();
  console.log('Popup render - signedIn:', signedIn);

  if (signedIn) {
    navigateToPage('home');
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
