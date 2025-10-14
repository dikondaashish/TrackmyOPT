'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Tab = 'google' | 'manual';
type ManualMode = 'signin' | 'signup';

export default function ExtensionAuthPage() {
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');

  const [tab, setTab] = useState<Tab>('google');
  const [manualMode, setManualMode] = useState<ManualMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorParam);

  // Sign In
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [programEnd, setProgramEnd] = useState('');
  const [dsoReco, setDsoReco] = useState('');
  const [optEadEnd, setOptEadEnd] = useState('');
  const [optStart, setOptStart] = useState('');
  const [stemStart, setStemStart] = useState('');
  const [isStem, setIsStem] = useState(false);

  // Date validation errors
  const [dateErrors, setDateErrors] = useState<Record<string, string>>({});

  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

  const validateDate = (val: string, field: string, required = false) => {
    if (!val && !required) {
      setDateErrors((prev) => ({ ...prev, [field]: '' }));
      return true;
    }
    if (!val && required) {
      setDateErrors((prev) => ({ ...prev, [field]: 'Required' }));
      return false;
    }
    if (!dateRegex.test(val)) {
      setDateErrors((prev) => ({ ...prev, [field]: 'Use MM/DD/YYYY' }));
      return false;
    }
    setDateErrors((prev) => ({ ...prev, [field]: '' }));
    return true;
  };

  if (!redirectUri || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Request</h1>
            <p className="text-gray-600">
              This page must be accessed from the OPT Hub extension.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/extension/callback?redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: callbackUrl },
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  const handleManualSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/manual/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Login failed');
      window.location.href = `/auth/extension/callback?redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
      setLoading(false);
    }
  };

  const handleManualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate dates
    const v1 = validateDate(programEnd, 'programEnd', true);
    const v2 = validateDate(dsoReco, 'dsoReco', false);
    const v3 = validateDate(optEadEnd, 'optEadEnd', true);
    const v4 = validateDate(optStart, 'optStart', true);
    const v5 = validateDate(stemStart, 'stemStart', false);

    if (!v1 || !v3 || !v4) {
      setError('Please fix date errors');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/manual/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email: signUpEmail,
          password: signUpPassword,
          programEnd,
          dsoReco,
          optEadEnd,
          optStart,
          stemStart,
          isStem,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Signup failed');
      window.location.href = `/auth/extension/callback?redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">OPT Hub</h1>
          <p className="text-gray-600">Sign in to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('google')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              tab === 'google'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Google
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              tab === 'manual'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Manual
          </button>
        </div>

        {/* Google Tab */}
        {tab === 'google' && (
          <div>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-4 px-6 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
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
              Continue with Google
            </button>
          </div>
        )}

        {/* Manual Tab */}
        {tab === 'manual' && (
          <div>
            {/* Manual sub-tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setManualMode('signin')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition ${
                  manualMode === 'signin'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setManualMode('signup')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition ${
                  manualMode === 'signup'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Sign In Form */}
            {manualMode === 'signin' && (
              <form onSubmit={handleManualSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-lg"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* Sign Up Form */}
            {manualMode === 'signup' && (
              <form onSubmit={handleManualSignUp} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    OPT Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Program End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={programEnd}
                        onChange={(e) => setProgramEnd(e.target.value)}
                        onBlur={() => validateDate(programEnd, 'programEnd', true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="MM/DD/YYYY"
                      />
                      {dateErrors.programEnd && (
                        <p className="text-xs text-red-600 mt-1">{dateErrors.programEnd}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        DSO Recommendation Date
                      </label>
                      <input
                        type="text"
                        value={dsoReco}
                        onChange={(e) => setDsoReco(e.target.value)}
                        onBlur={() => validateDate(dsoReco, 'dsoReco', false)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="MM/DD/YYYY"
                      />
                      {dateErrors.dsoReco && (
                        <p className="text-xs text-red-600 mt-1">{dateErrors.dsoReco}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        OPT EAD End Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={optEadEnd}
                        onChange={(e) => setOptEadEnd(e.target.value)}
                        onBlur={() => validateDate(optEadEnd, 'optEadEnd', true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="MM/DD/YYYY"
                      />
                      {dateErrors.optEadEnd && (
                        <p className="text-xs text-red-600 mt-1">{dateErrors.optEadEnd}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        OPT Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={optStart}
                        onChange={(e) => setOptStart(e.target.value)}
                        onBlur={() => validateDate(optStart, 'optStart', true)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="MM/DD/YYYY"
                      />
                      {dateErrors.optStart && (
                        <p className="text-xs text-red-600 mt-1">{dateErrors.optStart}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        STEM Start Date
                      </label>
                      <input
                        type="text"
                        value={stemStart}
                        onChange={(e) => setStemStart(e.target.value)}
                        onBlur={() => validateDate(stemStart, 'stemStart', false)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="MM/DD/YYYY"
                      />
                      {dateErrors.stemStart && (
                        <p className="text-xs text-red-600 mt-1">{dateErrors.stemStart}</p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isStem"
                        checked={isStem}
                        onChange={(e) => setIsStem(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="isStem" className="ml-2 text-sm text-gray-700">
                        I'm STEM-eligible
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-lg"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
