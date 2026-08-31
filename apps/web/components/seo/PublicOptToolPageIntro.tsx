import type { ReactNode } from "react";

interface PublicOptToolPageIntroProps {
  title: string;
  description: string;
  children: ReactNode;
}

/**
 * Server-rendered context for the public calculator routes.
 *
 * The calculators themselves need browser state, but these routes are also in
 * the public sitemap. Keeping the page topic and guidance in a Server
 * Component gives crawlers and no-JavaScript visitors meaningful, unique HTML.
 */
export function PublicOptToolPageIntro({
  title,
  description,
  children,
}: PublicOptToolPageIntroProps) {
  return (
    <section
      aria-labelledby="public-opt-tool-heading"
      className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-5 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30 sm:p-7"
    >
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
        Free F-1 student planning tool
      </p>
      <h1
        id="public-opt-tool-heading"
        className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl"
      >
        {title}
      </h1>
      <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700 dark:text-slate-300">
        {description}
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">{children}</div>

      <p className="mt-6 text-sm leading-6 text-slate-600 dark:text-slate-400">
        TrackMyOPT provides educational planning information, not legal advice.
        Confirm current requirements and your individual situation with your DSO
        or a qualified immigration professional.
      </p>
    </section>
  );
}
