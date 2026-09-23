import { countdownView, TOOL_HELP } from '../tool-ui';
import { calculateTimeRemaining, filingWindowMessage } from './opt-apply-date-helpers';
import { stemApiRequest } from './stem-apply-api';
import { WEBSITE_URL } from '../config.js';
import { renderPageHeader, setupPageHandlers, setCurrentPage, savePageData } from '../navigation.js';
import { icon } from '../icons.js';
import type { ToolSurfaceTone } from '../tool-page-theme.js';

/**
 * Check if user has premium access
 */
async function checkPremiumStatus(): Promise<boolean> {
  try {
    const response = await stemApiRequest('/api/premium/status', { method: 'GET' });

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
    const response = await stemApiRequest(`/api/user/tool-email?tool=${tool}`, { method: 'GET' });

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
    const response = await stemApiRequest('/api/user/tool-email', {
      method: 'POST',
      body: JSON.stringify({ tool, email }),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Render STEM OPT Countdown Page
 */
export async function renderStemCountdown(
  root: HTMLElement,
  onBack: () => void,
  results: import('./opt-apply-date-helpers').StemFilingWindowResults
): Promise<void> {
  root.innerHTML = '';

  // Save page state for persistence
  setCurrentPage('stem-countdown');
  savePageData('stem-countdown', {
    results: {
      earliestStart: results.earliestStart.toISOString(),
      latestEnd: results.latestEnd.toISOString(),
      currentOptEndDate: results.currentOptEndDate.toISOString(),
      dsoRecommendationDate: results.dsoRecommendationDate?.toISOString() ?? null,
      uscisDeadline: results.uscisDeadline?.toISOString() ?? null,
      filingDeadline: results.filingDeadline.toISOString()
    }
  });

  renderPageHeader(root, 'STEM OPT Filing Window', 'Your personalized countdown');

  const content = document.createElement('div');
  content.style.cssText = 'margin-top: 12px;';

  const filingDeadline = results.filingDeadline;

  let countdownInterval: number | null = null;
  content.textContent = 'Loading reminders…';
  root.appendChild(content);
  setupPageHandlers(() => {
    if (countdownInterval) clearInterval(countdownInterval);
    onBack();
  });

  const isPremium = await checkPremiumStatus();
  if (!root.contains(content)) return;

  // Load email from API (syncs with website)
  const subscribedEmail = await loadToolEmail('stem_apply');
  if (!root.contains(content)) return;
  const hasSubscribed = !!subscribedEmail;

  content.className = 'tool-content';
  content.innerHTML = countdownView(results.earliestStart, filingDeadline, isPremium, hasSubscribed, `${TOOL_HELP.stem} Your saved STEM recommendation date syncs with your dashboard and reminders. Without it, the deadline is an estimate. The countdown is a local calendar-day estimate; confirm receipt requirements with your DSO.`, !results.dsoRecommendationDate);

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
      tone = 'green';
    } else if (remaining.days > 30) {
      tone = 'blue';
    } else if (remaining.days > 14) {
      tone = 'orange';
    } else if (remaining.days > 7) {
      tone = 'orange';
    } else {
      tone = 'red';
    }

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

    if (secondsEl) flipElement(secondsEl, currentSeconds);

    if (messageEl) {
      messageEl.textContent = filingWindowMessage(results.earliestStart, filingDeadline);
    }

    previousValues = { days: remaining.days, hours: remaining.hours, minutes: remaining.minutes, seconds: remaining.seconds };
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
        const success = await saveToolEmail('stem_apply', email);

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
            if (!root.contains(content)) return;
            if (countdownInterval) clearInterval(countdownInterval);
            renderStemCountdown(root, onBack, results);
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

    const stopBtn = content.querySelector('#stop-reminders-btn');
    if (stopBtn) {
      stopBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to stop daily reminders?')) {
          // Remove email from API (syncs with website)
          const stopped = await saveToolEmail('stem_apply', '');
          if (!stopped) {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon128.png',
              title: 'Error',
              message: 'Failed to stop reminders. Please try again.'
            });
            return;
          }

          // Show notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Reminders Stopped',
            message: 'Daily email reminders have been stopped'
          });

          // Reload the page immediately to hide the button
          renderStemCountdown(root, onBack, results);
        }
      });
    }
  } else {
    const upgradeBtn = content.querySelector('#upgrade-premium-btn');
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', () => {
        // Open dashboard with pricing modal
        // Dashboard will handle auth redirect if not logged in
        chrome.tabs.create({ url: `${WEBSITE_URL}/dashboard?upgrade=true` });
      });
    }
  }

}
