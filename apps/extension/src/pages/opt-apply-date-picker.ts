/**
 * Calendar date-picker UI for the OPT Apply page.
 */

import { getDaysInMonth, getFirstDayOfMonth, getMonthName } from './opt-apply-date-helpers';

/**
 * Create date picker calendar
 */
export function createDatePicker(
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
    background: var(--surface);
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
      border-bottom: 2px solid var(--border);
    `;

    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '↑';
    prevBtn.style.cssText = `
      width: 32px;
      height: 32px;
      border: 0;
      border-radius: 8px;
      background: var(--surface-2);
      color: var(--ink);
      cursor: pointer;
      font-size: 18px;
      font-weight: 700;
      transition: all 0.2s;
    `;
    prevBtn.addEventListener('mouseenter', () => {
      prevBtn.style.background = 'var(--border)';
    });
    prevBtn.addEventListener('mouseleave', () => {
      prevBtn.style.background = 'var(--surface-2)';
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
      color: var(--ink);
    `;
    monthYear.innerHTML = `${getMonthName(currentMonth)} ${currentYear} <span style="font-size: 12px; color: var(--muted);">▼</span>`;

    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '↓';
    nextBtn.style.cssText = `
      width: 32px;
      height: 32px;
      border: 0;
      border-radius: 8px;
      background: var(--surface-2);
      color: var(--ink);
      cursor: pointer;
      font-size: 18px;
      font-weight: 700;
      transition: all 0.2s;
    `;
    nextBtn.addEventListener('mouseenter', () => {
      nextBtn.style.background = 'var(--border)';
    });
    nextBtn.addEventListener('mouseleave', () => {
      nextBtn.style.background = 'var(--surface-2)';
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
        color: var(--muted);
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
        color: var(--border);
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
        color: ${isToday ? 'white' : 'var(--ink)'};
        font-size: 12px;
        font-weight: ${isToday ? '700' : '500'};
        cursor: pointer;
        transition: all 0.15s;
      `;

      dayBtn.addEventListener('mouseenter', () => {
        if (!isToday) {
          dayBtn.style.background = 'var(--surface-2)';
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
        color: var(--border);
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
      border-top: 1px solid var(--border);
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
      clearBtn.style.background = 'var(--tool-blue-surface)';
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
      todayBtn.style.background = 'var(--tool-blue-surface)';
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
