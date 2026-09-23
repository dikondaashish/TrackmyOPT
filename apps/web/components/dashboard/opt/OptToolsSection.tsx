'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { toolLinks, toolThemes } from '../opt-tools/tool-config';

export function OptToolsSection() {
  return (
    <section className="mx-auto max-w-6xl space-y-5 px-4 sm:px-6">
      <header className="rounded-2xl bg-blue-800 p-5 text-white">
        <h1 className="font-semibold tracking-tight">OPT Tools</h1>
        <p className="mt-2 text-blue-100">
          Plan filing dates and review unemployment days.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {toolLinks.map((tool) => (
          <Link
            href={'/dashboard/opt-tools/' + tool.slug}
            key={tool.slug}
            className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div className="flex items-center justify-between">
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl ${toolThemes[tool.slug].surface} ${toolThemes[tool.slug].text}`}
              >
                <tool.icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="h-5 w-5 text-muted-foreground"
              />
            </div>
            <h2 className="mt-4 text-lg font-semibold">{tool.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tool.description}
            </p>
            <span
              className={`mt-4 inline-block text-sm font-semibold ${toolThemes[tool.slug].text}`}
            >
              Open tool
            </span>
          </Link>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Save changes to sync your dashboard dates. Calculators provide planning
        estimates, not USCIS approval or legal advice. Confirm your
        circumstances with your DSO.
      </p>
    </section>
  );
}
