import { getIdToken } from '../token-store';
import { WEBSITE_URL } from '../config.js';
import { renderPageHeader, setupPageHandlers } from '../navigation.js';
import { icon } from '../icons.js';
import { toolSurfaceCard, type ToolSurfaceTone } from '../tool-page-theme.js';

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
 * Calculate time remaining
 */
function calculateTimeRemaining(endDate: Date): {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  message: string;
} {
  const now = new Date();
  const total = endDate.getTime() - now.getTime();

  if (total <= 0) {
    return {
      total: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      message: "Your STEM OPT period has ended"
    };
  }

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);

  let message = '';
  if (days <= 7) {
    message = 'Urgent! Very little time left';
  } else if (days <= 20) {
    message = 'Time is running short, act soon';
  } else if (days <= 40) {
    message = 'Time is moving along, stay prepared';
  } else {
    message = 'You have plenty of time remaining';
  }

  return { total, days, hours, minutes, seconds, message };
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

  renderPageHeader(root, 'STEM OPT Clock Tracker', 'Track your STEM OPT timeline with precision');

  const content = document.createElement('div');
  content.style.cssText = 'margin-top: 12px;';

  // Calculate end date (60 days of unemployment allowed for STEM OPT)
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 60);

  const today = new Date();

  // Format dates for cards
  const startFormatted = getCardDateFormat(startDate);
  const todayFormatted = getCardDateFormat(today);
  const endFormatted = getCardDateFormat(endDate);

  // Date cards container
  const dateCardsContainer = document.createElement('div');
  dateCardsContainer.style.cssText = `
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 12px;
  `;

  // START DATE card (Orange - STEM color)
  const startCard = document.createElement('div');
  startCard.style.cssText = `
    padding: 14px 10px;
    border-radius: 16px;
    ${toolSurfaceCard('orange')};
    text-align: center;
  `;
  startCard.innerHTML = `
    <div style="margin-bottom: 8px; opacity: 0.9;">
      <div style="width: 36px; height: 36px; margin: 0 auto; background: var(--surface-2); border-radius: 10px; display: grid; place-items: center; font-size: 20px;">
        ${icon('calendar', 20, 'currentColor')}
      </div>
    </div>
    <div style="font-size: 22px; font-weight: 800; line-height: 1; margin-bottom: 3px;">${startFormatted.day}</div>
    <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.5px; opacity: 0.95; margin-bottom: 2px;">${startFormatted.month}</div>
    <div style="font-size: 11px; font-weight: 600; opacity: 0.9;">${startFormatted.year}</div>
    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">START DATE</div>
  `;
  dateCardsContainer.appendChild(startCard);

  // PRESENT card (Orange - STEM color)
  const presentCard = document.createElement('div');
  presentCard.style.cssText = `
    padding: 14px 10px;
    border-radius: 16px;
    ${toolSurfaceCard('orange')};
    text-align: center;
  `;
  presentCard.innerHTML = `
    <div style="margin-bottom: 8px; opacity: 0.9;">
      <div style="width: 36px; height: 36px; margin: 0 auto; background: var(--surface-2); border-radius: 10px; display: grid; place-items: center; font-size: 20px;">
        ${icon('calendar', 20, 'currentColor')}
      </div>
    </div>
    <div style="font-size: 22px; font-weight: 800; line-height: 1; margin-bottom: 3px;">${todayFormatted.day}</div>
    <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.5px; opacity: 0.95; margin-bottom: 2px;">${todayFormatted.month}</div>
    <div style="font-size: 11px; font-weight: 600; opacity: 0.9;">${todayFormatted.year}</div>
    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">PRESENT</div>
  `;
  dateCardsContainer.appendChild(presentCard);

  // END DATE card (Red)
  const endCard = document.createElement('div');
  endCard.style.cssText = `
    padding: 14px 10px;
    border-radius: 16px;
    ${toolSurfaceCard('red')};
    text-align: center;
  `;
  endCard.innerHTML = `
    <div style="margin-bottom: 8px; opacity: 0.9;">
      <div style="width: 36px; height: 36px; margin: 0 auto; background: var(--surface-2); border-radius: 10px; display: grid; place-items: center; font-size: 20px;">
        ${icon('calendar', 20, 'currentColor')}
      </div>
    </div>
    <div style="font-size: 22px; font-weight: 800; line-height: 1; margin-bottom: 3px;">${endFormatted.day}</div>
    <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.5px; opacity: 0.95; margin-bottom: 2px;">${endFormatted.month}</div>
    <div style="font-size: 11px; font-weight: 600; opacity: 0.9;">${endFormatted.year}</div>
    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border); font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">END DATE</div>
  `;
  dateCardsContainer.appendChild(endCard);

  content.appendChild(dateCardsContainer);

  // Countdown card
  const countdownCard = document.createElement('div');
  countdownCard.style.cssText = `
    padding: 20px 16px;
    border-radius: 18px;
    ${toolSurfaceCard('red')};
    margin-bottom: 12px;
  `;

  const timeRemaining = calculateTimeRemaining(endDate);

  countdownCard.innerHTML = `
    <div id="days-left-text" style="font-size: 28px; font-weight: 800; text-align: center; margin-bottom: 14px; line-height: 1;">${timeRemaining.days} days left</div>
    
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 14px;">
      <div style="background: var(--surface-2); backdrop-filter: blur(10px); border-radius: 12px; padding: 10px 6px; text-align: center;">
        <div id="countdown-days" style="font-size: 24px; font-weight: 800; color: #f97316; line-height: 1; margin-bottom: 4px;">${String(timeRemaining.days).padStart(2, '0')}</div>
        <div style="font-size: 9px; font-weight: 700; opacity: 0.9; letter-spacing: 0.5px;">DAYS</div>
      </div>
      <div style="background: var(--surface-2); backdrop-filter: blur(10px); border-radius: 12px; padding: 10px 6px; text-align: center;">
        <div id="countdown-hours" style="font-size: 24px; font-weight: 800; color: #f97316; line-height: 1; margin-bottom: 4px;">${String(timeRemaining.hours).padStart(2, '0')}</div>
        <div style="font-size: 9px; font-weight: 700; opacity: 0.9; letter-spacing: 0.5px;">HOURS</div>
      </div>
      <div style="background: var(--surface-2); backdrop-filter: blur(10px); border-radius: 12px; padding: 10px 6px; text-align: center;">
        <div id="countdown-minutes" style="font-size: 24px; font-weight: 800; color: #f97316; line-height: 1; margin-bottom: 4px;">${String(timeRemaining.minutes).padStart(2, '0')}</div>
        <div style="font-size: 9px; font-weight: 700; opacity: 0.9; letter-spacing: 0.5px;">MINUTES</div>
      </div>
      <div style="background: var(--surface-2); backdrop-filter: blur(10px); border-radius: 12px; padding: 10px 6px; text-align: center;">
        <div id="countdown-seconds" style="font-size: 24px; font-weight: 800; color: #f97316; line-height: 1; margin-bottom: 4px;">${String(timeRemaining.seconds).padStart(2, '0')}</div>
        <div style="font-size: 9px; font-weight: 700; opacity: 0.9; letter-spacing: 0.5px;">SECONDS</div>
      </div>
    </div>
    
    <div id="countdown-message" style="text-align: center; font-size: 13px; font-weight: 600; opacity: 0.95;">${timeRemaining.message}</div>
  `;

  content.appendChild(countdownCard);

  // Email reminders card (Premium feature) - Orange theme for STEM
  const remindersCard = document.createElement('div');
  remindersCard.id = 'reminders-card';
  remindersCard.style.cssText = `
    padding: 18px;
    border-radius: 18px;
    ${toolSurfaceCard('orange')};
    margin-bottom: 12px;
  `;

  remindersCard.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: center; margin-bottom: 8px;">${icon('mail', 22, 'currentColor')}</div>
      <div style="font-weight: 800; font-size: 16px;">Daily Reminders (9:00 AM ET)</div>
    </div>
    <div style="font-size: 12px; opacity: 0.95; margin-bottom: 14px; line-height: 1.5;">
      We'll show a Chrome notification every morning. If you enter an email and connect the mailer, we'll also email you.
    </div>
    <div id="premium-content" style="text-align: center; padding: 20px 10px;">
      <div style="font-size: 13px; margin-bottom: 12px; opacity: 0.95; display: flex; align-items: center; justify-content: center; gap: 6px;">${icon('lock', 14, 'currentColor')} Unlock Daily Email Reminders</div>
      <div style="font-size: 12px; margin-bottom: 14px; opacity: 0.9;">Get daily email notifications with Pro ($4.99/mo)</div>
      <button id="upgrade-btn" style="
        width: 100%;
        padding: 12px;
        border: 0;
        border-radius: 12px;
        background: var(--surface-2);
        backdrop-filter: blur(10px);
        color: var(--ink);
        font-weight: 800;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
      ">Upgrade to Pro ($4.99/mo)</button>
    </div>
  `;

  content.appendChild(remindersCard);

  // Modify button (Green)
  const modifyBtn = document.createElement('button');
  modifyBtn.innerHTML = 'Modify Start Date';
  modifyBtn.style.cssText = `
    width: 100%;
    padding: 16px;
    border: 0;
    border-radius: 16px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
    font-weight: 800;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.3);
    font-family: inherit;
  `;
  content.appendChild(modifyBtn);

  root.appendChild(content);

  // Store previous values for flip animation
  let previousValues = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  // Update countdown every second with flip animation and dynamic colors
  let countdownInterval: ReturnType<typeof setInterval> | null = setInterval(() => {
    const remaining = calculateTimeRemaining(endDate);

    const daysEl = document.getElementById('countdown-days') as HTMLElement;
    const hoursEl = document.getElementById('countdown-hours') as HTMLElement;
    const minutesEl = document.getElementById('countdown-minutes') as HTMLElement;
    const secondsEl = document.getElementById('countdown-seconds') as HTMLElement;
    const messageEl = document.getElementById('countdown-message');
    const daysLeftEl = document.getElementById('days-left-text');
    const containerEl = document.getElementById('countdown-container') as HTMLElement;

    // Determine color based on days remaining (Apple colors)
    let tone: ToolSurfaceTone = 'red';
    if (remaining.days > 40) {
      tone = 'green';
    } else if (remaining.days > 20) {
      tone = 'blue';
    } else if (remaining.days > 10) {
      tone = 'orange';
    } else if (remaining.days > 5) {
      tone = 'orange';
    } else {
      tone = 'red';
    }

    if (containerEl) {
      containerEl.style.background = `var(--tool-${tone}-surface)`;
      containerEl.style.borderColor = `var(--tool-${tone}-border)`;
    }

    // Flip animation function
    function flipElement(element: HTMLElement, newValue: string) {
      if (!element) return;
      element.style.transform = 'rotateX(90deg)';
      element.style.opacity = '0';
      setTimeout(() => {
        element.textContent = newValue;
        element.style.transform = 'rotateX(0deg)';
        element.style.opacity = '1';
      }, 150);
    }

    const currentDays = String(remaining.days).padStart(2, '0');
    const currentHours = String(remaining.hours).padStart(2, '0');
    const currentMinutes = String(remaining.minutes).padStart(2, '0');
    const currentSeconds = String(remaining.seconds).padStart(2, '0');

    if (daysEl && currentDays !== String(previousValues.days).padStart(2, '0')) {
      flipElement(daysEl, currentDays);
    } else if (daysEl) {
      daysEl.textContent = currentDays;
    }

    if (hoursEl && currentHours !== String(previousValues.hours).padStart(2, '0')) {
      flipElement(hoursEl, currentHours);
    } else if (hoursEl) {
      hoursEl.textContent = currentHours;
    }

    if (minutesEl && currentMinutes !== String(previousValues.minutes).padStart(2, '0')) {
      flipElement(minutesEl, currentMinutes);
    } else if (minutesEl) {
      minutesEl.textContent = currentMinutes;
    }

    if (secondsEl) flipElement(secondsEl, currentSeconds);

    if (messageEl) messageEl.textContent = remaining.message;
    if (daysLeftEl) daysLeftEl.textContent = `${remaining.days} days left`;

    previousValues = { days: remaining.days, hours: remaining.hours, minutes: remaining.minutes, seconds: remaining.seconds };

    if (remaining.total <= 0 && countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }, 1000);

  // Check premium status and update UI
  checkPremiumStatus().then(async (isPremium) => {
    const premiumContent = document.getElementById('premium-content');
    if (!premiumContent) return;

    if (isPremium) {
      // Load email from API (syncs with website and database)
      const savedEmail = await loadToolEmail('stem_clock');

      premiumContent.innerHTML = `
        <div style="position: relative;">
          <input 
            type="email" 
            id="reminder-email-input" 
            placeholder="your@email.com"
            value="${savedEmail || ''}"
            style="
              width: 100%;
              padding: 14px 50px 14px 16px;
              border: 0;
              border-radius: 12px;
              background: var(--surface-2);
              backdrop-filter: blur(10px);
              color: var(--ink);
              font-size: 14px;
              font-weight: 600;
              outline: none;
              margin-bottom: 10px;
              font-family: inherit;
            "
          />
          <button 
            id="save-email-btn"
            style="
              position: absolute;
              right: 8px;
              top: 8px;
              padding: 6px 12px;
              border: 0;
              border-radius: 8px;
              background: var(--surface-2);
              color: var(--ink);
              cursor: pointer;
              font-size: 18px;
              display: grid;
              place-items: center;
              transition: all 0.2s;
            "
          >→</button>
        </div>
        <button id="stop-reminders-btn" style="
          width: 100%;
          padding: 10px;
          border: 0;
          border-radius: 10px;
          background: var(--surface-2);
          backdrop-filter: blur(10px);
          color: var(--ink);
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: inherit;
        ">
          ${icon('alertTriangle', 16, '#dc2626')}
          <span>Stop Reminders</span>
        </button>
      `;

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
          // Also save to local storage for quick access
          await chrome.storage.sync.set({ subscribedEmail: email });

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

          // Remove email from storage
          await chrome.storage.sync.remove('subscribedEmail');

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
      saveEmailBtn?.addEventListener('mouseenter', () => {
        if (saveEmailBtn) saveEmailBtn.style.background = 'var(--surface-2)';
      });
      saveEmailBtn?.addEventListener('mouseleave', () => {
        if (saveEmailBtn) saveEmailBtn.style.background = 'var(--surface-2)';
      });

      stopRemindersBtn?.addEventListener('mouseenter', () => {
        if (stopRemindersBtn) stopRemindersBtn.style.background = 'var(--surface-2)';
      });
      stopRemindersBtn?.addEventListener('mouseleave', () => {
        if (stopRemindersBtn) stopRemindersBtn.style.background = 'var(--surface-2)';
      });
    }
  });

  // Event handlers
  const upgradeBtn = document.getElementById('upgrade-btn');

  upgradeBtn?.addEventListener('click', () => {
    chrome.tabs.create({ url: `${WEBSITE_URL}/dashboard?upgrade=true` });
  });

  upgradeBtn?.addEventListener('mouseenter', () => {
    if (upgradeBtn) upgradeBtn.style.background = 'var(--surface-2)';
  });

  upgradeBtn?.addEventListener('mouseleave', () => {
    if (upgradeBtn) upgradeBtn.style.background = 'var(--surface-2)';
  });

  modifyBtn.addEventListener('click', () => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    onBack();
  });

  modifyBtn.addEventListener('mouseenter', () => {
    modifyBtn.style.transform = 'translateY(-2px)';
    modifyBtn.style.boxShadow = '0 8px 24px rgba(34, 197, 94, 0.4)';
  });

  modifyBtn.addEventListener('mouseleave', () => {
    modifyBtn.style.transform = 'translateY(0)';
    modifyBtn.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.3)';
  });

  setupPageHandlers(onBack);
}
