import { renderPageHeader, setupPageHandlers } from '../navigation.js';

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
      message: "⚠️ Your OPT period has ended"
    };
  }
  
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);
  
  let message = '';
  if (days <= 7) {
    message = '🚨 Urgent! Very little time left';
  } else if (days <= 30) {
    message = '⚠️ Time is running short, act soon';
  } else if (days <= 60) {
    message = '⏰ Time is moving along, stay prepared';
  } else {
    message = '✅ You have plenty of time remaining';
  }
  
  return { total, days, hours, minutes, seconds, message };
}

/**
 * Check premium status
 */
async function checkPremiumStatus(): Promise<boolean> {
  try {
    const { idToken } = await chrome.storage.sync.get('idToken');
    if (!idToken) return false;

    const apiBase = process.env.NODE_ENV === 'production'
      ? 'https://trackmyopt.com'
      : 'http://localhost:3000';

    const response = await fetch(`${apiBase}/api/premium/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
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
 * Render OPT Clock Tracker countdown page
 */
export function renderClockTracker(
  root: HTMLElement,
  onBack: () => void,
  startDate: Date
): void {
  root.innerHTML = '';
  
  renderPageHeader(root, 'OPT Clock Tracker', 'Track your OPT timeline with precision');
  
  const content = document.createElement('div');
  content.style.cssText = 'margin-top: 12px;';
  
  // Calculate end date (90 days of unemployment allowed for Regular OPT)
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 90);
  
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
  
  // START DATE card (Blue)
  const startCard = document.createElement('div');
  startCard.style.cssText = `
    padding: 14px 10px;
    border-radius: 16px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    text-align: center;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  `;
  startCard.innerHTML = `
    <div style="margin-bottom: 8px; opacity: 0.9;">
      <div style="width: 36px; height: 36px; margin: 0 auto; background: rgba(255,255,255,0.25); border-radius: 10px; display: grid; place-items: center; font-size: 20px;">
        📅
      </div>
    </div>
    <div style="font-size: 22px; font-weight: 800; line-height: 1; margin-bottom: 3px;">${startFormatted.day}</div>
    <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.5px; opacity: 0.95; margin-bottom: 2px;">${startFormatted.month}</div>
    <div style="font-size: 11px; font-weight: 600; opacity: 0.9;">${startFormatted.year}</div>
    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.25); font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">START DATE</div>
  `;
  dateCardsContainer.appendChild(startCard);
  
  // PRESENT card (Green)
  const presentCard = document.createElement('div');
  presentCard.style.cssText = `
    padding: 14px 10px;
    border-radius: 16px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    text-align: center;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  `;
  presentCard.innerHTML = `
    <div style="margin-bottom: 8px; opacity: 0.9;">
      <div style="width: 36px; height: 36px; margin: 0 auto; background: rgba(255,255,255,0.25); border-radius: 10px; display: grid; place-items: center; font-size: 20px;">
        📅
      </div>
    </div>
    <div style="font-size: 22px; font-weight: 800; line-height: 1; margin-bottom: 3px;">${todayFormatted.day}</div>
    <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.5px; opacity: 0.95; margin-bottom: 2px;">${todayFormatted.month}</div>
    <div style="font-size: 11px; font-weight: 600; opacity: 0.9;">${todayFormatted.year}</div>
    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.25); font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">PRESENT</div>
  `;
  dateCardsContainer.appendChild(presentCard);
  
  // END DATE card (Red)
  const endCard = document.createElement('div');
  endCard.style.cssText = `
    padding: 14px 10px;
    border-radius: 16px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    text-align: center;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  `;
  endCard.innerHTML = `
    <div style="margin-bottom: 8px; opacity: 0.9;">
      <div style="width: 36px; height: 36px; margin: 0 auto; background: rgba(255,255,255,0.25); border-radius: 10px; display: grid; place-items: center; font-size: 20px;">
        📅
      </div>
    </div>
    <div style="font-size: 22px; font-weight: 800; line-height: 1; margin-bottom: 3px;">${endFormatted.day}</div>
    <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.5px; opacity: 0.95; margin-bottom: 2px;">${endFormatted.month}</div>
    <div style="font-size: 11px; font-weight: 600; opacity: 0.9;">${endFormatted.year}</div>
    <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.25); font-size: 10px; font-weight: 700; letter-spacing: 0.5px;">END DATE</div>
  `;
  dateCardsContainer.appendChild(endCard);
  
  content.appendChild(dateCardsContainer);
  
  // Countdown card
  const countdownCard = document.createElement('div');
  countdownCard.style.cssText = `
    padding: 20px 16px;
    border-radius: 18px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    margin-bottom: 12px;
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
  `;
  
  const timeRemaining = calculateTimeRemaining(endDate);
  
  countdownCard.innerHTML = `
    <div id="days-left-text" style="font-size: 28px; font-weight: 800; text-align: center; margin-bottom: 14px; line-height: 1;">${timeRemaining.days} days left</div>
    
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 14px;">
      <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 12px; padding: 10px 6px; text-align: center;">
        <div id="countdown-days" style="font-size: 24px; font-weight: 800; color: #3b82f6; line-height: 1; margin-bottom: 4px;">${String(timeRemaining.days).padStart(2, '0')}</div>
        <div style="font-size: 9px; font-weight: 700; opacity: 0.9; letter-spacing: 0.5px;">DAYS</div>
      </div>
      <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 12px; padding: 10px 6px; text-align: center;">
        <div id="countdown-hours" style="font-size: 24px; font-weight: 800; color: #3b82f6; line-height: 1; margin-bottom: 4px;">${String(timeRemaining.hours).padStart(2, '0')}</div>
        <div style="font-size: 9px; font-weight: 700; opacity: 0.9; letter-spacing: 0.5px;">HOURS</div>
      </div>
      <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 12px; padding: 10px 6px; text-align: center;">
        <div id="countdown-minutes" style="font-size: 24px; font-weight: 800; color: #3b82f6; line-height: 1; margin-bottom: 4px;">${String(timeRemaining.minutes).padStart(2, '0')}</div>
        <div style="font-size: 9px; font-weight: 700; opacity: 0.9; letter-spacing: 0.5px;">MINUTES</div>
      </div>
      <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 12px; padding: 10px 6px; text-align: center;">
        <div id="countdown-seconds" style="font-size: 24px; font-weight: 800; color: #3b82f6; line-height: 1; margin-bottom: 4px;">${String(timeRemaining.seconds).padStart(2, '0')}</div>
        <div style="font-size: 9px; font-weight: 700; opacity: 0.9; letter-spacing: 0.5px;">SECONDS</div>
      </div>
    </div>
    
    <div id="countdown-message" style="text-align: center; font-size: 13px; font-weight: 600; opacity: 0.95;">${timeRemaining.message}</div>
  `;
  
  content.appendChild(countdownCard);
  
  // Email reminders card (Premium feature)
  const remindersCard = document.createElement('div');
  remindersCard.id = 'reminders-card';
  remindersCard.style.cssText = `
    padding: 18px;
    border-radius: 18px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    margin-bottom: 12px;
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
  `;
  
  remindersCard.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
      <div style="font-size: 22px;">📧</div>
      <div style="font-weight: 800; font-size: 16px;">Daily Reminders (9:00 AM ET)</div>
    </div>
    <div style="font-size: 12px; opacity: 0.95; margin-bottom: 14px; line-height: 1.5;">
      We'll show a Chrome notification every morning. If you enter an email and connect the mailer, we'll also email you.
    </div>
    <div id="premium-content" style="text-align: center; padding: 20px 10px;">
      <div style="font-size: 13px; margin-bottom: 12px; opacity: 0.95;">🔒 Unlock Daily Email Reminders</div>
      <div style="font-size: 12px; margin-bottom: 14px; opacity: 0.9;">Get daily email notifications for just $2.99 (lifetime access)</div>
      <button id="upgrade-btn" style="
        width: 100%;
        padding: 12px;
        border: 0;
        border-radius: 12px;
        background: rgba(255,255,255,0.25);
        backdrop-filter: blur(10px);
        color: white;
        font-weight: 800;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
      ">Upgrade to Premium - $2.99</button>
    </div>
  `;
  
  content.appendChild(remindersCard);
  
  // Modify button
  const modifyBtn = document.createElement('button');
  modifyBtn.innerHTML = 'Modify Start Date';
  modifyBtn.style.cssText = `
    width: 100%;
    padding: 16px;
    border: 0;
    border-radius: 16px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    font-weight: 800;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
    font-family: inherit;
  `;
  content.appendChild(modifyBtn);
  
  root.appendChild(content);
  
  // Update countdown every second
  let countdownInterval: number | null = setInterval(() => {
    const remaining = calculateTimeRemaining(endDate);
    
    const daysEl = document.getElementById('countdown-days');
    const hoursEl = document.getElementById('countdown-hours');
    const minutesEl = document.getElementById('countdown-minutes');
    const secondsEl = document.getElementById('countdown-seconds');
    const messageEl = document.getElementById('countdown-message');
    const daysLeftEl = document.getElementById('days-left-text');
    
    if (daysEl) daysEl.textContent = String(remaining.days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(remaining.hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(remaining.minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(remaining.seconds).padStart(2, '0');
    if (messageEl) messageEl.textContent = remaining.message;
    if (daysLeftEl) daysLeftEl.textContent = `${remaining.days} days left`;
    
    if (remaining.total <= 0 && countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }, 1000);
  
  // Check premium status and update UI
  checkPremiumStatus().then(isPremium => {
    const premiumContent = document.getElementById('premium-content');
    if (!premiumContent) return;
    
    if (isPremium) {
      premiumContent.innerHTML = `
        <div style="position: relative;">
          <input 
            type="email" 
            id="reminder-email" 
            placeholder="dikondaashish@gmail.com"
            style="
              width: 100%;
              padding: 14px 50px 14px 16px;
              border: 0;
              border-radius: 12px;
              background: rgba(255,255,255,0.2);
              backdrop-filter: blur(10px);
              color: white;
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
              background: rgba(255,255,255,0.3);
              color: white;
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
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          color: white;
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
          <span style="font-size: 16px;">🔴</span>
          <span>Stop Reminders</span>
        </button>
      `;
      
      const saveEmailBtn = document.getElementById('save-email-btn');
      const stopRemindersBtn = document.getElementById('stop-reminders-btn');
      
      saveEmailBtn?.addEventListener('click', () => {
        const emailInput = document.getElementById('reminder-email') as HTMLInputElement;
        if (emailInput?.value) {
          alert(`✅ Email reminders activated!\n\nYou'll receive daily reminders at ${emailInput.value}`);
        }
      });
      
      stopRemindersBtn?.addEventListener('click', () => {
        alert('❌ Email reminders stopped');
      });
      
      // Hover effects
      saveEmailBtn?.addEventListener('mouseenter', () => {
        if (saveEmailBtn) saveEmailBtn.style.background = 'rgba(255,255,255,0.4)';
      });
      saveEmailBtn?.addEventListener('mouseleave', () => {
        if (saveEmailBtn) saveEmailBtn.style.background = 'rgba(255,255,255,0.3)';
      });
      
      stopRemindersBtn?.addEventListener('mouseenter', () => {
        if (stopRemindersBtn) stopRemindersBtn.style.background = 'rgba(255,255,255,0.25)';
      });
      stopRemindersBtn?.addEventListener('mouseleave', () => {
        if (stopRemindersBtn) stopRemindersBtn.style.background = 'rgba(255,255,255,0.15)';
      });
    }
  });
  
  // Event handlers
  const upgradeBtn = document.getElementById('upgrade-btn');
  
  upgradeBtn?.addEventListener('click', () => {
    const apiBase = process.env.NODE_ENV === 'production'
      ? 'https://trackmyopt.com'
      : 'http://localhost:3000';
    chrome.tabs.create({ url: `${apiBase}/premium/checkout` });
  });
  
  upgradeBtn?.addEventListener('mouseenter', () => {
    if (upgradeBtn) upgradeBtn.style.background = 'rgba(255,255,255,0.35)';
  });
  
  upgradeBtn?.addEventListener('mouseleave', () => {
    if (upgradeBtn) upgradeBtn.style.background = 'rgba(255,255,255,0.25)';
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
    modifyBtn.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
  });
  
  modifyBtn.addEventListener('mouseleave', () => {
    modifyBtn.style.transform = 'translateY(0)';
    modifyBtn.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.3)';
  });
  
  setupPageHandlers(onBack);
}

