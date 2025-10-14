/**
 * Renders the signed-in home screen with tool tiles
 */
export function renderHome(root: HTMLElement): void {
  root.innerHTML = `
    <div class="header" role="region" aria-label="OPT Hub header">
      <button class="theme-btn" title="Toggle theme" aria-label="Toggle theme">
        <span>☀️</span>
      </button>
      <h1 class="title">OPT Hub</h1>
      <p class="subtitle">Your complete toolkit for managing OPT requirements</p>
    </div>

    <div class="banner" aria-live="polite">
      Select a tool below to get started with your OPT journey
    </div>

    <div class="grid" role="list">
      <div class="tile blue" role="button" tabindex="0" aria-label="OPT Apply Start Dates - Calculate when you can start applying for OPT" data-nav="opt-apply.html">
        <div class="icon">📝</div>
        <h3 class="t">OPT Apply Start Dates</h3>
        <p class="s">Calculate when you can start applying for OPT</p>
      </div>

      <div class="tile green" role="button" tabindex="0" aria-label="STEM OPT Apply Start Dates - Calculate STEM OPT extension application dates" data-nav="stem-apply.html">
        <div class="icon">🎒</div>
        <h3 class="t">STEM OPT Apply Start Dates</h3>
        <p class="s">Calculate STEM OPT extension application dates</p>
      </div>

      <div class="tile purple" role="button" tabindex="0" aria-label="OPT Clock Tracker - Track your OPT unemployment days in real-time" data-nav="clock.html">
        <div class="icon">⏱️</div>
        <h3 class="t">OPT Clock Tracker</h3>
        <p class="s">Track your OPT unemployment days in real-time</p>
      </div>

      <div class="tile orange" role="button" tabindex="0" aria-label="More Tools Coming - Stay tuned for additional OPT resources" data-link="http://localhost:3000">
        <div class="icon">📅</div>
        <h3 class="t">More Tools Coming</h3>
        <p class="s">Stay tuned for additional OPT resources</p>
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
      <a class="link" target="_blank" rel="noreferrer" href="http://localhost:3000/privacy">Privacy</a> ·
      <a class="link" target="_blank" rel="noreferrer" href="http://localhost:3000/terms">Terms</a>
    </div>
  `;

  // Hook up tile navigation
  const tiles = root.querySelectorAll<HTMLElement>('.tile');
  tiles.forEach(tile => {
    const page = tile.dataset.nav;
    const href = tile.dataset.link;
    
    const navigate = () => {
      if (page) {
        // Open extension page in new tab
        chrome.tabs.create({ url: chrome.runtime.getURL(page) });
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

  // Theme button (placeholder for now)
  const themeBtn = root.querySelector('.theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      // TODO: Implement theme toggle in future version
      console.log('Theme toggle - coming soon');
    });
  }
}

