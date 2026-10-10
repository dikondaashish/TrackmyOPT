import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SentryTestButtons from './test-buttons';

export const metadata: Metadata = {
  title: 'Sentry verification',
  robots: { index: false, follow: false },
};

export default function SentryExamplePage() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return (
    <main className="mx-auto max-w-xl space-y-6 px-6 py-16">
      <h1 className="text-2xl font-semibold">Sentry verification</h1>
      <p>
        Send synthetic errors, then confirm they appear in the TrackMyOPT Sentry
        project.
      </p>
      <SentryTestButtons />
    </main>
  );
}
