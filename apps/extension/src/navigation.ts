/**
 * Navigation state management for extension popup
 */

import { performExtensionSignOut } from './signOut';

type Page = 'home' | 'opt-apply' | 'stem-apply' | 'clock' | 'opt-countdown' | 'stem-countdown' | 'clock-tracker' | 'stem-clock' | 'stem-clock-tracker';

let currentPage: Page = 'home';

export function getCurrentPage(): Page {
  return currentPage;
}

export function setCurrentPage(page: Page): void {
  currentPage = page;
  chrome.storage.local.set({ lastPage: page }).catch(() => {});
}

/**
 * Get the last visited page from storage
 */
export async function getLastPage(): Promise<Page | null> {
  try {
    const { lastPage } = await chrome.storage.local.get('lastPage');
    return lastPage || null;
  } catch {
    return null;
  }
}

/**
 * Save page data (like dates for countdown pages)
 */
export async function savePageData(page: Page, data: any): Promise<void> {
  try {
    await chrome.storage.local.set({ [`${page}_data`]: data });
  } catch {
    // Silently fail
  }
}

/**
 * Get saved page data
 */
export async function getPageData(page: Page): Promise<any> {
  try {
    const result = await chrome.storage.local.get(`${page}_data`);
    return result[`${page}_data`] || null;
  } catch {
    return null;
  }
}

/**
 * Render a page header with back button
 */
export function renderPageHeader(root: HTMLElement, title: string, subtitle: string): void {
  const logoUrl = chrome.runtime.getURL('icons/icon48.png');
  const headerHTML = `
    <div class="header" role="region" aria-label="${title}">
      <button class="back-btn" id="back-btn" title="Back to home" aria-label="Back to home">
        <span>←</span>
      </button>
      <div class="header-content header-content--with-logo">
        <img class="header-page-logo" src="${logoUrl}" width="36" height="36" alt="" />
        <div class="header-text-block">
          <h1 class="title">${title}</h1>
          <p class="subtitle">${subtitle}</p>
        </div>
      </div>
      <div class="header-buttons">
        <button class="theme-btn" id="theme-btn-page" title="Toggle theme" aria-label="Toggle theme">
          <span id="theme-icon-page">🌙</span>
        </button>
        <button class="logout-btn" id="logout-btn-page" title="Sign out" aria-label="Sign out">
          <span>→</span>
        </button>
      </div>
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
export async function setupPageHandlers(onBack: () => void): Promise<void> {
  // Back button
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', onBack);
  }

  // Theme button
  const themeBtn = document.getElementById('theme-btn-page');
  const themeIconPage = document.getElementById('theme-icon-page');
  
  // Set initial icon based on current theme
  const { theme } = await chrome.storage.sync.get('theme');
  if (themeIconPage) {
    themeIconPage.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
  
  if (themeBtn) {
    themeBtn.addEventListener('click', async () => {
      const body = document.body;
      const isDarkMode = body.classList.contains('dark-mode');
      
      if (isDarkMode) {
        body.classList.remove('dark-mode');
        await chrome.storage.sync.set({ theme: 'light' });
        if (themeIconPage) themeIconPage.textContent = '🌙';
      } else {
        body.classList.add('dark-mode');
        await chrome.storage.sync.set({ theme: 'dark' });
        if (themeIconPage) themeIconPage.textContent = '☀️';
      }
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logout-btn-page');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to sign out?')) return;
      (logoutBtn as HTMLButtonElement).disabled = true;
      try {
        await new Promise<void>((resolve) => {
          chrome.runtime.sendMessage({ type: 'EXTENSION_SIGN_OUT' }, (res?: { ok?: boolean }) => {
            if (chrome.runtime.lastError || res?.ok === false) {
              void performExtensionSignOut().finally(() => resolve());
              return;
            }
            resolve();
          });
        });
      } catch {
        await performExtensionSignOut();
      } finally {
        window.location.reload();
      }
    });
  }
}

