/**
 * Renders the locked state when user is not signed in
 */

import { API_ENDPOINTS } from './config';
import { icon, themeToggleIcon } from './icons';

export async function renderLocked(root: HTMLElement): Promise<void> {
  const logoSrc = chrome.runtime.getURL('icons/icon48.png');

  root.innerHTML = `
    <div class="header" role="region" aria-label="TrackMyOPT">
      <div class="logo-icon">
        <img src="${logoSrc}" alt="TrackMyOPT" />
      </div>
      <div class="header-buttons">
        <button class="theme-btn" id="theme-btn-locked" title="Toggle theme" aria-label="Toggle theme">
          <span id="theme-icon-locked">${icon('moon', 18)}</span>
        </button>
      </div>
      <h1 class="title" style="font-size: 22px; margin-bottom: 4px;">TrackMyOPT</h1>
      <p class="subtitle" style="font-size: 13px; opacity: 0.75;">Your OPT timeline companion</p>
    </div>
    
    <div style="margin-top: 20px; padding: 0 4px;">
      <!-- Features List -->
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
        <div style="display: flex; align-items: start; gap: 12px;">
          <div class="feature-tile-icon">${icon('calendar', 20)}</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 2px;">Track Your Timeline</div>
            <div style="font-size: 12px; opacity: 0.7; line-height: 1.4;">Real-time countdown to critical OPT deadlines</div>
          </div>
        </div>
        
        <div style="display: flex; align-items: start; gap: 12px;">
          <div class="feature-tile-icon">🧮</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 2px;">Filing Windows</div>
            <div style="font-size: 12px; opacity: 0.7; line-height: 1.4;">Know exactly when to apply for OPT & STEM</div>
          </div>
        </div>
        
        <div style="display: flex; align-items: start; gap: 12px;">
          <div class="feature-tile-icon">${icon('barChart', 20)}</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 2px;">Unemployment Tracking</div>
            <div style="font-size: 12px; opacity: 0.7; line-height: 1.4;">Monitor and manage your 90/150 day limits</div>
          </div>
        </div>
        
        <div style="display: flex; align-items: start; gap: 12px;">
          <div class="feature-tile-icon">${icon('bell', 20)}</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 2px;">Smart Reminders</div>
            <div style="font-size: 12px; opacity: 0.7; line-height: 1.4;">Never miss important dates and deadlines</div>
          </div>
        </div>
      </div>
      
      <!-- CTA Button -->
      <div style="margin-top: 12px;">
        <button id="signin-btn" type="button" style="padding: 14px; font-size: 14px;">
          Sign In or Create Account
        </button>
      </div>
    </div>

    <div class="footer" style="margin-top: 12px; font-size: 11px;">
      <a class="link" target="_blank" rel="noreferrer" href="https://www.trackmyopt.com/privacy">Privacy</a> ·
      <a class="link" target="_blank" rel="noreferrer" href="https://www.trackmyopt.com/terms">Terms</a>
    </div>
  `;

  // Hook up sign-in button to trigger OAuth flow and also handle create account
  const signinBtn = document.getElementById('signin-btn');
  if (signinBtn) {
    signinBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ type: 'BEGIN_AUTH' }, (res: { ok?: boolean }) => {
        if (chrome.runtime.lastError) {
          chrome.tabs.create({ url: API_ENDPOINTS.AUTH });
          return;
        }
        if (res?.ok) {
          window.location.reload();
        }
      });
    });
    
    // Add hover effect
    signinBtn.addEventListener('mouseenter', () => {
      signinBtn.style.transform = 'translateY(-2px)';
      signinBtn.style.boxShadow = '0 6px 16px rgba(30, 64, 175, 0.5)';
    });
    
    signinBtn.addEventListener('mouseleave', () => {
      signinBtn.style.transform = 'translateY(0)';
      signinBtn.style.boxShadow = '0 4px 12px rgba(30, 64, 175, 0.4)';
    });
  }

  // Theme button for locked state
  const themeBtnLocked = document.getElementById('theme-btn-locked');
  const themeIconLocked = document.getElementById('theme-icon-locked');
  
  // Set initial icon based on current theme
  const { theme } = await chrome.storage.sync.get('theme');
  if (themeIconLocked) {
    themeIconLocked.innerHTML = themeToggleIcon(theme === 'dark');
  }
  
  if (themeBtnLocked) {
    themeBtnLocked.addEventListener('click', async () => {
      const body = document.body;
      const isDarkMode = body.classList.contains('dark-mode');
      
      if (isDarkMode) {
        body.classList.remove('dark-mode');
        await chrome.storage.sync.set({ theme: 'light' });
        if (themeIconLocked) themeIconLocked.innerHTML = themeToggleIcon(false);
      } else {
        body.classList.add('dark-mode');
        await chrome.storage.sync.set({ theme: 'dark' });
        if (themeIconLocked) themeIconLocked.innerHTML = themeToggleIcon(true);
      }
    });
  }
}