import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/dashboard/DashboardClient';

export const metadata = {
  title: 'Dashboard | TrackMyOPT',
  description: 'Your complete OPT management dashboard',
};

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Route protection: redirect to login if not authenticated
  if (!session) {
    redirect('/auth/extension?redirect=/dashboard');
  }

  // Fetch user data
  const userId = session.user.id;

  // Fetch profile (or create if doesn't exist)
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // Create profile if it doesn't exist
  if (!profile) {
    await supabase.from('profiles').insert({
      user_id: userId,
      timezone: 'America/New_York',
      is_stem_eligible: false,
    });
    
    // Fetch again
    const { data: newProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    profile = newProfile;
  }

  // Fetch OPT status
  const { data: optStatus } = await supabase
    .from('opt_status')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // Fetch employment spans (latest 10)
  const { data: employmentSpans } = await supabase
    .from('employment_spans')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })
    .limit(10);

  const hasOptData = !!optStatus;
  const emailVerified = session.user.email_confirmed_at !== null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🔷 TrackMyOPT
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your complete toolkit for managing OPT requirements
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Theme toggle placeholder */}
              <button
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                aria-label="Toggle theme"
              >
                🌙
              </button>
              
              {/* User menu placeholder */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {session.user.email}
                </span>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Email Verification Banner */}
        {!emailVerified && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">
                  Email Not Verified
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
                  To receive reminders, please verify your email address: {session.user.email}
                </p>
                <button className="mt-2 text-sm font-medium text-yellow-900 dark:text-yellow-200 underline hover:no-underline">
                  Resend Verification Email
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Welcome / Empty State OR Dashboard Content */}
        {!hasOptData ? (
          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to TrackMyOPT!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Let's get started by adding your OPT dates
            </p>
            <div className="max-w-md mx-auto text-left bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                We need a few dates to calculate your filing windows and track your OPT status.
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-gray-900 dark:text-white font-medium">Required Information:</p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                  <li>Program End Date</li>
                  <li>Current OPT EAD End Date</li>
                  <li>OPT Start Date</li>
                </ul>
                <p className="text-gray-900 dark:text-white font-medium mt-3">Optional:</p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                  <li>DSO Recommendation Date (if received)</li>
                </ul>
              </div>
            </div>
          </div>
        ) : null}

        {/* Dashboard Client Component */}
        <DashboardClient 
          profile={profile!}
          optStatus={optStatus}
          employmentSpans={employmentSpans || []}
          userEmail={session.user.email!}
        />

        {/* Quick Action Tiles (2x2 grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 cursor-pointer hover:scale-[1.02] transition">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              OPT Apply Start Dates
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Calculate when you can start applying for OPT
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 cursor-pointer hover:scale-[1.02] transition">
            <div className="text-3xl mb-3">🎒</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              STEM OPT Apply Start Dates
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Calculate STEM OPT extension application dates
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 cursor-pointer hover:scale-[1.02] transition">
            <div className="text-3xl mb-3">⏱️</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              OPT Clock Tracker
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track your unemployment days in real-time
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 cursor-pointer hover:scale-[1.02] transition opacity-75">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              More Tools Coming
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Stay tuned for additional OPT resources
            </p>
          </div>
        </div>

        {/* Notice Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
                Stay Compliant
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                All tools are designed to help you track and manage your OPT requirements. 
                Always consult with your DSO for official guidance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-slate-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-slate-600 dark:text-slate-400">
          <div className="space-x-4 mb-4">
            <a href="/privacy" className="hover:text-slate-900 dark:hover:text-slate-200">
              Privacy Policy
            </a>
            <span>·</span>
            <a href="/terms" className="hover:text-slate-900 dark:hover:text-slate-200">
              Terms & Conditions
            </a>
            <span>·</span>
            <a href="/support" className="hover:text-slate-900 dark:hover:text-slate-200">
              Support
            </a>
          </div>
          <p>© 2025 TrackMyOPT. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

