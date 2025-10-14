import { renderPageHeader, renderComingSoon, setupPageHandlers } from '../navigation.js';

/**
 * Render OPT Apply Start Dates page
 */
export function renderOptApply(root: HTMLElement, onBack: () => void): void {
  root.innerHTML = '';
  
  renderPageHeader(root, 'OPT Apply Dates', 'Calculate your OPT filing window');
  renderComingSoon(root, "We'll bring this calculator into the extension. For now you can use the website.");
  
  setupPageHandlers(onBack);
}

