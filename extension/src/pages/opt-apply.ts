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
  
  // Add animation
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
    
    // Header with month/year and navigation
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
    prevBtn.addEventListener('mouseenter', () => {
      prevBtn.style.background = '#e5e7eb';
    });
    prevBtn.addEventListener('mouseleave', () => {
      prevBtn.style.background = '#f3f4f6';
    });
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar();
    });
    
    const monthYear = document.createElement('div');
    monthYear.style.cssText = `
      font-weight: 700;
      font-size: 14px;
      color: #111827;
    `;
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
    nextBtn.addEventListener('mouseenter', () => {
      nextBtn.style.background = '#e5e7eb';
    });
    nextBtn.addEventListener('mouseleave', () => {
      nextBtn.style.background = '#f3f4f6';
    });
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar();
    });
    
    header.appendChild(prevBtn);
    header.appendChild(monthYear);
    header.appendChild(nextBtn);
    picker.appendChild(header);
    
    // Day headers
    const dayHeaders = document.createElement('div');
    dayHeaders.style.cssText = `
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      margin-bottom: 8px;
    `;
    
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.textContent = day;
      dayHeader.style.cssText = `
        text-align: center;
        font-size: 11px;
        font-weight: 700;
        color: #6b7280;
        padding: 4px 0;
      `;
      dayHeaders.appendChild(dayHeader);
    });
    picker.appendChild(dayHeaders);
    
    // Days grid
    const daysGrid = document.createElement('div');
    daysGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
    `;
    
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const prevMonthDays = currentMonth === 0 
      ? getDaysInMonth(currentYear - 1, 11) 
      : getDaysInMonth(currentYear, currentMonth - 1);
    
    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayBtn = document.createElement('button');
      dayBtn.textContent = String(prevMonthDays - i);
      dayBtn.style.cssText = `
        width: 100%;
        aspect-ratio: 1;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: #d1d5db;
        font-size: 12px;
        cursor: pointer;
      `;
      daysGrid.appendChild(dayBtn);
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayBtn = document.createElement('button');
      dayBtn.textContent = String(day);
      
      const isToday = 
        day === today.getDate() && 
        currentMonth === today.getMonth() && 
        currentYear === today.getFullYear();
      
      dayBtn.style.cssText = `
        width: 100%;
        aspect-ratio: 1;
        border: 0;
        border-radius: 8px;
        background: ${isToday ? '#3b82f6' : 'transparent'};
        color: ${isToday ? 'white' : '#111827'};
        font-size: 12px;
        font-weight: ${isToday ? '700' : '500'};
        cursor: pointer;
        transition: all 0.15s;
      `;
      
      dayBtn.addEventListener('mouseenter', () => {
        if (!isToday) {
          dayBtn.style.background = '#f3f4f6';
        }
      });
      
      dayBtn.addEventListener('mouseleave', () => {
        if (!isToday) {
          dayBtn.style.background = 'transparent';
        }
      });
      
      const selectedDate = new Date(currentYear, currentMonth, day);
      dayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelect(selectedDate);
        picker.remove();
      });
      
      daysGrid.appendChild(dayBtn);
    }
    
    // Next month's leading days
    const remainingCells = 42 - (firstDay + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
      const dayBtn = document.createElement('button');
      dayBtn.textContent = String(i);
      dayBtn.style.cssText = `
        width: 100%;
        aspect-ratio: 1;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: #d1d5db;
        font-size: 12px;
        cursor: pointer;
      `;
      daysGrid.appendChild(dayBtn);
    }
    
    picker.appendChild(daysGrid);
    
    // Footer with Clear and Today buttons
    const footer = document.createElement('div');
    footer.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid #e5e7eb;
    `;
    
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.style.cssText = `
      padding: 6px 12px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: #3b82f6;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    clearBtn.addEventListener('mouseenter', () => {
      clearBtn.style.background = '#eff6ff';
    });
    clearBtn.addEventListener('mouseleave', () => {
      clearBtn.style.background = 'transparent';
    });
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const input = document.getElementById(inputId) as HTMLInputElement;
      if (input) input.value = '';
      picker.remove();
    });
    
    const todayBtn = document.createElement('button');
    todayBtn.textContent = 'Today';
    todayBtn.style.cssText = `
      padding: 6px 12px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: #3b82f6;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    todayBtn.addEventListener('mouseenter', () => {
      todayBtn.style.background = '#eff6ff';
    });
    todayBtn.addEventListener('mouseleave', () => {
      todayBtn.style.background = 'transparent';
    });
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
 * Add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Calculate filing window
 */
