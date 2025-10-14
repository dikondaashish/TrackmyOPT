/**
 * Navigation state management for extension popup
 */

type Page = 'home' | 'opt-apply' | 'stem-apply' | 'clock';

let currentPage: Page = 'home';

export function getCurrentPage(): Page {
  return currentPage;
}

export function setCurrentPage(page: Page): void {
  currentPage = page;
}

/**
 * Render a page header with back button
 */
export function renderPageHeader(root: HTMLElement, title: string, subtitle: string): void {
  const headerHTML = `
    <div class="header" role="region" aria-label="${title}">
      <button class="back-btn" id="back-btn" title="Back to home" aria-label="Back to home">
        <span>←</span>
      </button>
      <div class="header-buttons">
        <button class="theme-btn" id="theme-btn-page" title="Toggle theme" aria-label="Toggle theme">
          <span>☀️</span>
        </button>
        <button class="logout-btn" id="logout-btn-page" title="Sign out" aria-label="Sign out">
          <span>🚪</span>
        </button>
      </div>
      <h1 class="title">${title}</h1>
      <p class="subtitle">${subtitle}</p>
    </div>
  `;
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = headerHTML;
  root.appendChild(tempDiv.firstElementChild!);
}

/**
 * Render "Coming Soon" notice
 */
export function renderComingSoon(root: HTMLElement, message: string): void {
  const noticeHTML = `
    <div class="notice" style="margin-top:12px;">
      <div class="dot">🛠️</div>
      <div>
        <div style="font-weight:800; margin-bottom: 4px;">Coming soon</div>
        <div>${message}</div>
      </div>
    </div>
  `;
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = noticeHTML;
  root.appendChild(tempDiv.firstElementChild!);
}

/**
 * Setup common button handlers (theme, logout, back)
 */
export function setupPageHandlers(onBack: () => void): void {
  // Back button
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', onBack);
  }

  // Theme button
  const themeBtn = document.getElementById('theme-btn-page');
  if (themeBtn) {
    themeBtn.addEventListener('click', async () => {
      const body = document.body;
      const isLightMode = body.classList.contains('light-mode');
      
      if (isLightMode) {
        body.classList.remove('light-mode');
        await chrome.storage.sync.set({ theme: 'dark' });
      } else {
        body.classList.add('light-mode');
        await chrome.storage.sync.set({ theme: 'light' });
      }
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logout-btn-page');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to sign out?')) {
        await chrome.storage.sync.clear();
        await chrome.storage.session.clear();
        window.location.reload();
      }
    });
  }
}

