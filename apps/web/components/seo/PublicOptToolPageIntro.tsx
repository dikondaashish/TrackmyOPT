import type { ReactNode } from 'react';

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
    <div className="border-b border-border bg-background">
      <section
        aria-labelledby="public-opt-tool-heading"
        className="mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pt-10"
      >
        <p className="mb-2 text-sm text-muted-foreground">
          Free F-1 student planning tool
        </p>
        <h1
          id="public-opt-tool-heading"
          className="max-w-3xl text-3xl font-bold text-foreground sm:text-4xl"
        >
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
          {description}
        </p>

        <details className="mt-6 rounded-xl border border-border bg-surface px-4 py-2">
          <summary className="flex min-h-11 cursor-pointer items-center font-medium text-foreground focus-visible:ring-2">
            Before you start · guidance and limitations
          </summary>
          <div className="mt-2 grid gap-3 md:grid-cols-2">{children}</div>
          <p className="my-4 text-sm leading-6 text-muted-foreground">
            TrackMyOPT provides educational planning information, not legal
            advice. Confirm current requirements and your individual situation
            with your DSO or a qualified immigration professional.
          </p>
        </details>
      </section>
    </div>
  );
}
