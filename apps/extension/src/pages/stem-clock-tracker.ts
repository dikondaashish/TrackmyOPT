import { compactDate, toolIntro, reminderContent, TOOL_HELP } from '../tool-ui';
import { getIdToken } from '../token-store';
import { WEBSITE_URL } from '../config.js';
import { renderPageHeader, setupPageHandlers } from '../navigation.js';
import { icon } from '../icons.js';
import {
  loadVerifiedUnemploymentClock,
  summarizeUnemploymentClock,
} from '../unemployment-clock-contract.js';

/**
 * Format date for card display (e.g., "13 OCTOBER 2025")
 */
function getCardDateFormat(date: Date): { day: string; month: string; year: string } {
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

  return {
    day: String(date.getDate()),
    month: months[date.getMonth()],
    year: String(date.getFullYear())
  };
}

/**
 * Check premium status
 */
async function checkPremiumStatus(): Promise<boolean> {
  try {
    const idToken = await getIdToken();

    // Try with idToken first (extension auth)
    if (idToken) {
      const response = await fetch(`${WEBSITE_URL}/api/premium/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result.isPremium || false;
      }
    }

    // Fallback: Try with cookies (web session auth)
    // This works if user signed in via dashboard
    const response = await fetch(`${WEBSITE_URL}/api/premium/status`, {
      method: 'GET',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return false;

    const result = await response.json();
    return result.isPremium || false;
  } catch (error) {
    return false;
  }
}

/**
 * Load tool email from API
 */
async function loadToolEmail(tool: string): Promise<string | null> {
  try {
    // Try session cookies first (if user logged in via website)
    let response = await fetch(`${WEBSITE_URL}/api/user/tool-email?tool=${tool}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // If session cookies failed, try JWT token
    if (!response.ok) {
      const idToken = await getIdToken();
      if (idToken) {
        response = await fetch(`${WEBSITE_URL}/api/user/tool-email?tool=${tool}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
    }

    if (!response.ok) return null;

    const result = await response.json();
    return result.email || null;
  } catch (error) {
    return null;
  }
}

/**
 * Save tool email to API
 */
async function saveToolEmail(tool: string, email: string): Promise<boolean> {
  try {
    // Try session cookies first (if user logged in via website)
    let response = await fetch(`${WEBSITE_URL}/api/user/tool-email`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tool, email }),
    });

    // If session cookies failed, try JWT token
    if (!response.ok) {
      const idToken = await getIdToken();
      if (idToken) {
        response = await fetch(`${WEBSITE_URL}/api/user/tool-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tool, email }),
        });
      }
    }

    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Render STEM OPT Clock Tracker countdown page
 */
export function renderStemClockTracker(
  root: HTMLElement,
  onBack: () => void,
  startDate: Date
): void {
  root.innerHTML = '';

  // Save page state for persistence
  import('../navigation.js').then(({ setCurrentPage, savePageData }) => {
    setCurrentPage('stem-clock-tracker');
    savePageData('stem-clock-tracker', { startDate: startDate.toISOString() });
  });

  renderPageHeader(root, 'STEM OPT Clock Tracker', 'Employment timeline');

  const content = document.createElement('div');
  content.className = 'tool-content';
  content.innerHTML = `${toolIntro('Employment timeline', 'clock-info-help', TOOL_HELP.clock)}<div class="tool-dates">${compactDate('EAD starts', startDate)}${compactDate('Today', new Date())}</div>`;
  const countdownCard = document.createElement('section');
  countdownCard.className = 'tool-usage';
  countdownCard.setAttribute('aria-live', 'polite');
  countdownCard.innerHTML = '<div id="verified-clock-status" class="tool-status">Loading unemployment days…</div>';
  content.appendChild(countdownCard);

  const modifyBtn = document.createElement('button');
  modifyBtn.type = 'button';
  modifyBtn.className = 'tool-button tool-button-primary';
  modifyBtn.textContent = 'Modify Start Date';
  content.appendChild(modifyBtn);

  const remindersCard = document.createElement('section');
  remindersCard.id = 'reminders-card';
  remindersCard.className = 'tool-reminders';
  remindersCard.innerHTML = `${toolIntro('Daily reminders', 'reminders-help', TOOL_HELP.reminders)}<div id="premium-content">${reminderContent(false, false, 'upgrade-btn')}</div>`;
  content.appendChild(remindersCard);
  root.appendChild(content);

  void loadVerifiedUnemploymentClock()
    .then((clock) => {
      if (!clock || clock.phase !== 'stem') {
        countdownCard.innerHTML = `
          <div style="font-size:14px;font-weight:750;text-align:center;">Add employment history</div>
          <p class="tool-status">Complete your records to see days remaining.</p><a class="tool-inline-link" href="${WEBSITE_URL}/dashboard" target="_blank" rel="noopener">Open dashboard</a>
        `;
        return;
      }

      const summary = summarizeUnemploymentClock(clock);
      const progress = Math.min(100, Math.round((clock.used / clock.max) * 100));
      countdownCard.innerHTML = `
        <div class="tool-usage-headline">${summary.headline}</div>
        <div class="tool-usage-detail">${summary.usage}</div>
        <div class="tool-usage-phase">${summary.phaseLabel}</div>
        <div class="tool-usage-track">
          <div id="verified-stem-clock-progress"></div>
        </div>
        ${toolIntro('How days are counted', 'usage-help', 'The 150-day allowance is cumulative across initial and STEM OPT. ' + TOOL_HELP.clock)}
      `;
      requestAnimationFrame(() => {
        const bar = document.getElementById('verified-stem-clock-progress');
        if (bar) bar.style.width = `${progress}%`;
      });
    })
    .catch(() => {
      countdownCard.innerHTML = `
        <div style="font-size:13px;font-weight:700;text-align:center;">Could not load unemployment days.</div>
        <div style="font-size:11px;opacity:.8;text-align:center;margin-top:8px;">Check your connection and try again.</div>
      `;
    });

  // Check premium status and update UI
  checkPremiumStatus().then(async (isPremium) => {
    const premiumContent = document.getElementById('premium-content');
    if (!premiumContent) return;

    if (isPremium) {
      // Load email from API (syncs with website and database)
      const savedEmail = await loadToolEmail('stem_clock');

      premiumContent.innerHTML = reminderContent(true, !!savedEmail, 'upgrade-btn');

      const reminderEmailInput = document.getElementById('reminder-email-input') as HTMLInputElement | null;
      if (reminderEmailInput) reminderEmailInput.value = savedEmail || '';
      const saveEmailBtn = document.getElementById('save-email-btn') as HTMLButtonElement;
      const stopRemindersBtn = document.getElementById('stop-reminders-btn');

      saveEmailBtn?.addEventListener('click', async () => {
        const emailInput = document.getElementById('reminder-email-input') as HTMLInputElement;
        const email = emailInput?.value.trim();

        if (!email) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Email Required',
            message: 'Please enter your email address'
          });
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Invalid Email',
            message: 'Please enter a valid email address'
          });
          return;
        }

        // Save email to API (syncs with website and database)
        const success = await saveToolEmail('stem_clock', email);

        if (success) {
          // Show success notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Email Saved!',
            message: `Daily reminders will be sent to ${email} at 9:00 AM ET`
          });

          // Change button to checkmark
          if (saveEmailBtn) {
            saveEmailBtn.innerHTML = icon('checkCircle', 18, 'currentColor');
            saveEmailBtn.style.background = 'rgba(16, 185, 129, 0.8)';

            // Reload the page after 1 second to show "Stop Reminders" button
            setTimeout(() => {
              renderStemClockTracker(root, onBack, startDate);
            }, 1000);
          }
        } else {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Error',
            message: 'Failed to save email. Please try again.'
          });
        }
      });

      stopRemindersBtn?.addEventListener('click', async () => {
        if (confirm('Are you sure you want to stop daily reminders?')) {
          // Remove email from API (syncs with website and database)
          await saveToolEmail('stem_clock', '');

          // Show notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Reminders Stopped',
            message: 'Daily email reminders have been stopped'
          });

          // Reload the page immediately to hide the button
          renderStemClockTracker(root, onBack, startDate);
        }
      });

      // Hover effects
    }
  });

  // Event handlers
  const upgradeBtn = document.getElementById('upgrade-btn');

  upgradeBtn?.addEventListener('click', () => {
    chrome.tabs.create({ url: `${WEBSITE_URL}/dashboard?upgrade=true` });
  });

  modifyBtn.addEventListener('click', onBack);



  setupPageHandlers(onBack);
}
