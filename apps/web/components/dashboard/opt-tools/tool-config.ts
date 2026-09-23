import { CalendarDays, Clock3, GraduationCap, Timer } from 'lucide-react';

export const toolLinks = [
  {
    slug: 'opt-apply',
    title: 'OPT Apply',
    description: 'Plan your initial filing dates',
    icon: CalendarDays,
  },
  {
    slug: 'opt-clock',
    title: 'OPT Clock',
    description: 'Track initial OPT unemployment',
    icon: Clock3,
  },
  {
    slug: 'stem-apply',
    title: 'STEM Apply',
    description: 'Plan your extension application',
    icon: GraduationCap,
  },
  {
    slug: 'stem-clock',
    title: 'STEM Clock',
    description: 'Review your combined OPT history',
    icon: Timer,
  },
] as const;
export type ToolSlug = (typeof toolLinks)[number]['slug'];
export const panelClass =
  'min-w-0 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5';
// Retain the tools' established blue, orange, green, and purple identities.
export const toolThemes = {
  'opt-apply': {
    surface:
      'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30',
    solid: 'border-blue-700 bg-blue-700 text-white hover:bg-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    focus: 'focus-visible:ring-blue-500',
  },
  'opt-clock': {
    surface:
      'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30',
    solid: 'border-orange-700 bg-orange-700 text-white hover:bg-orange-800',
    text: 'text-orange-700 dark:text-amber-300',
    focus: 'focus-visible:ring-orange-500',
  },
  'stem-apply': {
    surface:
      'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30',
    solid: 'border-teal-700 bg-teal-700 text-white hover:bg-teal-800',
    text: 'text-teal-700 dark:text-emerald-300',
    focus: 'focus-visible:ring-emerald-500',
  },
  'stem-clock': {
    surface:
      'border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/30',
    solid: 'border-violet-700 bg-violet-700 text-white hover:bg-violet-800',
    text: 'text-violet-700 dark:text-purple-300',
    focus: 'focus-visible:ring-purple-500',
  },
} as const;
export function toolButtonClass(slug: ToolSlug) {
  return `inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${toolThemes[slug].solid} ${toolThemes[slug].focus}`;
}
