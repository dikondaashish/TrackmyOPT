import { renderPageHeader, renderComingSoon, setupPageHandlers } from '../navigation.js';

/**
 * Render OPT Clock Tracker page
 */
export function renderClock(root: HTMLElement, onBack: () => void): void {
  root.innerHTML = '';
  
  renderPageHeader(root, 'OPT Clock Tracker', 'Track your OPT unemployment days');
  renderComingSoon(root, "We'll display Used / Remaining unemployment days here with real-time tracking.");
  
  setupPageHandlers(onBack);
}