function calculateFilingWindow(programEndDate: Date, dsoRecommendationDate: Date | null) {
  const earliestStart = addDays(programEndDate, -90);
  const latestEnd = addDays(programEndDate, 60);
  
  let uscisDeadline: Date | null = null;
  if (dsoRecommendationDate) {
    uscisDeadline = addDays(dsoRecommendationDate, 30);
  }
  
  return {
    earliestStart,
    latestEnd,
    uscisDeadline,
    programEndDate
  };
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
 * Save OPT data to API
 */
async function saveDatesToAPI(
  programEndDate: string | null,
  dsoRecommendationDate: string | null
): Promise<boolean> {
  try {
    const { idToken } = await chrome.storage.sync.get('idToken');
    if (!idToken) {
      console.log('No auth token, skipping save');
      return false;
    }

    const response = await fetch(`${getApiBaseUrl()}/api/opt/calculator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        program_end_date: programEndDate,
        dso_recommendation_date: dsoRecommendationDate,
      }),
    });

    const result = await response.json();
    if (result.ok) {
      console.log('✅ Dates saved successfully');
      return true;
    } else {
      console.error('Failed to save dates:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Error saving dates:', error);
    return false;
  }
}

/**
 * Render OPT Apply Start Dates page
 */
export function renderOptApply(root: HTMLElement, onBack: () => void): void {
  root.innerHTML = '';
  
  renderPageHeader(root, 'OPT Apply Dates', 'Calculate your OPT filing window');
  
  const content = document.createElement('div');
  content.style.cssText = 'margin-top: 12px;';
  
  // Info card
  const infoCard = document.createElement('div');
  infoCard.style.cssText = `
    padding: 14px;
    border-radius: 14px;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    color: white;
    margin-bottom: 12px;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  `;
  infoCard.innerHTML = `
    <div style="display: flex; gap: 10px; align-items: start;">
      <div style="flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.2); display: grid; place-items: center; font-size: 16px;">
        ℹ️
      </div>
      <div>
        <div style="font-weight: 700; font-size: 13px; margin-bottom: 6px;">Post-Completion OPT Filing Rules</div>
        <div style="font-size: 12px; line-height: 1.5; opacity: 0.95;">
          You can apply 90 days before your program ends, up to 60 days after. USCIS must receive your I-765 within 30 days of your DSO's recommendation.
        </div>
      </div>
    </div>
  `;
  content.appendChild(infoCard);
  
  // Program End Date card
  const programCard = document.createElement('div');
  programCard.style.cssText = `
    padding: 14px;
    border-radius: 14px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    margin-bottom: 12px;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    position: relative;
  `;
  programCard.innerHTML = `
    <div style="display: flex; gap: 10px; align-items: start; margin-bottom: 10px;">
      <div style="flex-shrink: 0; width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.2); display: grid; place-items: center; font-size: 18px;">
        📅
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">Program End Date</div>
        <div style="font-size: 11px; opacity: 0.9;">From your I-20</div>
      </div>
    </div>
    <div style="position: relative;">
      <input 
        type="text" 
        id="program-end-date" 
        placeholder="mm/dd/yyyy"
        style="
          width: 100%;
          padding: 10px 40px 10px 12px;
          border: 0;
          border-radius: 10px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          color: white;
          font-size: 14px;
          outline: none;
          font-family: inherit;
        "
      />
      <button 
        id="program-date-picker-btn"
        style="
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          border: 0;
          border-radius: 8px;
          background: rgba(255,255,255,0.2);
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
  content.appendChild(programCard);
  
  // DSO Recommendation Date card
  const dsoCard = document.createElement('div');
  dsoCard.style.cssText = `
    padding: 14px;
    border-radius: 14px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    margin-bottom: 12px;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
    position: relative;
  `;
  dsoCard.innerHTML = `
    <div style="display: flex; gap: 10px; align-items: start; margin-bottom: 10px;">
      <div style="flex-shrink: 0; width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.2); display: grid; place-items: center; font-size: 18px;">
        📅
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">DSO Recommendation Date</div>
        <div style="font-size: 11px; opacity: 0.9;">Optional - When DSO signed your I-20</div>
      </div>
    </div>
    <div style="position: relative;">
      <input 
        type="text" 
        id="dso-recommendation-date" 
        placeholder="mm/dd/yyyy"
        style="
          width: 100%;
          padding: 10px 40px 10px 12px;
          border: 0;
          border-radius: 10px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          color: white;
          font-size: 14px;
          outline: none;
          font-family: inherit;
        "
      />
      <button 
        id="dso-date-picker-btn"
        style="
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          border: 0;
          border-radius: 8px;
          background: rgba(255,255,255,0.2);
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
  content.appendChild(dsoCard);
  
  // Calculate button
  const calculateBtn = document.createElement('button');
  calculateBtn.textContent = 'Calculate Filing Window';
  calculateBtn.style.cssText = `
    width: 100%;
    padding: 14px;
    border: 0;
    border-radius: 12px;
    background: linear-gradient(135deg, #374151, #1f2937);
    color: white;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-family: inherit;
  `;
  content.appendChild(calculateBtn);
  
  // Results container
  const resultsContainer = document.createElement('div');
  resultsContainer.id = 'results-container';
  resultsContainer.style.cssText = 'margin-top: 12px;';
  content.appendChild(resultsContainer);
  
  root.appendChild(content);
  
  // Date picker event handlers
  const programDatePickerBtn = document.getElementById('program-date-picker-btn');
  const dsoDatePickerBtn = document.getElementById('dso-date-picker-btn');
  
  let activePicker: HTMLElement | null = null;
  
  // Close picker when clicking outside
  document.addEventListener('click', (e) => {
    if (activePicker && !activePicker.contains(e.target as Node)) {
      const pickerButtons = [programDatePickerBtn, dsoDatePickerBtn];
      const isPickerButton = pickerButtons.some(btn => btn?.contains(e.target as Node));
      if (!isPickerButton) {
        activePicker.remove();
        activePicker = null;
      }
    }
  });
  
  programDatePickerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Close any existing picker
    if (activePicker) {
      activePicker.remove();
      activePicker = null;
    }
    
    const picker = createDatePicker('program-end-date', (date) => {
      const input = document.getElementById('program-end-date') as HTMLInputElement;
      if (input) {
        input.value = formatDate(date);
      }
      activePicker = null;
    });
    
    const container = programDatePickerBtn.closest('div[style*="position: relative"]');
    if (container) {
      container.appendChild(picker);
      activePicker = picker;
    }
  });
  
  dsoDatePickerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Close any existing picker
    if (activePicker) {
      activePicker.remove();
      activePicker = null;
    }
    
    const picker = createDatePicker('dso-recommendation-date', (date) => {
      const input = document.getElementById('dso-recommendation-date') as HTMLInputElement;
      if (input) {
        input.value = formatDate(date);
      }
      activePicker = null;
    });
    
    const container = dsoDatePickerBtn.closest('div[style*="position: relative"]');
    if (container) {
      container.appendChild(picker);
      activePicker = picker;
    }
  });
  
  // Hover effects for calendar buttons
  [programDatePickerBtn, dsoDatePickerBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(255,255,255,0.3)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'rgba(255,255,255,0.2)';
      });
    }
  });
  
  // Auto-save dates when they change
  const autoSaveDates = () => {
    const programEndInput = document.getElementById('program-end-date') as HTMLInputElement;
    const dsoRecommendationInput = document.getElementById('dso-recommendation-date') as HTMLInputElement;
    
    const programEnd = programEndInput.value.trim();
    const dsoRec = dsoRecommendationInput.value.trim();
    
    // Only save if program end date is valid
    if (programEnd && parseDate(programEnd)) {
      saveDatesToAPI(programEnd, dsoRec || null);
    }
  };

  // Event handlers
  calculateBtn.addEventListener('click', async () => {
    const programEndInput = document.getElementById('program-end-date') as HTMLInputElement;
    const dsoRecommendationInput = document.getElementById('dso-recommendation-date') as HTMLInputElement;
    
    const programEndDate = parseDate(programEndInput.value);
    if (!programEndDate) {
      resultsContainer.innerHTML = `
        <div style="padding: 12px; border-radius: 12px; background: #fef2f2; color: #991b1b; font-size: 13px; border: 1px solid #fecaca;">
          ❌ Please enter a valid Program End Date (mm/dd/yyyy)
        </div>
      `;
      return;
    }
    
    const dsoRecommendationDate = dsoRecommendationInput.value.trim() 
      ? parseDate(dsoRecommendationInput.value) 
      : null;
    
    if (dsoRecommendationInput.value.trim() && !dsoRecommendationDate) {
      resultsContainer.innerHTML = `
        <div style="padding: 12px; border-radius: 12px; background: #fef2f2; color: #991b1b; font-size: 13px; border: 1px solid #fecaca;">
          ❌ Please enter a valid DSO Recommendation Date (mm/dd/yyyy)
        </div>
      `;
      return;
    }
    
    // Save dates to database
    await saveDatesToAPI(
      programEndInput.value.trim(),
      dsoRecommendationInput.value.trim() || null
    );
    
    const results = calculateFilingWindow(programEndDate, dsoRecommendationDate);
    
    resultsContainer.innerHTML = `
      <div style="padding: 14px; border-radius: 14px; background: linear-gradient(135deg, #d1fae5, #a7f3d0); border: 1px solid #6ee7b7; margin-bottom: 8px;">
        <div style="font-weight: 700; font-size: 13px; color: #065f46; margin-bottom: 8px;">✅ Your Filing Window</div>
        <div style="color: #047857; font-size: 12px; line-height: 1.6;">
          <div style="margin-bottom: 6px;">
            <strong>Earliest you can apply:</strong><br/>
            ${formatDate(results.earliestStart)}
            <span style="opacity: 0.8;">(90 days before program ends)</span>
          </div>
          <div>
            <strong>Latest you can apply:</strong><br/>
            ${formatDate(results.latestEnd)}
            <span style="opacity: 0.8;">(60 days after program ends)</span>
          </div>
        </div>
      </div>
      ${results.uscisDeadline ? `
        <div style="padding: 14px; border-radius: 14px; background: linear-gradient(135deg, #fef3c7, #fde68a); border: 1px solid #fbbf24;">
          <div style="font-weight: 700; font-size: 13px; color: #92400e; margin-bottom: 6px;">⚠️ USCIS Deadline</div>
          <div style="color: #b45309; font-size: 12px; line-height: 1.6;">
            USCIS must receive your I-765 by:<br/>
            <strong>${formatDate(results.uscisDeadline)}</strong>
            <div style="opacity: 0.9; margin-top: 4px;">(30 days from DSO recommendation)</div>
          </div>
        </div>
      ` : ''}
      <div style="padding: 12px; border-radius: 12px; background: rgba(147, 197, 253, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); margin-top: 8px;">
        <div style="font-size: 11px; color: #1e40af; line-height: 1.5;">
          💡 <strong>Tip:</strong> Apply as early as possible within your window. USCIS processing can take 3-5 months.
        </div>
      </div>
    `;
  });
  
  // Input styling on focus (for both light and dark mode)
  const inputs = [
    document.getElementById('program-end-date'),
    document.getElementById('dso-recommendation-date')
  ];
  
  inputs.forEach(input => {
    if (input) {
      input.addEventListener('focus', (e) => {
        (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.25)';
      });
      input.addEventListener('blur', (e) => {
        (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.15)';
      });
    }
  });
  
  calculateBtn.addEventListener('mouseenter', () => {
    calculateBtn.style.transform = 'translateY(-1px)';
    calculateBtn.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
  });
  
  calculateBtn.addEventListener('mouseleave', () => {
    calculateBtn.style.transform = 'translateY(0)';
    calculateBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  });
  
  // Add blur event listeners to auto-save when user finishes entering dates
  const programEndInput = document.getElementById('program-end-date') as HTMLInputElement;
  const dsoRecommendationInput = document.getElementById('dso-recommendation-date') as HTMLInputElement;
  
  if (programEndInput) {
    programEndInput.addEventListener('blur', () => {
      // Delay to allow calendar selection to complete
      setTimeout(autoSaveDates, 300);
    });
  }
  
  if (dsoRecommendationInput) {
    dsoRecommendationInput.addEventListener('blur', () => {
      setTimeout(autoSaveDates, 300);
    });
  }
  
  // Load saved data on page load
  loadSavedData().then(savedData => {
    if (savedData && programEndInput) {
      if (savedData.program_end_date) {
        programEndInput.value = savedData.program_end_date;
      }
      if (savedData.dso_recommendation_date && dsoRecommendationInput) {
        dsoRecommendationInput.value = savedData.dso_recommendation_date;
      }
      
      console.log('✅ Loaded saved OPT dates');
    }
  });
  
  setupPageHandlers(onBack);
}

