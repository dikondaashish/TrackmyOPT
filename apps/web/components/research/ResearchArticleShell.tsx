import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';

type ResearchArticleShellProps = {
  category: string;
  title: string;
  description: string;
  readTime: string;
  publishedDate: string;
  children: React.ReactNode;
  next?: { href: string; label: string };
};

export function ResearchArticleShell({
  category,
  title,
  description,
  readTime,
  publishedDate,
  children,
  next,
}: ResearchArticleShellProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/research"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" />
        All research
      </Link>

      <header className="mb-10 border-b border-gray-200 pb-10 dark:border-zinc-800">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          {category}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-gray-900 dark:text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {readTime}
          </span>
          <span>•</span>
          <span>{publishedDate}</span>
          <span>•</span>
          <span>Written by the TrackMyOPT team</span>
        </div>
      </header>

      <div className="prose prose-lg prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
        {children}
      </div>

      {next && (
        <div className="mt-14 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-800 dark:bg-indigo-950/30">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 mb-2">
            Up next
          </p>
          <Link href={next.href} className="text-lg font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
            {next.label} →
          </Link>
        </div>
      )}
    </article>
  );
}
