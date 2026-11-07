import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

type ResearchArticleShellProps = {
  category: string;
  title: string;
  description: string;
  readTime: string;
  publishedDate: string;
  image?: string;
  children: React.ReactNode;
  next?: { href: string; label: string };
};

export function ResearchArticleShell({
  category,
  title,
  description,
  readTime,
  publishedDate,
  image,
  children,
  next,
}: ResearchArticleShellProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link
        href="/research"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        All research
      </Link>

      <header className="mb-10 border-b border-border pb-10">
        <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{description}</p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="font-medium text-violet-700 dark:text-violet-300">{category}</span>
          <span aria-hidden>·</span>
          <span>{readTime}</span>
          <span aria-hidden>·</span>
          <span>{publishedDate}</span>
          <span aria-hidden>·</span>
          <span>Written by the TrackMyOPT team</span>
        </div>
        {image && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl border border-border bg-muted shadow-card">
            <Image
              src={image}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}
      </header>

      <div className="research-article-body prose prose-lg prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400">
        {children}
      </div>

      {next && (
        <div className="mt-14 rounded-xl border border-border bg-surface p-6">
          <p className="text-sm text-muted-foreground mb-2">
            Up next
          </p>
          <Link href={next.href} className="text-lg font-bold text-foreground transition-colors hover:text-primary">
            {next.label} →
          </Link>
        </div>
      )}
    </article>
  );
}
