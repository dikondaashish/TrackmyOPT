import type { Metadata } from 'next';
import Link from 'next/link';
import { Chrome, ShieldCheck } from 'lucide-react';
import { ApplicationProfileSection } from '@/components/dashboard/settings/ApplicationProfileSection';
import { PrivateApplicationAnswersSection } from '@/components/dashboard/settings/PrivateApplicationAnswersSection';

export const metadata: Metadata = {
  title: 'Application Profile | TrackMyOPT',
  description:
    'Your contact details, portal login, and saved answers for Chrome job application prefill.',
};

export default function ExtensionPrefillPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
          <Chrome className="h-4 w-4" /> Chrome Job Prefill
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Your application profile
        </h1>
        <p className="mt-3 max-w-prose text-sm leading-6 text-muted-foreground">
          Contact details, portal login, and application answers, all in one
          place. Save what you want to share, then click Prefill on a supported
          job portal.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <a
            href="https://chromewebstore.google.com/detail/hfljbefkccdmlnhclfojlafipjnjbajm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Chrome className="h-4 w-4" /> Install or open extension
          </a>
          <Link
            href="/dashboard/settings?tab=extension"
            className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline"
          >
            Check connection
          </Link>
        </div>
      </header>

      <section
        aria-label="How Prefill works"
        className="mb-8 border-y border-border py-5"
      >
        <ol className="grid gap-4 text-sm sm:grid-cols-3">
          <li>
            <strong className="block font-semibold">
              1. Save your details
            </strong>
            <span className="mt-1 block text-muted-foreground">
              Only save answers you want filled.
            </span>
          </li>
          <li>
            <strong className="block font-semibold">
              2. Open the application
            </strong>
            <span className="mt-1 block text-muted-foreground">
              Login and create-account forms work too.
            </span>
          </li>
          <li>
            <strong className="block font-semibold">
              3. Prefill, then review
            </strong>
            <span className="mt-1 block text-muted-foreground">
              You continue and submit yourself.
            </span>
          </li>
        </ol>
      </section>

      <div className="mb-6 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="max-w-prose">
          Prefill fills supported empty fields. Your portal login can fill
          email, password, and password confirmation on supported secure pages.
          It never creates an account or submits a form for you. Some portals or
          embedded forms still need manual entry.
        </p>
      </div>
      <section aria-label="Application profile details" className="space-y-8">
        <ApplicationProfileSection />
        <PrivateApplicationAnswersSection />
      </section>
    </main>
  );
}
