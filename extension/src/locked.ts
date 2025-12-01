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
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px;">🗓️</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 2px;">Track Your Timeline</div>
            <div style="font-size: 12px; opacity: 0.7; line-height: 1.4;">Real-time countdown to critical OPT deadlines</div>
          </div>
        </div>
        
        <div style="display: flex; align-items: start; gap: 12px;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px;">🧮</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 2px;">Filing Windows</div>
            <div style="font-size: 12px; opacity: 0.7; line-height: 1.4;">Know exactly when to apply for OPT & STEM</div>
          </div>
        </div>
        
        <div style="display: flex; align-items: start; gap: 12px;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px;">📊</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 2px;">Unemployment Tracking</div>
            <div style="font-size: 12px; opacity: 0.7; line-height: 1.4;">Monitor and manage your 90/150 day limits</div>
          </div>
        </div>
        
        <div style="display: flex; align-items: start; gap: 12px;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px;">🔔</div>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 2px;">Smart Reminders</div>
            <div style="font-size: 12px; opacity: 0.7; line-height: 1.4;">Never miss important dates and deadlines</div>
          </div>
        </div>
      </div>
      
      <!-- CTA Button -->
      <div style="margin-top: 12px;">
        <button id="signin-btn" style="width: 100%; background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 600; font-size: 14px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 12px rgba(30, 64, 175, 0.4);">
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
      chrome.tabs.create({ url: 'https://www.trackmyopt.com/login' });
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
      } else {
        body.classList.add('dark-mode');
        await chrome.storage.sync.set({ theme: 'dark' });
        if (themeIconLocked) themeIconLocked.textContent = '☀️';
      }
    });
  }
}