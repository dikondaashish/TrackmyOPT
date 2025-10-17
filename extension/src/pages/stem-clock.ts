import { renderPageHeader, setupPageHandlers } from '../navigation.js';

/**
 * Format date to mm/dd/yyyy
 */
function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Get month name
 */
function getMonthName(month: number): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return months[month];
}

/**
 * Get days in month
 */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get first day of month (0 = Sunday, 6 = Saturday)
 */
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/**
 * Create date picker calendar
 */
function createDatePicker(
  inputId: string, 
  onSelect: (date: Date) => void
): HTMLElement {
  const today = new Date();
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth();
  
  const picker = document.createElement('div');
  picker.style.cssText = `
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 8px;
    background: white;
    border-radius: 14px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    padding: 14px;
    z-index: 1000;
    animation: slideDown 0.2s ease;
  `;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
  
  function renderCalendar() {
    picker.innerHTML = '';
    
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    `;
    
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '↑';
    prevBtn.style.cssText = `
      width: 32px;
      height: 32px;
      border: 0;
      border-radius: 8px;
      background: #f3f4f6;
      color: #374151;
      cursor: pointer;
      font-size: 18px;
      font-weight: 700;
      transition: all 0.2s;
    `;
    prevBtn.addEventListener('mouseenter', () => { prevBtn.style.background = '#e5e7eb'; });
    prevBtn.addEventListener('mouseleave', () => { prevBtn.style.background = '#f3f4f6'; });
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentMonth--;
      if (currentMonth < 0) { currentMonth = 11; currentYear--; }
      renderCalendar();
    });
    
    const monthYear = document.createElement('div');
    monthYear.style.cssText = `font-weight: 700; font-size: 14px; color: #111827;`;
    monthYear.innerHTML = `${getMonthName(currentMonth)} ${currentYear} <span style="font-size: 12px; color: #6b7280;">▼</span>`;
    
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '↓';
    nextBtn.style.cssText = `
      width: 32px;
      height: 32px;
      border: 0;
      border-radius: 8px;
      background: #f3f4f6;
      color: #374151;
      cursor: pointer;
      font-size: 18px;
      font-weight: 700;
      transition: all 0.2s;
    `;
    nextBtn.addEventListener('mouseenter', () => { nextBtn.style.background = '#e5e7eb'; });
    nextBtn.addEventListener('mouseleave', () => { nextBtn.style.background = '#f3f4f6'; });
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentMonth++;
      if (currentMonth > 11) { currentMonth = 0; currentYear++; }
      renderCalendar();
    });
    
    header.appendChild(prevBtn);
    header.appendChild(monthYear);
    header.appendChild(nextBtn);
    picker.appendChild(header);
    
    const dayHeaders = document.createElement('div');
    dayHeaders.style.cssText = `display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 8px;`;
    
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.textContent = day;
      dayHeader.style.cssText = `text-align: center; font-size: 11px; font-weight: 700; color: #6b7280; padding: 4px 0;`;
      dayHeaders.appendChild(dayHeader);
    });
    picker.appendChild(dayHeaders);
    
    const daysGrid = document.createElement('div');
    daysGrid.style.cssText = `display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;`;
    
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const prevMonthDays = currentMonth === 0 ? getDaysInMonth(currentYear - 1, 11) : getDaysInMonth(currentYear, currentMonth - 1);
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayBtn = document.createElement('button');
      dayBtn.textContent = String(prevMonthDays - i);
      dayBtn.style.cssText = `width: 100%; aspect-ratio: 1; border: 0; border-radius: 8px; background: transparent; color: #d1d5db; font-size: 12px; cursor: pointer;`;
      daysGrid.appendChild(dayBtn);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayBtn = document.createElement('button');
      dayBtn.textContent = String(day);
      
      const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
      
      dayBtn.style.cssText = `
        width: 100%; aspect-ratio: 1; border: 0; border-radius: 8px;
        background: ${isToday ? '#f97316' : 'transparent'};
        color: ${isToday ? 'white' : '#111827'};
        font-size: 12px; font-weight: ${isToday ? '700' : '500'};
        cursor: pointer; transition: all 0.15s;
      `;
      
      dayBtn.addEventListener('mouseenter', () => { if (!isToday) dayBtn.style.background = '#f3f4f6'; });
      dayBtn.addEventListener('mouseleave', () => { if (!isToday) dayBtn.style.background = 'transparent'; });
      
      const selectedDate = new Date(currentYear, currentMonth, day);
      dayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelect(selectedDate);
        picker.remove();
      });
      
      daysGrid.appendChild(dayBtn);
    }
    
    const remainingCells = 42 - (firstDay + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
      const dayBtn = document.createElement('button');
      dayBtn.textContent = String(i);
      dayBtn.style.cssText = `width: 100%; aspect-ratio: 1; border: 0; border-radius: 8px; background: transparent; color: #d1d5db; font-size: 12px; cursor: pointer;`;
      daysGrid.appendChild(dayBtn);
    }
    
    picker.appendChild(daysGrid);
    
    const footer = document.createElement('div');
    footer.style.cssText = `display: flex; justify-content: space-between; margin-top: 12px; padding-top: 10px; border-top: 1px solid #e5e7eb;`;
    
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.style.cssText = `padding: 6px 12px; border: 0; border-radius: 6px; background: transparent; color: #f97316; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;`;
    clearBtn.addEventListener('mouseenter', () => { clearBtn.style.background = '#fff7ed'; });
    clearBtn.addEventListener('mouseleave', () => { clearBtn.style.background = 'transparent'; });
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const input = document.getElementById(inputId) as HTMLInputElement;
      if (input) input.value = '';
      picker.remove();
    });
    
    const todayBtn = document.createElement('button');
    todayBtn.textContent = 'Today';
    todayBtn.style.cssText = `padding: 6px 12px; border: 0; border-radius: 6px; background: transparent; color: #f97316; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;`;
    todayBtn.addEventListener('mouseenter', () => { todayBtn.style.background = '#fff7ed'; });
    todayBtn.addEventListener('mouseleave', () => { todayBtn.style.background = 'transparent'; });
    todayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onSelect(today);
      picker.remove();
    });
    
    footer.appendChild(clearBtn);
    footer.appendChild(todayBtn);
    picker.appendChild(footer);
  }
  
  renderCalendar();
  return picker;
}

