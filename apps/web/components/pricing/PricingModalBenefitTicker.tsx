'use client';

import {
  Bell,
  Clock,
  FileCheck,
  Mail,
  CalendarDays,
  Shield,
  type LucideIcon,
} from 'lucide-react';

const HEADER_BENEFITS: Array<{ icon: LucideIcon; title: string; sub: string }> =
  [
    {
      icon: Bell,
      title: 'Daily USCIS monitoring',
      sub: 'Auto-checks + status email',
    },
    {
      icon: Clock,
      title: 'Unemployment alerts',
      sub: 'Before 90 / 150-day limits',
    },
    {
      icon: FileCheck,
      title: 'Document vault',
      sub: 'EAD & I-20 expiry reminders',
    },
    {
      icon: CalendarDays,
      title: 'STEM deadline tracking',
      sub: 'Extension filing window reminders',
    },
    { icon: Mail, title: '9:00 AM ET reminders', sub: 'Daily, per tracker' },
    { icon: Shield, title: 'Stay organized', sub: 'Key dates in one place' },
  ];

/**
 * Decorative vertical marquee shown behind the header on the left/right edges.
 * Purely visual — hidden from assistive tech and pointer events.
 */
export function HeaderBenefitTicker({ reverse = false }: { reverse?: boolean }) {
  return (
    <div
      className="flex flex-col gap-[var(--gap)] [--gap:0.6rem] [--duration:30s]"
      style={reverse ? { animationDirection: 'reverse' } : undefined}
    >
      {[0, 1].map((copy) => (
        <div
          key={copy}
          className="flex shrink-0 flex-col gap-[var(--gap)] animate-marquee-vertical"
          style={reverse ? { animationDirection: 'reverse' } : undefined}
        >
          {HEADER_BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="flex items-start gap-2 rounded-xl border border-border/40 bg-background/70 px-3 py-2 shadow-sm backdrop-blur-sm"
              >
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500 dark:text-violet-400" />
                <div className="min-w-0 text-left">
                  <p className="text-[11px] font-semibold leading-tight text-foreground/80 truncate">
                    {b.title}
                  </p>
                  <p className="text-[10px] leading-snug text-muted-foreground truncate">
                    {b.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
