// Shown the moment Verified Jobs is opened, while the server loads the feed.
export default function VerifiedJobsLoading() {
  return (
    <main className="mx-auto max-w-[1440px] space-y-4 px-3 py-4 sm:px-5 sm:py-5" aria-busy="true">
      <header className="max-w-4xl space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-[-0.025em] text-gray-950 sm:text-3xl dark:text-white">Find verified jobs</h1>
        <p className="max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
          Browse jobs and add them to your resume queue.
        </p>
      </header>
      <p className="sr-only" role="status">Loading verified jobs…</p>
      <div className="animate-pulse space-y-3" aria-hidden="true">
        <div className="h-16 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" />
        <div className="h-28 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" />
        <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="size-10 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/5 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-3 w-3/5 rounded bg-slate-100 dark:bg-slate-900" />
              <div className="h-3 w-1/4 rounded bg-slate-100 dark:bg-slate-900" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
