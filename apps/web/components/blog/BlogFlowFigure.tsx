'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Pause, Play } from 'lucide-react';
import { reportUnavailableBlogImage } from './BlogPostImage';
import type { ArticleSection } from '@/data/blog-series/types';

export function BlogFlowFigure({
  visual,
}: {
  visual: NonNullable<ArticleSection['visual']>;
}) {
  // Static first, including for readers who prefer reduced motion. Play is explicit.
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <figure className="not-prose my-8 rounded-xl border border-border bg-surface p-3 sm:p-5">
      {!failed && (
        <Image
          src={playing ? visual.src : visual.poster}
          alt={visual.alt}
          width={1200}
          height={600}
          unoptimized
          className="h-auto w-full rounded-lg border border-border bg-card shadow-card"
          onError={() => {
            setFailed(true);
            setPlaying(false);
            // Report only when the server confirms the asset is broken;
            // blocked images and dropped connections are visitor-side.
            void reportUnavailableBlogImage(
              playing ? visual.src : visual.poster,
              'Blog process illustration',
              'blog-flow-figure'
            );
          }}
        />
      )}
      <figcaption className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {visual.caption}
      </figcaption>
      <ol className="mt-4 grid gap-2 text-sm font-medium text-slate-800 sm:grid-cols-2 dark:text-slate-200">
        {visual.steps.map((step, index) => (
          <li key={step}>
            {index + 1}. {step}
          </li>
        ))}
      </ol>
      {!failed && (
        <button
          type="button"
          aria-pressed={playing}
          onClick={() => setPlaying(!playing)}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-card hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {playing ? (
            <Pause className="h-4 w-4" aria-hidden />
          ) : (
            <Play className="h-4 w-4" aria-hidden />
          )}
          {playing ? 'Pause animation' : 'Play animation'}
        </button>
      )}
      {failed && (
        <p
          role="status"
          className="mt-3 text-sm text-slate-600 dark:text-slate-300"
        >
          The illustration could not load. Follow the steps above.
        </p>
      )}
    </figure>
  );
}
