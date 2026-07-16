/**
 * Renders the locked state when user is not signed in
 */

import { API_ENDPOINTS } from './config';
import { icon, themeToggleIcon } from './icons';

export async function renderLocked(root: HTMLElement): Promise<void> {
  root.innerHTML = `
    <div style="display:flex;justify-content:flex-end;margin-bottom:-6px;">
      <button class="theme-btn" id="theme-btn-locked" title="Toggle theme" aria-label="Toggle theme">
        <span id="theme-icon-locked">${icon('moon', 16)}</span>
      </button>
    </div>

    <div class="hero">
      <div class="bm">${icon('graduationCap', 26)}</div>
      <h1>TrackMyOPT</h1>
      <p>Your OPT timeline companion</p>
    </div>

    <div class="feat">
      <div class="f">
        <div class="fi" style="background:linear-gradient(135deg,#2563eb,#0ea5e9)">${icon('calendar', 18)}</div>
        <div>
          <div class="ft">Track your timeline</div>
          <div class="fs">Real-time countdown to critical OPT deadlines</div>
        </div>
      </div>

      <div class="f">
        <div class="fi" style="background:linear-gradient(135deg,#10b981,#059669)">${icon('graduationCap', 18)}</div>
        <div>
          <div class="ft">Filing windows</div>
          <div class="fs">Know exactly when to apply for OPT &amp; STEM</div>
        </div>
      </div>

      <div class="f">
        <div class="fi" style="background:linear-gradient(135deg,#6366f1,#a855f7)">${icon('barChart', 18)}</div>
        <div>
          <div class="ft">Unemployment tracking</div>
          <div class="fs">Monitor your 90 / 150-day limits</div>
        </div>
      </div>

      <div class="f">
        <div class="fi" style="background:linear-gradient(135deg,#f59e0b,#f97316)">${icon('bell', 18)}</div>
        <div>
          <div class="ft">Smart reminders</div>
          <div class="fs">Never miss an important date or deadline</div>
        </div>
      </div>
    </div>

    <button id="signin-btn" class="cta" type="button">
      Sign In or Create Account
    </button>

    <div class="footer">
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
  }

  // Theme button for locked state
  const themeBtnLocked = document.getElementById('theme-btn-locked');
  const themeIconLocked = document.getElementById('theme-icon-locked');

  // Set initial icon based on current theme
  const { theme } = await chrome.storage.sync.get('theme');
  if (themeIconLocked) {
    themeIconLocked.innerHTML = themeToggleIcon(theme === 'dark', 16);
  }

  if (themeBtnLocked) {
    themeBtnLocked.addEventListener('click', async () => {
      const body = document.body;
      const isDarkMode = body.classList.contains('dark-mode');

      if (isDarkMode) {
        body.classList.remove('dark-mode');
        await chrome.storage.sync.set({ theme: 'light' });
        if (themeIconLocked) themeIconLocked.innerHTML = themeToggleIcon(false, 16);
      } else {
        body.classList.add('dark-mode');
        await chrome.storage.sync.set({ theme: 'dark' });
        if (themeIconLocked) themeIconLocked.innerHTML = themeToggleIcon(true, 16);
      }
    });
  }
}
