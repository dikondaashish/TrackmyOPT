import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type RelatedPostLink = {
  href: string;
  title: string;
  description?: string;
};

interface RelatedPostsProps {
  posts: RelatedPostLink[];
  heading?: string;
}

/** Compact related-reading block for static blog posts. */
export function RelatedPosts({
  posts,
  heading = "Related Guides",
}: RelatedPostsProps) {
  if (!posts.length) return null;

  return (
    <section className="not-prose mt-12 rounded-xl border border-border bg-surface p-6 sm:p-7">
      <h2 className="text-lg font-bold text-foreground mb-4">
        {heading}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {posts.map((post) => (
          <li key={post.href}>
            <Link
              href={post.href}
              className="surface-card-interactive group flex h-full flex-col p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {post.title}
              </span>
              {post.description ? (
                <span className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {post.description}
                </span>
              ) : null}
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                Read more
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
