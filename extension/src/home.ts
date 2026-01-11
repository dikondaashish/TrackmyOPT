/**
 * Renders the signed-in home screen with tool tiles
 */
export async function renderHome(root: HTMLElement, onNavigate: (page: string) => void): Promise<void> {
  root.innerHTML = `
    <div class="header" role="region" aria-label="TrackMyOPT header">
      <div class="logo-icon">
        <img src="icons/logo.gif" alt="TrackMyOPT Logo" style="width: 28px; height: 28px; object-fit: contain;">
      </div>
      <div class="header-buttons">
        <button class="theme-btn" id="theme-btn" title="Toggle theme" aria-label="Toggle theme">
          <span id="theme-icon">🌙</span>
        </button>
        <button class="logout-btn" id="logout-btn" title="Sign out" aria-label="Sign out">
          <span>→</span>
        </button>
      </div>
      <h1 class="title">TrackMyOPT</h1>
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
      if (confirm('Are you sure you want to sign out?')) {
        try {
          await fetch('https://www.trackmyopt.com/auth/signout', {
            method: 'POST',
            credentials: 'include',
          });
        } catch {
          // Continue with local cleanup even if server signout fails
        }

        await chrome.storage.sync.clear();
        await chrome.storage.session.clear();
        window.location.reload();
      }
    });
  }
}

