import { WEBSITE_URL } from '../config.js';
import { renderPageHeader, setupPageHandlers, setCurrentPage, savePageData } from '../navigation.js';

/**
 * Get formatted date for card display
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
function calculateTimeRemaining(targetDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, total: diff };
}

/**

/**
 * Check if user has premium access
 */
async function checkPremiumStatus(): Promise<boolean> {
  try {
    const { idToken } = await chrome.storage.sync.get('idToken');
    
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
    console.error('Error checking premium status:', error);
    return false;
  }
}

/**
 * Render STEM OPT Countdown Page
 */
export async function renderStemCountdown(
  root: HTMLElement, 
  onBack: () => void,
  results: {
    earliestStart: Date;
    latestEnd: Date;
    currentOptEndDate: Date;
  }
): Promise<void> {
  root.innerHTML = '';
  
  // Save page state for persistence
  setCurrentPage('stem-countdown');
  savePageData('stem-countdown', { results: {
    earliestStart: results.earliestStart.toISOString(),
    latestEnd: results.latestEnd.toISOString(),
    currentOptEndDate: results.currentOptEndDate.toISOString()
  }});
  
  renderPageHeader(root, 'STEM OPT Filing Window', 'Your personalized countdown');
  
  const content = document.createElement('div');
  content.style.cssText = 'margin-top: 12px;';
  
  const startCard = getCardDateFormat(results.earliestStart);
  const now = new Date();
  const presentCard = getCardDateFormat(now);
  const endCard = getCardDateFormat(results.latestEnd);
  
  let countdownInterval: number | null = null;
  
  const isPremium = await checkPremiumStatus();
  
  // Check if user has saved email
  const { savedEmail } = await chrome.storage.sync.get('savedEmail');
  const hasSubscribedEmail = savedEmail ? true : false;
  
  content.innerHTML = `
    <!-- Date Cards -->
    <div style="display: flex; gap: 8px; margin-bottom: 10px;">
      <!-- Start Date -->
      <div style="flex: 1; background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px; padding: 12px; color: white; text-align: center; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
        <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.25); border-radius: 10px; margin: 0 auto 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px;">
          <div style="font-size: 16px; font-weight: 800; line-height: 1;">${startCard.day}</div>
          <div style="font-size: 7px; font-weight: 600; text-transform: uppercase; opacity: 0.9; margin-top: 2px;">${startCard.month.substring(0, 3)}</div>
          <div style="font-size: 7px; opacity: 0.8;">${startCard.year}</div>
        </div>
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">START DATE</div>
      </div>
      
      <!-- Present -->
      <div style="flex: 1; background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px; padding: 12px; color: white; text-align: center; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
        <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.25); border-radius: 10px; margin: 0 auto 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px;">
          <div style="font-size: 16px; font-weight: 800; line-height: 1;">${presentCard.day}</div>
          <div style="font-size: 7px; font-weight: 600; text-transform: uppercase; opacity: 0.9; margin-top: 2px;">${presentCard.month.substring(0, 3)}</div>
          <div style="font-size: 7px; opacity: 0.8;">${presentCard.year}</div>
        </div>
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">PRESENT</div>
      </div>
      
      <!-- End Date -->
      <div style="flex: 1; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 16px; padding: 12px; color: white; text-align: center; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
        <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.25); border-radius: 10px; margin: 0 auto 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px;">
          <div style="font-size: 16px; font-weight: 800; line-height: 1;">${endCard.day}</div>
          <div style="font-size: 7px; font-weight: 600; text-transform: uppercase; opacity: 0.9; margin-top: 2px;">${endCard.month.substring(0, 3)}</div>
          <div style="font-size: 7px; opacity: 0.8;">${endCard.year}</div>
        </div>
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">END DATE</div>
      </div>
    </div>
    
    <!-- Countdown Display -->
    <div id="countdown-container" style="border-radius: 20px; padding: 16px; color: white; margin-bottom: 10px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3); transition: all 0.5s ease;">
      <div id="days-left-text" style="font-size: 28px; font-weight: 800; text-align: center; margin-bottom: 12px;">-- days left</div>
      
      <!-- Time Boxes -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 12px;">
        <div style="background: rgba(255,255,255,0.25); border-radius: 10px; padding: 8px 4px; text-align: center;">
          <div id="countdown-days" style="font-size: 20px; font-weight: 800; color: #10b981;">--</div>
          <div style="font-size: 9px; font-weight: 600; text-transform: uppercase; opacity: 0.9; margin-top: 2px;">DAYS</div>
        </div>
        <div style="background: rgba(255,255,255,0.25); border-radius: 10px; padding: 8px 4px; text-align: center;">
          <div id="countdown-hours" style="font-size: 20px; font-weight: 800; color: #10b981;">--</div>
          <div style="font-size: 9px; font-weight: 600; text-transform: uppercase; opacity: 0.9; margin-top: 2px;">HOURS</div>
        </div>
        <div style="background: rgba(255,255,255,0.25); border-radius: 10px; padding: 8px 4px; text-align: center;">
          <div id="countdown-minutes" style="font-size: 20px; font-weight: 800; color: #10b981;">--</div>
          <div style="font-size: 9px; font-weight: 600; text-transform: uppercase; opacity: 0.9; margin-top: 2px;">MINUTES</div>
        </div>
        <div style="background: rgba(255,255,255,0.25); border-radius: 10px; padding: 8px 4px; text-align: center;">
          <div id="countdown-seconds" style="font-size: 20px; font-weight: 800; color: #10b981;">--</div>
          <div style="font-size: 9px; font-weight: 600; text-transform: uppercase; opacity: 0.9; margin-top: 2px;">SECONDS</div>
        </div>
      </div>
      
      <div id="time-message" style="text-align: center; font-size: 14px; font-weight: 600; opacity: 0.95;">You have plenty of time remaining</div>
    </div>
    
    <!-- Email Reminders Section -->
    <div style="background: linear-gradient(135deg, #10b981, #059669); border-radius: 20px; padding: 16px; color: white; margin-bottom: 10px; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3); position: relative; overflow: hidden;">
      ${!isPremium ? `
        <div style="position: absolute; top: 8px; right: 8px; background: #fbbf24; color: #78350f; font-size: 9px; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;">
          Premium
        </div>
      ` : ''}
      
      <div style="text-align: center; margin-bottom: 12px;">
        <div style="font-size: 16px; font-weight: 800; margin-bottom: 4px;">📧 Daily Reminders <span style="font-size: 13px; opacity: 0.9;">(9:00 AM ET)</span></div>
        <div style="font-size: 11px; opacity: 0.9; line-height: 1.4;">
          We'll show a Chrome notification every morning. If you enter an email and connect the mailer, we'll also email you.
        </div>
      </div>
      
      <div id="email-reminder-content">
        ${isPremium ? `
          <div style="display: flex; gap: 6px; margin-bottom: 10px;">
            <input 
              type="email" 
              id="reminder-email-input"
              placeholder="your@email.com"
              style="
                flex: 1;
                padding: 12px;
                border: 0;
                border-radius: 12px;
                background: rgba(255,255,255,0.25);
                color: white;
                font-size: 13px;
                outline: none;
                font-family: inherit;
              "
            />
            <button 
              id="save-email-btn"
              style="
                width: 44px;
                height: 44px;
                border: 0;
                border-radius: 12px;
                background: rgba(255,255,255,0.3);
                color: white;
                font-size: 18px;
                cursor: pointer;
                display: grid;
                place-items: center;
              "
            >→</button>
          </div>
          ${hasSubscribedEmail ? `
          <button 
            id="stop-reminders-btn"
            style="
              width: 100%;
              padding: 12px;
              border: 0;
              border-radius: 12px;
              background: rgba(220, 38, 38, 0.8);
              color: white;
              font-size: 13px;
              font-weight: 700;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              margin-top: 10px;
            "
          >
            <span style="font-size: 14px;">🛑</span> Stop Reminders
          </button>
          ` : ''}
        ` : `
          <div style="text-align: center; padding: 16px;">
            <div style="font-size: 24px; margin-bottom: 8px;">🔒</div>
            <div style="font-size: 13px; font-weight: 700; margin-bottom: 8px;">Unlock Daily Email Reminders</div>
            <div style="font-size: 11px; opacity: 0.9; margin-bottom: 12px;">Get daily email notifications for just $2.99 (lifetime access)</div>
            <button 
              id="upgrade-premium-btn"
              style="
                width: 100%;
                padding: 12px;
                border: 0;
                border-radius: 12px;
                background: linear-gradient(135deg, #fbbf24, #f59e0b);
                color: #78350f;
                font-size: 14px;
                font-weight: 800;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
              "
            >
              Upgrade to Premium - $2.99
            </button>
          </div>
        `}
      </div>
    </div>
    
    <!-- Modify Button -->
    <button 
      id="modify-dates-btn"
      style="
        width: 100%;
        padding: 14px;
        border: 0;
        border-radius: 16px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        font-size: 15px;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      "
    >
      Modify Approval Date
    </button>
  `;
  
  root.appendChild(content);
  
  // Store previous values for flip animation
  let previousValues = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  
  // Update countdown every second with flip animation and dynamic colors
  function updateCountdown() {
    const remaining = calculateTimeRemaining(results.latestEnd);
    
    const daysLeftText = content.querySelector('#days-left-text');
    const daysEl = content.querySelector('#countdown-days') as HTMLElement;
    const hoursEl = content.querySelector('#countdown-hours') as HTMLElement;
    const minutesEl = content.querySelector('#countdown-minutes') as HTMLElement;
    const secondsEl = content.querySelector('#countdown-seconds') as HTMLElement;
    const messageEl = content.querySelector('#time-message');
    const containerEl = content.querySelector('#countdown-container') as HTMLElement;
    
    // Determine color based on days remaining (Apple colors)
    let gradient = '';
    if (remaining.days > 60) {
      gradient = 'linear-gradient(135deg, #34C759, #30D158)'; // Green
    } else if (remaining.days > 30) {
      gradient = 'linear-gradient(135deg, #007AFF, #5AC8FA)'; // Blue
    } else if (remaining.days > 14) {
      gradient = 'linear-gradient(135deg, #FF9500, #FF9F0A)'; // Orange
    } else if (remaining.days > 7) {
      gradient = 'linear-gradient(135deg, #FF9500, #FF3B30)'; // Deep Orange
    } else {
      gradient = 'linear-gradient(135deg, #FF3B30, #FF453A)'; // Red
    }
    
    if (containerEl) containerEl.style.background = gradient;
    
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
    
    if (daysLeftText) daysLeftText.textContent = `${remaining.days} days left`;
    
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
      if (remaining.days > 60) {
        messageEl.textContent = 'You have plenty of time remaining';
      } else if (remaining.days > 30) {
        messageEl.textContent = 'Time is moving along, stay prepared';
      } else if (remaining.days > 14) {
        messageEl.textContent = '⚠️ Getting closer to the deadline!';
      } else if (remaining.days > 7) {
        messageEl.textContent = '⚠️ Less than two weeks remaining!';
      } else {
        messageEl.textContent = '🚨 URGENT: Apply immediately!';
      }
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
            iconUrl: 'icons/icon-128.png',
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
            iconUrl: 'icons/icon-128.png',
            title: 'Invalid Email',
            message: 'Please enter a valid email address'
          });
          return;
        }
        
        // Save email (TODO: API call to save in database)
        console.log('Saving email:', email);
        
        // Show success notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon-128.png',
          title: '✅ Email Saved!',
          message: `Daily reminders will be sent to ${email} at 9:00 AM ET`
        });
        
        // Save email to storage
        await chrome.storage.sync.set({ savedEmail: email });
        
        // Change button to checkmark
        saveEmailBtn.innerHTML = '✅';
        saveEmailBtn.style.background = 'rgba(16, 185, 129, 0.8)';
        
        // Reload page after 2 seconds to show Stop Reminders button
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      });
    }
    
    const stopBtn = content.querySelector('#stop-reminders-btn');
    if (stopBtn) {
      stopBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to stop daily reminders?')) {
          // Clear saved email
          await chrome.storage.sync.remove('savedEmail');
          
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon-128.png',
            title: '🛑 Reminders Stopped',
            message: 'Daily email reminders have been turned off'
          });
          
          // Reload to hide the button
          setTimeout(() => {
            window.location.reload();
          }, 1000);
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
  
  setupPageHandlers(onBack);
}

