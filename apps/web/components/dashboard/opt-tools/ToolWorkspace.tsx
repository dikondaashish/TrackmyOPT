'use client';

import type { ReactNode } from 'react';
import { ToolUpgradePrompt, type ToolAudience } from './ToolUpgradePrompt';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, Save } from 'lucide-react';
import { DateInput } from '../opt/OptDateInput';
import { calendarDateISO } from '@/lib/immigration/calendar-days';
import type { ToolDates, useToolDates } from './useToolDates';
import {
  toolLinks,
  toolThemes,
  panelClass,
  toolButtonClass,
  type ToolSlug,
} from './tool-config';

export function ToolWorkspace({
  slug,
  children,
  aside,
  audience = 'unknown',
}: {
  slug: ToolSlug;
  children: ReactNode;
  aside?: ReactNode;
  audience?: ToolAudience;
}) {
  const pathname = usePathname();
  const base = pathname.startsWith('/dashboard')
    ? '/dashboard/opt-tools'
    : '/tools';
  const tool = toolLinks.find((item) => item.slug === slug)!;
  const Icon = tool.icon;
  const theme = toolThemes[slug];
  return (
    <section
      className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6"
      aria-label={tool.title}
    >
      <header
        className={`flex items-center gap-3 rounded-2xl border p-4 sm:p-5 ${theme.surface}`}
      >
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${theme.solid}`}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{tool.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {tool.description}
          </p>
        </div>
      </header>
      <nav
        aria-label="OPT tools"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {toolLinks.map((item) => (
          <Link
            key={item.slug}
            href={`${base}/${item.slug}`}
            aria-current={slug === item.slug ? 'page' : undefined}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 ${toolThemes[item.slug].focus} ${slug === item.slug ? toolThemes[item.slug].solid : 'border-border bg-card text-foreground hover:bg-muted'}`}
          >
            <item.icon
              aria-hidden="true"
              className={`h-4 w-4 ${slug === item.slug ? '' : toolThemes[item.slug].text}`}
            />
            {item.title}
          </Link>
        ))}
      </nav>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <div className="min-w-0 space-y-5">{children}</div>
        <aside className="min-w-0 space-y-5">
          <ToolUpgradePrompt slug={slug} audience={audience} />
          {aside}
          <div className={panelClass}>
            <h3 className="font-semibold">Before you act</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Planning estimates, not USCIS approval or a determination of
              status. Verify your EAD, qualifying employment, and filing
              requirements with your DSO.
            </p>
            <a
              href="https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/subpart-A/section-214.2#p-214.2(f)"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-blue-700 underline underline-offset-4 focus-visible:ring-2 dark:text-blue-300"
            >
              Official F-1 regulations{' '}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function ToolDateField({
  name,
  label,
  state,
  optional = false,
  description,
}: {
  name: keyof ToolDates;
  label: string;
  state: ReturnType<typeof useToolDates>;
  optional?: boolean;
  description?: string;
}) {
  const value = state.dates[name];
  return (
    <DateInput
      id={`tool-${name}`}
      label={label}
      value={value}
      onChange={(value) => state.change(name, value)}
      optional={optional}
      description={description}
      error={
        value.trim() && !calendarDateISO(value)
          ? 'Enter a real date (MM/DD/YYYY).'
          : undefined
      }
    />
  );
}

export function ToolSave({
  state,
  fields,
  valid,
  slug,
}: {
  state: ReturnType<typeof useToolDates>;
  fields: (keyof ToolDates)[];
  valid: boolean;
  slug: ToolSlug;
}) {
  const dirty = fields.some((key) => state.dates[key] !== state.saved[key]);
  return (
    <div className="mt-4 space-y-3 border-t border-border pt-4">
      {state.loadError && (
        <div role="alert" className="text-sm text-red-700 dark:text-red-300">
          Could not load your saved dates. Saving is disabled to protect them.{' '}
          <button
            type="button"
            onClick={state.retry}
            className="min-h-11 px-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}
      {state.saveError && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {state.saveError}
        </p>
      )}
      {state.guest ? (
        <p className="text-sm text-muted-foreground">
          Preview only.{' '}
          <Link
            className="font-semibold text-blue-700 underline dark:text-blue-300"
            href="/login"
          >
            Sign in to save your dates
          </Link>
          .
        </p>
      ) : (
        <>
          {dirty && (
            <p
              role="status"
              className="text-sm text-amber-800 dark:text-amber-300"
            >
              Unsaved preview: reminders still use your saved dates.
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">
              {state.success
                ? 'Saved to your dashboard.'
                : 'Save to sync with your dashboard.'}
            </span>
            <button
              type="button"
              onClick={() => state.save(fields)}
              disabled={
                !valid || state.loading || state.loadError || state.saving
              }
              className={toolButtonClass(slug)}
            >
              <Save aria-hidden="true" className="h-4 w-4" />
              {state.saving ? 'Saving…' : state.success ? 'Saved!' : 'Save'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
