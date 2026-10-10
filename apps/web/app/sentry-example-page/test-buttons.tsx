'use client';

export default function SentryTestButtons() {
  return (
    <div className="flex flex-wrap gap-4">
      <button
        type="button"
        className="rounded bg-blue-600 px-4 py-2 text-white"
        onClick={() => {
          throw new Error('TrackMyOPT Sentry browser verification');
        }}
      >
        Test browser error
      </button>
      <button
        type="button"
        className="rounded bg-blue-600 px-4 py-2 text-white"
        onClick={() => {
          void fetch('/api/sentry-example');
        }}
      >
        Test server error
      </button>
      <button
        type="button"
        className="rounded bg-blue-600 px-4 py-2 text-white"
        onClick={() => {
          void fetch('/api/sentry-example/edge');
        }}
      >
        Test edge error
      </button>
    </div>
  );
}
