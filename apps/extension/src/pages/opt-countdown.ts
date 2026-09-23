import { countdownView, TOOL_HELP } from '../tool-ui';
import { calculateTimeRemaining, filingWindowMessage } from './opt-apply-date-helpers';
import { getIdToken } from '../token-store';
import { renderPageHeader, setupPageHandlers, setCurrentPage, savePageData } from '../navigation.js';
import { WEBSITE_URL } from '../config.js';
import { icon } from '../icons.js';
import type { ToolSurfaceTone } from '../tool-page-theme.js';
import type { FilingWindowResults } from './opt-apply-date-helpers';

/**
 * Check if user has premium access
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
 * Load tool email from API (syncs with website)
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
 * Save tool email to API (syncs with website)
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
 * Render OPT Countdown Page
 */
export async function renderOptCountdown(
  root: HTMLElement,
  onBack: () => void,
  results: FilingWindowResults
): Promise<void> {
  root.innerHTML = '';

  // Save page state for persistence
  setCurrentPage('opt-countdown');
  savePageData('opt-countdown', {
    results: {
      earliestStart: results.earliestStart.toISOString(),
      latestEnd: results.latestEnd.toISOString(),
      uscisDeadline: results.uscisDeadline?.toISOString() ?? null,
      filingDeadline: results.filingDeadline.toISOString(),
      programEndDate: results.programEndDate.toISOString(),
      dsoRecommendationDate: results.dsoRecommendationDate?.toISOString() ?? null,
    }
  });

  renderPageHeader(root, 'OPT Filing Window', 'Your personalized countdown');

  const content = document.createElement('div');
  content.style.cssText = 'margin-top: 12px;';

  const filingDeadline = results.filingDeadline ?? results.latestEnd;

  let countdownInterval: number | null = null;

  const isPremium = await checkPremiumStatus();

  // Load email from API (syncs with website)
  const subscribedEmail = await loadToolEmail('opt_apply');
  const hasSubscribed = !!subscribedEmail;

  content.className = 'tool-content';
  content.innerHTML = countdownView(results.earliestStart, filingDeadline, isPremium, hasSubscribed, `${TOOL_HELP.opt} The countdown is a local calendar-day estimate; confirm receipt requirements with your DSO.`, !results.dsoRecommendationDate);

  root.appendChild(content);
  const reminderEmailInput = content.querySelector('#reminder-email-input') as HTMLInputElement | null;
  if (reminderEmailInput) reminderEmailInput.value = subscribedEmail || '';

  // Store previous values for flip animation
  let previousValues = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  // Update countdown every second with flip animation and dynamic colors
  function updateCountdown() {
    if (!content.isConnected) {
      if (countdownInterval) clearInterval(countdownInterval);
      return;
    }
    const remaining = calculateTimeRemaining(filingDeadline);

    const daysLeftText = content.querySelector('#days-left-text');
    const daysEl = content.querySelector('#countdown-days') as HTMLElement;
    const hoursEl = content.querySelector('#countdown-hours') as HTMLElement;
    const minutesEl = content.querySelector('#countdown-minutes') as HTMLElement;
    const secondsEl = content.querySelector('#countdown-seconds') as HTMLElement;
    const messageEl = content.querySelector('#time-message');
    const containerEl = content.querySelector('#countdown-container') as HTMLElement;

    // Determine color based on days remaining (Apple colors)
    let tone: ToolSurfaceTone = 'red';
    if (remaining.days > 60) {
      // Green - lots of time
      tone = 'green';
    } else if (remaining.days > 30) {
      // Blue - moderate time
      tone = 'blue';
    } else if (remaining.days > 14) {
      // Orange - getting close
      tone = 'orange';
    } else if (remaining.days > 7) {
      // Deep Orange - very close
      tone = 'orange';
    } else {
      // Red - urgent
      tone = 'red';
    }

    // Update container background with smooth transition
    if (containerEl) {
      containerEl.dataset.tone = tone;

    }

    // Flip animation function
    function flipElement(element: HTMLElement, newValue: string) {
      if (element) element.textContent = newValue;
    }

    const currentDays = String(remaining.days).padStart(2, '0');
    const currentHours = String(remaining.hours).padStart(2, '0');
    const currentMinutes = String(remaining.minutes).padStart(2, '0');
    const currentSeconds = String(remaining.seconds).padStart(2, '0');

    if (daysLeftText) daysLeftText.textContent = remaining.total === 0 ? 'Window expired' : `${remaining.days} days left`;

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

    if (secondsEl) {
      flipElement(secondsEl, currentSeconds);
    }

    // Update message based on days remaining
    if (messageEl) {
      messageEl.textContent = filingWindowMessage(results.earliestStart, filingDeadline);
    }

    // Store current values for next iteration
    previousValues = {
      days: remaining.days,
      hours: remaining.hours,
      minutes: remaining.minutes,
      seconds: remaining.seconds
    };
  }

  updateCountdown();
  countdownInterval = window.setInterval(updateCountdown, 1000);

  // Event listeners
  const modifyBtn = content.querySelector('#modify-dates-btn');
  if (modifyBtn) {
    modifyBtn.addEventListener('click', () => {
      if (countdownInterval) clearInterval(countdownInterval);
      onBack();
    });
  }

  if (isPremium) {
    // Save email button
    const saveEmailBtn = content.querySelector('#save-email-btn') as HTMLButtonElement;
    if (saveEmailBtn) {
      saveEmailBtn.addEventListener('click', async () => {
        const emailInput = content.querySelector('#reminder-email-input') as HTMLInputElement;
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
        const success = await saveToolEmail('opt_apply', email);

        if (success) {
          // Show success notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Email Saved!',
            message: `Daily reminders will be sent to ${email} at 9:00 AM ET`
          });

          // Change button to checkmark
          saveEmailBtn.innerHTML = icon('checkCircle', 18, 'currentColor');
          saveEmailBtn.style.background = 'rgba(16, 185, 129, 0.8)';

          // Reload the page after 1 second to show "Stop Reminders" button
          setTimeout(() => {
            renderOptCountdown(root, onBack, results);
          }, 1000);
        } else {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Error',
            message: 'Failed to save email. Please try again.'
          });
        }
      });
    }

    // Stop reminders button
    const stopBtn = content.querySelector('#stop-reminders-btn');
    if (stopBtn) {
      stopBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to stop daily reminders?')) {
          // Remove email from API (syncs with website)
          await saveToolEmail('opt_apply', '');

          // Show notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Reminders Stopped',
            message: 'Daily email reminders have been stopped'
          });

          // Reload the page immediately to hide the button
          renderOptCountdown(root, onBack, results);
        }
      });
    }
  } else {
    // Upgrade to premium button
    const upgradeBtn = content.querySelector('#upgrade-premium-btn');
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', () => {
        // Open dashboard with pricing modal
        // Dashboard will handle auth redirect if not logged in
        chrome.tabs.create({ url: `${WEBSITE_URL}/dashboard?upgrade=true` });
      });
    }
  }

  setupPageHandlers(() => {
    if (countdownInterval) clearInterval(countdownInterval);
    onBack();
  });
}
