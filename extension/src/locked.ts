/**
 * Renders the locked state when user is not signed in
 */
export async function renderLocked(root: HTMLElement): Promise<void> {
  root.innerHTML = `
    <div class="header">
      <div class="header-buttons">
        <button class="theme-btn" id="theme-btn-locked" title="Toggle theme" aria-label="Toggle theme">
          <span id="theme-icon-locked">🌙</span>
        </button>
      </div>
      <h1 class="title" style="font-size: 24px; margin-bottom: 8px;">TrackMyOPT</h1>
      <p class="subtitle" style="font-size: 13px; opacity: 0.7;">Your OPT Timeline Companion</p>
    </div>
    
    <div style="margin-top: 20px; padding: 0 4px;">
      <!-- Features List -->
      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
        <div style="display: flex; align-items: start; gap: 12px;">
          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px;">📅</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">Track Your Timeline</div>
            <div style="font-size: 12px; opacity: 0.7; line-height: 1.4;">Real-time countdown to critical OPT deadlines</div>
          </div>
        </div>
        
        <div style="display: flex; align-items: start; gap: 12px;">
          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px;">🧮</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">Filing Windows</div>
            <div style="font-size: 12px; opacity: 0.7; line-height: 1.4;">Know exactly when to apply for OPT & STEM</div>
          </div>
        </div>
        
        <div style="display: flex; align-items: start; gap: 12px;">
          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px;">📊</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">Unemployment Tracking</div>
            <div style="font-size: 12px; opacity: 0.7; line-height: 1.4;">Monitor and manage your 90/150 day limits</div>
          </div>
        </div>
        
        <div style="display: flex; align-items: start; gap: 12px;">
          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px;">🔔</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">Smart Reminders</div>
            <div style="font-size: 12px; opacity: 0.7; line-height: 1.4;">Never miss important dates and deadlines</div>
          </div>
        </div>
      </div>
      
      <!-- CTA Buttons -->
      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 20px;">
        <button id="signin-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: transform 0.2s; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);">
          Sign In
        </button>
        <button id="create-account-btn" style="background: transparent; border: 1px solid rgba(102, 126, 234, 0.3); padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
          Create Account
        </button>
      </div>
    </div>

    <div class="footer" style="margin-top: 16px; font-size: 11px;">
      <a class="link" target="_blank" rel="noreferrer" href="https://www.trackmyopt.com/privacy">Privacy</a> ·
      <a class="link" target="_blank" rel="noreferrer" href="https://www.trackmyopt.com/terms">Terms</a>
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
  
  // Hook up create account button
  const createAccountBtn = document.getElementById('create-account-btn');
  if (createAccountBtn) {
    createAccountBtn.addEventListener('click', () => {
      console.log('Opening create account page...');
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

