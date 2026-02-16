/**
 * OPT Date Calculations
 * All calculations based on USCIS OPT rules
 */

export interface OPTDates {
  program_end_date: string; // YYYY-MM-DD
  dso_recommendation_date?: string | null;
  opt_ead_end_date: string;
  opt_start_date: string;
  stem_start_date?: string | null;
}

export interface CalculatedDates {
  earliestFileDate: Date;
  recommendedTarget: Date;
  mustArriveBy: Date;
  optStartEarliest: Date;
  optStartLatest: Date;
  nextDeadline: {
    date: Date;
    label: string;
    daysLeft: number;
  } | null;
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
 * Subtract days from a date
 */
function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Get days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const diffTime = date2.getTime() - date1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate all OPT-related dates
 */
export function calculateOPTDates(dates: OPTDates): CalculatedDates {
  const programEnd = new Date(dates.program_end_date);
  const dsoRec = dates.dso_recommendation_date ? new Date(dates.dso_recommendation_date) : null;
  const optStart = new Date(dates.opt_start_date);
  
  // Earliest file date: 90 days before program end
  const earliestFileDate = subtractDays(programEnd, 90);
  
  // Must arrive by: min(program_end + 60 days, dso_rec + 30 days)
  const programEndPlus60 = addDays(programEnd, 60);
  let mustArriveBy = programEndPlus60;
  
  if (dsoRec) {
    const dsoRecPlus30 = addDays(dsoRec, 30);
    mustArriveBy = dsoRecPlus30 < mustArriveBy ? dsoRecPlus30 : mustArriveBy;
  }
  
  // Recommended target: 14 days before must arrive by (safety buffer)
  const recommendedTarget = subtractDays(mustArriveBy, 14);
  
  // OPT start window: program_end to program_end + 60 days
  const optStartEarliest = programEnd;
  const optStartLatest = addDays(programEnd, 60);
  
  // Calculate next deadline
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight
  
  const deadlines = [
    { date: mustArriveBy, label: 'Must arrive by' },
    { date: optStartLatest, label: 'OPT start window closes' },
  ].filter(d => d.date >= today);
  
  let nextDeadline = null;
  if (deadlines.length > 0) {
    deadlines.sort((a, b) => a.date.getTime() - b.date.getTime());
    const next = deadlines[0];
    nextDeadline = {
      date: next.date,
      label: next.label,
      daysLeft: daysBetween(today, next.date),
    };
  }
  
  return {
    earliestFileDate,
    recommendedTarget,
    mustArriveBy,
    optStartEarliest,
    optStartLatest,
    nextDeadline,
  };
}

/**
 * Calculate unemployment days
 */
export interface EmploymentSpan {
  start_date: string; // YYYY-MM-DD
  end_date: string | null; // null = currently employed
}

export function calculateUnemploymentDays(
  optStartDate: string,
  optEadEndDate: string,
  employmentSpans: EmploymentSpan[]
): { used: number; remaining: number; max: number } {
  const optStart = new Date(optStartDate);
  const optEnd = new Date(optEadEndDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate total OPT period (in days)
  const endDate = today < optEnd ? today : optEnd;
  const totalDays = daysBetween(optStart, endDate);
  
  // Calculate employed days
  let employedDays = 0;
  
  for (const span of employmentSpans) {
    const spanStart = new Date(span.start_date);
    const spanEnd = span.end_date ? new Date(span.end_date) : today;
    
    // Only count days within OPT period
    const effectiveStart = spanStart < optStart ? optStart : spanStart;
    const effectiveEnd = spanEnd > endDate ? endDate : spanEnd;
    
    if (effectiveStart <= effectiveEnd) {
      employedDays += daysBetween(effectiveStart, effectiveEnd);
    }
  }
  
  const unemploymentUsed = totalDays - employedDays;
  const max = 90; // Regular OPT limit (STEM has separate 60-day limit)
  const remaining = max - unemploymentUsed;
  
  return {
    used: unemploymentUsed > 0 ? unemploymentUsed : 0,
    remaining: remaining > 0 ? remaining : 0,
    max,
  };
}

/**
 * Get unemployment status
 */
export function getUnemploymentStatus(used: number, max: number): {
  level: 'ok' | 'warning' | 'critical' | 'limit';
  label: string;
  color: string;
} {
  if (used >= max) {
    return { level: 'limit', label: 'Limit Reached', color: 'red' };
  } else if (used >= max * 0.89) { // 80+ days
    return { level: 'critical', label: 'Critical', color: 'red' };
  } else if (used >= max * 0.67) { // 60+ days
    return { level: 'warning', label: 'Warning', color: 'yellow' };
  } else {
    return { level: 'ok', label: 'OK', color: 'green' };
  }
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

/**
 * Format date range
 */
export function formatDateRange(start: Date | string, end: Date | string): string {
  return `${formatDate(start)} → ${formatDate(end)}`;
}

/**
 * Convert ISO date to MM/DD/YYYY
 */
export function isoToMMDDYYYY(isoDate: string): string {
  const date = new Date(isoDate);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

