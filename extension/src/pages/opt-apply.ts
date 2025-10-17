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
    <input 
      type="text" 
      id="program-end-date" 
      placeholder="mm/dd/yyyy"
      style="
        width: 100%;
        padding: 10px 12px;
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
    <input 
      type="text" 
      id="dso-recommendation-date" 
      placeholder="mm/dd/yyyy"
      style="
        width: 100%;
        padding: 10px 12px;
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
  
  // Event handlers
  calculateBtn.addEventListener('click', () => {
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
  
  setupPageHandlers(onBack);
}

