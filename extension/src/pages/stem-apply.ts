import { renderPageHeader, renderComingSoon, setupPageHandlers } from '../navigation.js';

/**
 * Render STEM OPT Apply Start Dates page
 */
export function renderStemApply(root: HTMLElement, onBack: () => void): void {
  root.innerHTML = '';
  
  renderPageHeader(root, 'STEM OPT Dates', 'Calculate your STEM OPT extension filing window');
  renderComingSoon(root, 'This tool will be available in the extension shortly.');
  
  setupPageHandlers(onBack);
}

