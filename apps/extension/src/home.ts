import { API_ENDPOINTS } from './config';
import { performExtensionSignOut } from './signOut';

/**
 * Renders the signed-in home screen with tool tiles
 */
export async function renderHome(root: HTMLElement, onNavigate: (page: string) => void): Promise<void> {
  // Fetch premium status to show badge
  let planBadge = '';
  try {
    const res = await fetch(API_ENDPOINTS.STATUS, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      if (data.isPremium && data.planName) {
        const plan = data.planName.toUpperCase();
        const badgeClass = plan === 'DEDICATED' ? 'badge-dedicated' : 'badge-pro';
        planBadge = `<span class="plan-badge ${badgeClass}">${plan}</span>`;
      }
    }
  } catch (err) {
    console.error('Failed to fetch premium status for extension', err);
  }

  root.innerHTML = `
    <style>
      .plan-badge {
        font-size: 8px;
        font-weight: 800;
        padding: 1.5px 4px;
        border-radius: 3px;
        margin-left: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        vertical-align: middle;
        display: inline-block;
        line-height: 1;
      }
      .badge-pro {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);
      }
      .badge-dedicated {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        box-shadow: 0 2px 4px rgba(217, 119, 6, 0.3);
      }
      .header-title-container {
        display: flex;
        align-items: center;
        margin-bottom: 2px;
      }
    </style>
    <div class="header" role="region" aria-label="TrackMyOPT header">
      <div class="logo-icon">
        <img src="icons/logo.gif" alt="TrackMyOPT" />
      </div>
      <div class="header-buttons">
        <button class="theme-btn" id="theme-btn" title="Toggle theme" aria-label="Toggle theme">
          <span id="theme-icon">🌙</span>
        </button>
        <button class="logout-btn" id="logout-btn" title="Sign out" aria-label="Sign out">
          <span>→</span>
        </button>
      </div>
      <div class="header-title-container">
        <h1 class="title" style="margin-bottom: 0;">TrackMyOPT</h1>
        ${planBadge}
      </div>
      <p class="subtitle">Your complete toolkit for managing OPT requirements</p>
    </div>

    <div class="banner" aria-live="polite">
      Select a tool below to get started with your OPT journey
    </div>

    <div class="grid" role="list">
      <div class="tile blue" role="button" tabindex="0" aria-label="OPT Apply Start Dates - Calculate when you can start applying for OPT" data-page="opt-apply">
        <div class="icon">🗓️</div>
        <h3 class="t">OPT Apply Dates</h3>
        <p class="s">Calculate when you can apply for OPT</p>
      </div>

      <div class="tile purple" role="button" tabindex="0" aria-label="OPT Clock Tracker - Track your OPT unemployment days in real-time" data-page="clock">
        <div class="icon">⏰</div>
        <h3 class="t">OPT Clock Tracker</h3>
        <p class="s">Track your unemployment days</p>
      </div>

      <div class="tile green" role="button" tabindex="0" aria-label="STEM OPT Apply Start Dates - Calculate STEM OPT extension application dates" data-page="stem-apply">
        <div class="icon">🎓</div>
        <h3 class="t">STEM Apply Dates</h3>
        <p class="s">Calculate STEM OPT dates</p>
      </div>

      <div class="tile orange" role="button" tabindex="0" aria-label="STEM OPT Clock Tracker - Track your STEM OPT unemployment days" data-page="stem-clock">
        <div class="icon">⏲️</div>
        <h3 class="t">STEM Clock Tracker</h3>
        <p class="s">Track STEM unemployment</p>
      </div>
    </div>

    <div class="notice">
      <div class="dot">🛡️</div>
      <div>
        <div style="font-weight:800; margin-bottom: 4px;">Stay Compliant</div>
        <div>All tools are designed to help you track and manage your OPT requirements. Always consult with your DSO for official guidance.</div>
      </div>
    </div>

    <div class="footer">
      <a class="link" target="_blank" rel="noreferrer" href="https://www.trackmyopt.com/privacy">Privacy</a> ·
      <a class="link" target="_blank" rel="noreferrer" href="https://www.trackmyopt.com/terms">Terms</a>
    </div>
  `;

  // Hook up tile navigation
  const tiles = root.querySelectorAll<HTMLElement>('.tile');
  tiles.forEach(tile => {
    const page = tile.dataset.page;
    const href = tile.dataset.link;

    const navigate = () => {
      if (page) {
        // Navigate within popup
        onNavigate(page);
      } else if (href) {
        // Open external link in new tab
        chrome.tabs.create({ url: href });
      }
    };

    tile.addEventListener('click', navigate);

    // Keyboard accessibility
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate();
      }
    });
  });

  // Theme button - toggle between light and dark mode
  const themeBtn = root.querySelector('.theme-btn');
  const themeIcon = root.querySelector('#theme-icon');

  // Set initial icon based on current theme
  const { theme } = await chrome.storage.sync.get('theme');
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', async () => {
      const body = document.body;
      const isDarkMode = body.classList.contains('dark-mode');

      if (isDarkMode) {
        body.classList.remove('dark-mode');
        await chrome.storage.sync.set({ theme: 'light' });
        if (themeIcon) themeIcon.textContent = '🌙';
      } else {
        body.classList.add('dark-mode');
        await chrome.storage.sync.set({ theme: 'dark' });
        if (themeIcon) themeIcon.textContent = '☀️';
      }
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
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

