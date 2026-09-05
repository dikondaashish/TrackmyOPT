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
    <section className="mt-12 border-t border-gray-200 dark:border-zinc-800 pt-8">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        {heading}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {posts.map((post) => (
          <li key={post.href}>
            <Link
              href={post.href}
              className="group flex h-full flex-col rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/40 p-4 transition-colors hover:border-blue-300 dark:hover:border-blue-700"
            >
              <span className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
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
