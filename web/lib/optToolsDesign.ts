// OPT Tools Design System - Design Tokens & Utilities

export const colors = {
  light: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    secondary: '#10b981',
    background: '#ffffff',
    surface: '#f9fafb',
    surfaceHover: '#f3f4f6',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  dark: {
    primary: '#3b82f6',
    primaryHover: '#60a5fa',
    secondary: '#34d399',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceHover: '#334155',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
  },
};

export const toolDefinitions = [
  {
    id: 'opt-apply',
    slug: 'opt-apply',
    title: 'OPT Apply',
    description: 'Calculate your post-completion OPT filing window and track all important deadlines from application to approval.',
    icon: '📅',
    gradient: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'opt-clock',
    slug: 'opt-clock',
    title: 'OPT Clock',
    description: 'Monitor your 90-day unemployment limit in real-time. Track employment periods and stay compliant with USCIS regulations.',
    icon: '⏰',
    gradient: 'from-amber-500 to-orange-600',
    lightBg: 'bg-amber-50',
    darkBg: 'dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'stem-apply',
    slug: 'stem-apply',
    title: 'STEM OPT Apply',
    description: 'Track your 24-month STEM extension application timeline, including cap-gap protection and I-983 requirements.',
    icon: '🎓',
    gradient: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    darkBg: 'dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'stem-clock',
    slug: 'stem-clock',
    title: 'STEM OPT Clock',
    description: 'Monitor the 150-day aggregate unemployment limit across your OPT and STEM extension periods.',
    icon: '⏱️',
    gradient: 'from-purple-500 to-violet-600',
    lightBg: 'bg-purple-50',
    darkBg: 'dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
];

// Date utilities
export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [m, d, y] = parts.map(Number);
    if (!isNaN(m) && !isNaN(d) && !isNaN(y)) return new Date(y, m - 1, d);
  }
  const iso = new Date(dateStr);
  return isNaN(iso.getTime()) ? null : iso;
}

export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateInput(date: Date): string {
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
}

export function addDays(date: Date, days: number): Date {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}

export function daysBetween(d1: Date, d2: Date): number {
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function isoToMMDDYYYY(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : formatDateInput(d);
}

export function mmddyyyyToISO(dateStr: string): string {
  const d = parseDate(dateStr);
  return d ? d.toISOString().split('T')[0] : '';
}

// Status helpers
export function getStatusVariant(daysRemaining: number, maxDays: number): 'success' | 'warning' | 'danger' {
  const percentage = ((maxDays - daysRemaining) / maxDays) * 100;
  if (percentage >= 89 || daysRemaining <= 7) return 'danger';
  if (percentage >= 67 || daysRemaining <= 30) return 'warning';
  return 'success';
}

export function getStatusColor(variant: 'success' | 'warning' | 'danger'): string {
  switch (variant) {
    case 'success': return 'text-green-600 dark:text-green-400';
    case 'warning': return 'text-amber-600 dark:text-amber-400';
    case 'danger': return 'text-red-600 dark:text-red-400';
  }
}

export function getStatusBg(variant: 'success' | 'warning' | 'danger'): string {
  switch (variant) {
    case 'success': return 'bg-green-100 dark:bg-green-900/30';
    case 'warning': return 'bg-amber-100 dark:bg-amber-900/30';
    case 'danger': return 'bg-red-100 dark:bg-red-900/30';
  }
}