/**
 * Parse mm/dd/yyyy to Date
 */
function parseDate(dateStr: string): Date | null {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const month = parseInt(parts[0], 10) - 1;
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  return date;
}

/**
 * Get API base URL
 */
function getApiBaseUrl(): string {
  return process.env.NODE_ENV === 'production'
    ? 'https://trackmyopt.com'
    : 'http://localhost:3000';
}

/**
 * Load saved OPT data from API
 */
async function loadSavedData(): Promise<any> {
  try {
    const { idToken } = await chrome.storage.sync.get('idToken');
    if (!idToken) return null;

    const response = await fetch(`${getApiBaseUrl()}/api/opt/calculator`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return null;
    
    const result = await response.json();
    return result.ok ? result.data : null;
  } catch (error) {
    console.error('Error loading saved data:', error);
    return null;
  }
}

/**
 * Render STEM OPT Clock Tracker page
 */
export function renderStemClock(root: HTMLElement, onBack: () => void): void {
  root.innerHTML = '';
  
  renderPageHeader(root, 'STEM OPT Clock Tracker', 'Track your STEM OPT timeline with precision');
  
  const content = document.createElement('div');
  content.style.cssText = 'margin-top: 12px;';
  
  // STEM EAD Start Date card (Orange)
  const startDateCard = document.createElement('div');
  startDateCard.style.cssText = `
    padding: 14px;
    border-radius: 16px;
    background: linear-gradient(135deg, #f97316, #ea580c);
    color: white;
    margin-bottom: 10px;
    box-shadow: 0 4px 16px rgba(249, 115, 22, 0.3);
    position: relative;
  `;
  startDateCard.innerHTML = `
    <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
      <div style="flex-shrink: 0; width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.2); display: grid; place-items: center; font-size: 20px;">
        📅
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 700; font-size: 15px;">STEM EAD Start Date</div>
      </div>
    </div>
    <div style="position: relative;">
      <input 
        type="text" 
        id="stem-ead-start-date" 
        placeholder="10/01/2025"
        style="
          width: 100%;
          padding: 12px 46px 12px 14px;
          border: 0;
          border-radius: 10px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          color: white;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          font-family: inherit;
        "
      />
      <button 
        id="stem-start-date-picker-btn"
        style="
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          border: 0;
          border-radius: 8px;
          background: rgba(255,255,255,0.25);
          color: white;
          cursor: pointer;
          font-size: 16px;
          display: grid;
          place-items: center;
          transition: all 0.2s;
        "
      >📅</button>
    </div>
  `;
  content.appendChild(startDateCard);
  
  // STEM OPT Days Info card (Green)
  const optDaysCard = document.createElement('div');
  optDaysCard.style.cssText = `
    padding: 18px;
    border-radius: 16px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
    margin-bottom: 10px;
    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
    text-align: center;
  `;
  optDaysCard.innerHTML = `
    <div style="font-size: 56px; font-weight: 800; line-height: 1; margin-bottom: 6px;">60</div>
    <div style="font-size: 14px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 4px;">TOTAL UNEMPLOYMENT DAYS</div>
    <div style="font-size: 11px; opacity: 0.95;">60 days for STEM OPT</div>
  `;
  content.appendChild(optDaysCard);
  
  // Ready message (Blue)
  const readyMessage = document.createElement('div');
  readyMessage.style.cssText = `
    padding: 14px;
    border-radius: 14px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    margin-bottom: 10px;
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
    text-align: center;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.3;
  `;
  readyMessage.textContent = 'Ready to track your STEM OPT unemployment period!';
  content.appendChild(readyMessage);
  
  // Save & Go button (Orange)
  const saveBtn = document.createElement('button');
  saveBtn.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
      <span style="font-size: 18px;">💾</span>
      <span>Save & Go</span>
    </div>
  `;
  saveBtn.style.cssText = `
    width: 100%;
    padding: 14px;
    border: 0;
    border-radius: 14px;
    background: linear-gradient(135deg, #f97316, #ea580c);
    color: white;
    font-weight: 800;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 16px rgba(249, 115, 22, 0.3);
    font-family: inherit;
  `;
  content.appendChild(saveBtn);
  
  root.appendChild(content);
  
  // Date picker event handlers
  const startDatePickerBtn = document.getElementById('stem-start-date-picker-btn');
  
  let activePicker: HTMLElement | null = null;
  
  document.addEventListener('click', (e) => {
    if (activePicker && !activePicker.contains(e.target as Node)) {
      const isPickerButton = startDatePickerBtn?.contains(e.target as Node);
      if (!isPickerButton) {
        activePicker.remove();
        activePicker = null;
      }
    }
  });
  
  startDatePickerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    
    if (activePicker) {
      activePicker.remove();
      activePicker = null;
    }
    
    const picker = createDatePicker('stem-ead-start-date', (date) => {
      const input = document.getElementById('stem-ead-start-date') as HTMLInputElement;
      if (input) {
        input.value = formatDate(date);
      }
      activePicker = null;
    });
    
    const container = startDatePickerBtn.closest('div[style*="position: relative"]');
    if (container) {
      container.appendChild(picker);
      activePicker = picker;
    }
  });
  
  // Hover effect for calendar button
  if (startDatePickerBtn) {
    startDatePickerBtn.addEventListener('mouseenter', () => {
      startDatePickerBtn.style.background = 'rgba(255,255,255,0.35)';
    });
    startDatePickerBtn.addEventListener('mouseleave', () => {
      startDatePickerBtn.style.background = 'rgba(255,255,255,0.25)';
    });
  }
  
  // Event handlers
  saveBtn.addEventListener('click', async () => {
    const startDateInput = document.getElementById('stem-ead-start-date') as HTMLInputElement;
    
    const stemEadStartDate = parseDate(startDateInput.value);
    if (!stemEadStartDate) {
      alert('❌ Please enter a valid STEM EAD Start Date (mm/dd/yyyy)');
      return;
    }
    
    // Navigate to STEM clock tracker page
    const { renderStemClockTracker } = await import('./stem-clock-tracker.js');
    renderStemClockTracker(root, onBack, stemEadStartDate);
  });
  
  // Input styling on focus
  const startDateInput = document.getElementById('stem-ead-start-date') as HTMLInputElement;
  
  if (startDateInput) {
    startDateInput.addEventListener('focus', (e) => {
      (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.3)';
    });
    startDateInput.addEventListener('blur', (e) => {
      (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.2)';
    });
  }
  
  saveBtn.addEventListener('mouseenter', () => {
    saveBtn.style.transform = 'translateY(-2px)';
    saveBtn.style.boxShadow = '0 8px 24px rgba(249, 115, 22, 0.4)';
  });
  
  saveBtn.addEventListener('mouseleave', () => {
    saveBtn.style.transform = 'translateY(0)';
    saveBtn.style.boxShadow = '0 6px 20px rgba(249, 115, 22, 0.3)';
  });
  
  // Load saved data on page load
  loadSavedData().then(savedData => {
    if (savedData && startDateInput && savedData.opt_start_date) {
      startDateInput.value = savedData.opt_start_date;
      console.log('✅ Loaded saved STEM EAD start date');
    }
  });
  
  setupPageHandlers(onBack);
}

