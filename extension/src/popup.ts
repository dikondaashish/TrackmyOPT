import { renderHome } from './home.js';
import { renderLocked } from './locked.js';

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
    renderHome(root);
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
