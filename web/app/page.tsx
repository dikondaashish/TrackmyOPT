import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-4xl px-6 py-12">
        <div className="text-center space-y-8">
          {/* Logo/Brand */}
          <div className="inline-block">
            <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TrackMyOPT
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
            Track Your OPT Timeline
            <br />
            <span className="text-slate-600 dark:text-slate-300">
              With Precision & Confidence
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Never miss a deadline. Stay compliant. Manage your Optional
            Practical Training period with our intuitive Chrome extension and
            web dashboard.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              href="/auth/extension"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Sign In or Create Account
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-md"
            >
              Learn More
            </a>
          </div>

          {/* Features */}
          <div
            id="features"
            className="grid md:grid-cols-3 gap-6 pt-16 text-left"
          >
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-3">⏱️</div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                Real-Time Countdown
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Track every day, hour, and minute of your OPT period with
                precision timing.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-3">🔔</div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                Smart Reminders
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Get notified before critical deadlines to stay compliant with
                regulations.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                Secure & Private
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Your data is encrypted and stored securely. We respect your
                privacy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

