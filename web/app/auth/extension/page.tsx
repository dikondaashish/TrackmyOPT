'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { mmddyyyyToISO } from '@/lib/date';
import Link from 'next/link';

type AuthMode = 'google' | 'manual';
type ManualTab = 'signin' | 'signup';

export default function ExtensionAuthPage() {
  const searchParams = useSearchParams();
  const [authMode, setAuthMode] = useState<AuthMode>('google');
  const [manualTab, setManualTab] = useState<ManualTab>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get required params
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');

  // Sign In Form
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [programEndDate, setProgramEndDate] = useState('');
  const [dsoRecommendationDate, setDsoRecommendationDate] = useState('');
  const [optEadEndDate, setOptEadEndDate] = useState('');
  const [optStartDate, setOptStartDate] = useState('');
  const [stemStartDate, setStemStartDate] = useState('');
  const [isStemEligible, setIsStemEligible] = useState(false);

  // Validate required params on mount
  useEffect(() => {
    if (!redirectUri || !state) {
      setError(
        'Missing required parameters. This page must be accessed from the extension.'
      );
    }
  }, [redirectUri, state]);

  const handleGoogleSignIn = async () => {
    if (!redirectUri || !state) {
      setError('Missing redirect_uri or state');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const callbackUrl = new URL(
        '/auth/extension/callback',
        window.location.origin
      );
      callbackUrl.searchParams.set('redirect_uri', redirectUri);
      callbackUrl.searchParams.set('state', state);

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (signInError) throw signInError;
      // Redirect will happen automatically
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handleManualSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redirectUri || !state) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword(
        {
          email: signInEmail,
          password: signInPassword,
        }
      );

      if (signInError) throw signInError;

      if (data.session) {
        // Redirect to callback
        const callbackUrl = new URL(
          '/auth/extension/callback',
          window.location.origin
        );
        callbackUrl.searchParams.set('redirect_uri', redirectUri);
        callbackUrl.searchParams.set('state', state);
        window.location.href = callbackUrl.toString();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  const handleManualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redirectUri || !state) return;

    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!programEndDate || !optEadEndDate || !optStartDate) {
        throw new Error('Please fill in all required OPT dates');
      }

      // Step 1: Sign up user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (!data.user) {
        throw new Error('User creation failed');
      }

      // Step 2: Insert profile
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: data.user.id,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        is_stem_eligible: isStemEligible,
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('Failed to create profile');
      }

      // Step 3: Insert OPT status
      const { error: optError } = await supabase.from('opt_status').insert({
        user_id: data.user.id,
        program_end_date: mmddyyyyToISO(programEndDate),
        dso_recommendation_date: dsoRecommendationDate
          ? mmddyyyyToISO(dsoRecommendationDate)
          : null,
        opt_ead_end_date: mmddyyyyToISO(optEadEndDate),
        opt_start_date: mmddyyyyToISO(optStartDate),
        stem_start_date: stemStartDate ? mmddyyyyToISO(stemStartDate) : null,
      });

      if (optError) {
        console.error('OPT status creation error:', optError);
        throw new Error('Failed to save OPT information');
      }

      // Step 4: Redirect to callback
      if (data.session) {
        const callbackUrl = new URL(
          '/auth/extension/callback',
          window.location.origin
        );
        callbackUrl.searchParams.set('redirect_uri', redirectUri);
        callbackUrl.searchParams.set('state', state);
        window.location.href = callbackUrl.toString();
      } else {
        setSuccess(
          'Account created! Please check your email to confirm your account, then sign in.'
        );
        setAuthMode('manual');
        setManualTab('signin');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      setLoading(false);
    }
  };

  // Show error if required params are missing
  if (!redirectUri || !state) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Invalid Access
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                This page must be accessed from the TrackMyOPT extension.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="inline-block text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 cursor-pointer">
              TrackMyOPT
            </div>
          </Link>
          <p className="text-slate-600 dark:text-slate-400">
            Connect your extension to your account
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          {/* Mode Tabs */}
          <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setAuthMode('google')}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                authMode === 'google'
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sign in with Google
            </button>
            <button
              onClick={() => setAuthMode('manual')}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                authMode === 'manual'
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Manual
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Google Auth Mode */}
          {authMode === 'google' && (
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 text-slate-700 dark:text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? 'Redirecting...' : 'Continue with Google'}
              </button>

              <p className="mt-4 text-xs text-center text-slate-500 dark:text-slate-400">
                You'll be redirected to Google to sign in securely
              </p>
            </div>
          )}

          {/* Manual Auth Mode */}
          {authMode === 'manual' && (
            <div>
              {/* Manual Sub-tabs */}
              <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setManualTab('signin')}
                  className={`flex-1 py-2 px-4 font-semibold transition-all ${
                    manualTab === 'signin'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setManualTab('signup')}
                  className={`flex-1 py-2 px-4 font-semibold transition-all ${
                    manualTab === 'signup'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Sign In Form */}
              {manualTab === 'signin' && (
                <form onSubmit={handleManualSignIn} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              )}

              {/* Sign Up Form */}
              {manualTab === 'signup' && (
                <form onSubmit={handleManualSignUp} className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="••••••••"
                    />
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      At least 6 characters
                    </p>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-6">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                      OPT Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Program End Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={programEndDate}
                          onChange={(e) => setProgramEndDate(e.target.value)}
                          required
                          placeholder="MM/DD/YYYY"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          DSO Recommendation Date
                        </label>
                        <input
                          type="text"
                          value={dsoRecommendationDate}
                          onChange={(e) => setDsoRecommendationDate(e.target.value)}
                          placeholder="MM/DD/YYYY (optional)"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Current OPT EAD End Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={optEadEndDate}
                          onChange={(e) => setOptEadEndDate(e.target.value)}
                          required
                          placeholder="MM/DD/YYYY"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          OPT Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={optStartDate}
                          onChange={(e) => setOptStartDate(e.target.value)}
                          required
                          placeholder="MM/DD/YYYY"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          STEM OPT Start Date
                        </label>
                        <input
                          type="text"
                          value={stemStartDate}
                          onChange={(e) => setStemStartDate(e.target.value)}
                          placeholder="MM/DD/YYYY (optional)"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="stemEligible"
                          checked={isStemEligible}
                          onChange={(e) => setIsStemEligible(e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor="stemEligible"
                          className="ml-2 text-sm text-slate-700 dark:text-slate-300"
                        >
                          I'm STEM-eligible
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
