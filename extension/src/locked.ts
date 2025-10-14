/**
 * Renders the locked state when user is not signed in
 */
export function renderLocked(root: HTMLElement): void {
  root.innerHTML = `
    <div class="header">
      <div class="header-buttons">
        <button class="theme-btn" id="theme-btn-locked" title="Toggle theme" aria-label="Toggle theme">
          <span>☀️</span>
        </button>
      </div>
      <h1 class="title">OPT Hub</h1>
      <p class="subtitle">Sign in to unlock all features</p>
    </div>
    
    <div class="notice" style="margin-top:12px">
      <div class="dot">🔐</div>
      <div>
        <div style="font-weight:800; margin-bottom: 4px;">Sign in required</div>
        <div>Calculate filing windows, track unemployment days, and get reminders.</div>
      </div>
    </div>
    
    <div style="margin-top:12px;">
      <button id="signin-btn">
        Sign in or create account
      </button>
    </div>

    <div class="footer" style="margin-top: 12px;">
      <a class="link" target="_blank" rel="noreferrer" href="http://localhost:3000/privacy">Privacy</a> ·
      <a class="link" target="_blank" rel="noreferrer" href="http://localhost:3000/terms">Terms</a>
    </div>
  `;

  // Hook up sign-in button to trigger OAuth flow
  const signinBtn = document.getElementById('signin-btn');
  if (signinBtn) {
    signinBtn.addEventListener('click', () => {
      console.log('Initiating OAuth flow...');
      chrome.runtime.sendMessage({ type: 'BEGIN_AUTH' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Auth message error:', chrome.runtime.lastError);
        } else {
          console.log('Auth initiated:', response);
        }
      });
    });
  }

  // Theme button for locked state
  const themeBtnLocked = document.getElementById('theme-btn-locked');
  if (themeBtnLocked) {
    themeBtnLocked.addEventListener('click', async () => {
      const body = document.body;
      const isLightMode = body.classList.contains('light-mode');
      
      if (isLightMode) {
        body.classList.remove('light-mode');
        await chrome.storage.sync.set({ theme: 'dark' });
        console.log('Switched to dark mode');
      } else {
        body.classList.add('light-mode');
        await chrome.storage.sync.set({ theme: 'light' });
        console.log('Switched to light mode');
      }
    });
  }
}

