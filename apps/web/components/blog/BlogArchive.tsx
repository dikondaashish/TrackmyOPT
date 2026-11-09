'use client';

import { useState } from 'react';
import Link from 'next/link';

export type BlogArchiveItem = { slug: string; title: string; topic: string; date: string };

const INITIAL_ROWS = 24;
const ALL = 'All';

/**
 * Every post, newest first, with topic filters. All rows are rendered into
 * the HTML (rows past the first 24 are `hidden` until "Show all"), so every
 * post stays linked from /blog for crawlers, including posts no hub lists.
 */
export function BlogArchive({
  posts,
  topics,
}: {
  posts: BlogArchiveItem[];
  topics: { label: string; count: number }[];
}) {
  const [topic, setTopic] = useState(ALL);
  const [expanded, setExpanded] = useState(false);
  const filtered = topic === ALL ? posts : posts.filter((post) => post.topic === topic);
  const limit = expanded || topic !== ALL ? Infinity : INITIAL_ROWS;
  const rank = new Map(filtered.map((post, index) => [post.slug, index]));
  const chips = [{ label: ALL, count: posts.length }, ...topics];

  return (
    <div>
      <div role="group" aria-label="Filter guides by topic" className="mb-6 flex flex-wrap gap-2">
        {chips.map((chip) => {
          const active = chip.label === topic;
          return (
            <button
              key={chip.label}
              type="button"
              aria-pressed={active}
              onClick={() => setTopic(chip.label)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:border-primary hover:text-primary'
              }`}
            >
              {chip.label} <span className={active ? 'opacity-80' : 'text-muted-foreground'}>{chip.count}</span>
            </button>
          );
        })}
      </div>

      <ul className="divide-y divide-border rounded-xl border border-border bg-background">
        {posts.map((post) => {
          const index = rank.get(post.slug);
          const visible = index !== undefined && index < limit;
          return (
            <li key={post.slug} hidden={!visible}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-baseline sm:gap-4 sm:px-5 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="min-w-0 flex-1 font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
                  {post.title}
                </span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-primary">{post.topic}</span>
                  <span aria-hidden>·</span>
                  <time>{post.date}</time>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {filtered.length > limit && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-6 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Show all {filtered.length} guides
        </button>
      )}
    </div>
  );
}
