'use client';

import { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

export type BlogSearchItem = { slug: string; title: string; topic: string };

const MAX_RESULTS = 8;

function matches(item: BlogSearchItem, words: string[]) {
  const text = `${item.title} ${item.topic}`.toLowerCase();
  return words.every((word) => text.includes(word));
}

/** Title search over every blog post; results link straight to the post. */
export function BlogSearch({ posts }: { posts: BlogSearchItem[] }) {
  const id = useId();
  const [query, setQuery] = useState('');
  const words = useMemo(
    () => query.toLowerCase().split(/\s+/).filter(Boolean),
    [query]
  );
  const results = useMemo(
    () => (words.length ? posts.filter((item) => matches(item, words)) : []),
    [posts, words]
  );

  return (
    <div className="relative max-w-2xl">
      <label htmlFor={`${id}-q`} className="sr-only">
        Search {posts.length} guides
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          id={`${id}-q`}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${posts.length} guides`}
          autoComplete="off"
          aria-controls={`${id}-results`}
          className="w-full rounded-xl border border-border bg-background py-3.5 pl-12 pr-4 text-base text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <p className="sr-only" aria-live="polite">
        {words.length ? `${results.length} guides found` : ''}
      </p>
      {words.length > 0 && (
        <div
          id={`${id}-results`}
          className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
        >
          {results.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No guide titles match. Try fewer words, or browse the topics below.
            </p>
          ) : (
            <ul className="max-h-96 divide-y divide-border overflow-y-auto">
              {results.slice(0, MAX_RESULTS).map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/blog/${item.slug}`}
                    className="block px-4 py-3 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                  >
                    <span className="block text-sm font-semibold text-foreground">{item.title}</span>
                    <span className="mt-0.5 block text-xs text-primary">{item.topic}</span>
                  </Link>
                </li>
              ))}
              {results.length > MAX_RESULTS && (
                <li className="px-4 py-3 text-xs text-muted-foreground">
                  {results.length - MAX_RESULTS} more match. Add a word to narrow the list.
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
