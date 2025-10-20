/**
 * Renders the locked state when user is not signed in
 */
export async function renderLocked(root: HTMLElement): Promise<void> {
  // Check if user has used Google sign-in before
  const { lastSignInMethod } = await chrome.storage.sync.get('lastSignInMethod');
  const showLastUsed = lastSignInMethod === 'google';

  root.innerHTML = `
    <div class="header">
      <div class="header-buttons">
        <button class="theme-btn" id="theme-btn-locked" title="Toggle theme" aria-label="Toggle theme">
          <span id="theme-icon-locked">🌙</span>
        </button>
      </div>
      <h1 class="title">TrackMyOPT</h1>
      <p class="subtitle">Your OPT Timeline Companion</p>
    </div>
    
    <!-- Features Showcase -->
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon blue-bg">📅</div>
        <div class="feature-text">
          <div class="feature-title">Filing Windows</div>
          <div class="feature-desc">Know exactly when to apply</div>
        </div>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon purple-bg">⏱️</div>
        <div class="feature-text">
          <div class="feature-title">Unemployment Days</div>
          <div class="feature-desc">Track your remaining days</div>
        </div>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon orange-bg">🔔</div>
        <div class="feature-text">
          <div class="feature-title">Smart Reminders</div>
          <div class="feature-desc">Never miss a deadline</div>
        </div>
      </div>
      
      <div class="feature-card">
        <div class="feature-icon green-bg">📊</div>
        <div class="feature-text">
          <div class="feature-title">STEM Extension</div>
          <div class="feature-desc">Calculate STEM timelines</div>
        </div>
      </div>
    </div>
    
    <!-- Sign In Buttons -->
    <div class="auth-buttons">
      <button id="google-signin-btn" class="google-btn">
        <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>Continue with Google</span>
        ${showLastUsed ? '<span class="last-used-badge">Last used</span>' : ''}
      </button>
      
      <button id="email-signin-btn" class="email-btn">
        <svg class="email-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        <span>Sign in with Email</span>
      </button>
      
      <div class="divider">
        <span>or</span>
      </div>
      
      <button id="create-account-btn" class="create-btn">
        Create New Account
      </button>
    </div>

    <div class="footer">
      <a class="link" target="_blank" rel="noreferrer" href="https://www.trackmyopt.com/privacy">Privacy</a>
      <span class="footer-dot">·</span>
      <a class="link" target="_blank" rel="noreferrer" href="https://www.trackmyopt.com/terms">Terms</a>
    </div>
  `;

  // Hook up Google sign-in button
  const googleSigninBtn = document.getElementById('google-signin-btn');
  if (googleSigninBtn) {
    googleSigninBtn.addEventListener('click', async () => {
      console.log('Initiating Google OAuth flow...');
      // Save last sign-in method
      await chrome.storage.sync.set({ lastSignInMethod: 'google' });
      chrome.runtime.sendMessage({ type: 'BEGIN_AUTH' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Auth message error:', chrome.runtime.lastError);
        } else {
          console.log('Auth initiated:', response);
        }
      });
    });
  }

  // Hook up Email sign-in button
  const emailSigninBtn = document.getElementById('email-signin-btn');
  if (emailSigninBtn) {
    emailSigninBtn.addEventListener('click', () => {
      console.log('Opening email sign-in...');
      chrome.tabs.create({ url: 'https://www.trackmyopt.com/login' });
    });
  }

  // Hook up Create Account button
  const createAccountBtn = document.getElementById('create-account-btn');
  if (createAccountBtn) {
    createAccountBtn.addEventListener('click', () => {
      console.log('Opening create account...');
      chrome.tabs.create({ url: 'https://www.trackmyopt.com/login' });
    });
  }

  // Theme button for locked state
  const themeBtnLocked = document.getElementById('theme-btn-locked');
  const themeIconLocked = document.getElementById('theme-icon-locked');
  
  // Set initial icon based on current theme
  const { theme } = await chrome.storage.sync.get('theme');
  if (themeIconLocked) {
    themeIconLocked.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
  
  if (themeBtnLocked) {
    themeBtnLocked.addEventListener('click', async () => {
      const body = document.body;
      const isDarkMode = body.classList.contains('dark-mode');
      
      if (isDarkMode) {
        body.classList.remove('dark-mode');
        await chrome.storage.sync.set({ theme: 'light' });
        if (themeIconLocked) themeIconLocked.textContent = '🌙';
        console.log('Switched to light mode');
      } else {
        body.classList.add('dark-mode');
        await chrome.storage.sync.set({ theme: 'dark' });
        if (themeIconLocked) themeIconLocked.textContent = '☀️';
        console.log('Switched to dark mode');
      }
    });
  }
}

