'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, Lightbulb } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { LoadingScreen } from '@/components/ui/loading-screen';

type Tab = 'google' | 'manual';

const PUBLISHED_EXTENSION_IDS = new Set([
  'hfljbefkccdmlnhclfojlafipjnjbajm',
  process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID?.toLowerCase(),
]);

function looksLikeExtensionRedirectUri(value: string | null): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    const match = /^([a-p]{32})\.chromiumapp\.org$/i.exec(url.hostname);
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.port &&
      match !== null &&
      PUBLISHED_EXTENSION_IDS.has(match[1].toLowerCase())
    );
  } catch {
    return false;
  }
}

function ExtensionAuthContent() {
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');

  const [tab, setTab] = useState<Tab>('google');
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorParam);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [awaitingEmailVerification, setAwaitingEmailVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

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

  const formatDateInput = (value: string): string => {
    const nums = value.replace(/\D/g, '');
    if (nums.length <= 2) return nums;
    if (nums.length <= 4) return nums.slice(0, 2) + '/' + nums.slice(2);
    return nums.slice(0, 2) + '/' + nums.slice(2, 4) + '/' + nums.slice(4, 8);
  };

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

  const extensionCallbackPath = () =>
    `/auth/extension/callback?redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;

  const checkBlockedEmail = async (emailToCheck: string) => {
    const response = await fetch('/api/auth/check-blocked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailToCheck.trim().toLowerCase() }),
    });
    const result = await response.json().catch(() => null);

    if (!response.ok || !result) {
      throw new Error('Unable to verify this email. Please try again.');
    }
    if (result.blocked) {
      throw new Error(
        result.message ||
          'This email has been permanently blocked and cannot be used.'
      );
    }
  };

  const saveExtensionProfileAndContinue = async () => {
    const response = await fetch('/api/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timezone: 'America/New_York',
        is_stem_eligible: isStem,
        program_end_date: programEnd,
        dso_recommendation_date: dsoReco,
        opt_ead_end_date: optEadEnd,
        opt_start_date: optStart,
        stem_start_date: stemStart,
      }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.ok) {
      throw new Error('Your account was verified, but setup could not be completed. Please try again.');
    }

    window.location.assign(extensionCallbackPath());
  };

  if (
    !redirectUri ||
    !state ||
    state.length > 512 ||
    !looksLikeExtensionRedirectUri(redirectUri)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-background dark:to-background p-4">
        <div className="bg-white dark:bg-card rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">Invalid Login Link</h1>
            <p className="text-gray-600 dark:text-muted-foreground mb-4">
              This authentication page must be accessed from the OPT Hub extension.
            </p>
            <p className="text-sm text-gray-500 dark:text-muted-foreground">
              This link must be opened by the official TrackMyOPT extension.
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
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false,
        },
      });
      if (oauthError) throw oauthError;
      // Supabase will automatically redirect
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  const handleManualSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSignInError(null);
    setError(null);

    try {
      await checkBlockedEmail(email);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (signInError) throw signInError;

      window.location.assign(extensionCallbackPath());
    } catch (err: any) {
      setSignInError(err.message || 'Sign in failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleManualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSignUpError(null);
    setError(null);

    // Validate dates
    const v1 = validateDate(programEnd, 'programEnd', true);
    const v2 = validateDate(dsoReco, 'dsoReco', false);
    const v3 = validateDate(optEadEnd, 'optEadEnd', true);
    const v4 = validateDate(optStart, 'optStart', true);
    const v5 = validateDate(stemStart, 'stemStart', false);

    if (!v1 || !v3 || !v4) {
      setSignUpError('Please fix date errors above');
      setLoading(false);
      return;
    }

    try {
      await checkBlockedEmail(signUpEmail);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: signUpEmail.trim().toLowerCase(),
        password: signUpPassword,
        options: {
          data: {
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`.trim(),
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.session) {
        await saveExtensionProfileAndContinue();
        return;
      }

      setAwaitingEmailVerification(true);
      setVerificationCode('');
      setLoading(false);
    } catch (err: any) {
      setSignUpError(err.message || 'Sign up failed. Please try again.');
      setLoading(false);
    }
  };

  const handleVerifySignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSignUpError(null);

    try {
      const { error: verificationError } = await supabase.auth.verifyOtp({
        email: signUpEmail.trim().toLowerCase(),
        token: verificationCode.trim(),
        type: 'signup',
      });
      if (verificationError) throw verificationError;

      await saveExtensionProfileAndContinue();
    } catch (err: any) {
      setSignUpError(err.message || 'The verification code is invalid or expired.');
      setLoading(false);
    }
  };

  const handleResendSignUpVerification = async () => {
    setLoading(true);
    setSignUpError(null);

    try {
      const { error: resendError } = await supabase.auth.signUp({
        email: signUpEmail.trim().toLowerCase(),
        password: signUpPassword,
        options: {
          data: {
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`.trim(),
          },
        },
      });
      if (resendError) throw resendError;
      setVerificationCode('');
    } catch (err: any) {
      setSignUpError(err.message || 'Unable to resend the verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-background dark:via-background dark:to-background p-4">
      <div className="bg-white dark:bg-card rounded-2xl shadow-2xl p-8 max-w-lg w-full">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-foreground mb-2">
            Sign in or Create account
          </h1>
          <p className="text-gray-600 dark:text-muted-foreground">Choose your preferred method to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setTab('google')}
            disabled={loading}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition disabled:opacity-50 ${tab === 'google'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-muted text-gray-700 dark:text-foreground hover:bg-gray-200 dark:hover:bg-muted/80'
              }`}
          >
            Google
          </button>
          <button
            onClick={() => setTab('manual')}
            disabled={loading}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition disabled:opacity-50 ${tab === 'manual'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 dark:bg-muted text-gray-700 dark:text-foreground hover:bg-gray-200 dark:hover:bg-muted/80'
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
              className="w-full py-4 px-6 bg-white dark:bg-card border-2 border-gray-300 dark:border-border rounded-xl font-semibold text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-muted hover:border-gray-400 dark:hover:border-muted-foreground transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-sm"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Redirecting...
                </>
              ) : (
                <>
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
                </>
              )}
            </button>
          </div>
        )}

        {/* Manual Tab */}
        {tab === 'manual' && (
          <div className="space-y-4">
            {/* Sign In Collapsible */}
            <div className="border-2 border-gray-200 dark:border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setShowSignIn(!showSignIn)}
                disabled={loading}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-muted hover:bg-gray-100 dark:hover:bg-muted/80 transition disabled:opacity-50 flex items-center justify-between font-semibold text-gray-900 dark:text-foreground"
              >
                <span>Sign In</span>
                <span className="text-xl">{showSignIn ? '−' : '+'}</span>
              </button>
              {showSignIn && (
                <form onSubmit={handleManualSignIn} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                    />
                  </div>

                  {signInError && (
                    <p className="text-red-500 text-sm">{signInError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>
              )}
            </div>

            {/* Create Account Collapsible */}
            <div className="border-2 border-gray-200 dark:border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setShowSignUp(!showSignUp)}
                disabled={loading}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-muted hover:bg-gray-100 dark:hover:bg-muted/80 transition disabled:opacity-50 flex items-center justify-between font-semibold text-gray-900 dark:text-foreground"
              >
                <span>Create Account</span>
                <span className="text-xl">{showSignUp ? '−' : '+'}</span>
              </button>
              {showSignUp && (awaitingEmailVerification ? (
                <form onSubmit={handleVerifySignUp} className="p-6 space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground">
                      Verify your email
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-muted-foreground">
                      Enter the 6-digit code sent to {signUpEmail} to finish creating your account.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="extension-signup-code">
                      Verification code
                    </label>
                    <input
                      id="extension-signup-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      disabled={loading}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                      placeholder="123456"
                    />
                  </div>
                  {signUpError && <p className="text-red-500 text-sm">{signUpError}</p>}
                  <button
                    type="submit"
                    disabled={loading || verificationCode.length !== 6}
                    className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? 'Verifying...' : 'Verify and continue'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResendSignUpVerification}
                    disabled={loading}
                    className="w-full py-2 text-sm font-semibold text-blue-700 hover:text-blue-800 disabled:opacity-50"
                  >
                    Resend verification code
                  </button>
                </form>
              ) : (
                <form onSubmit={handleManualSignUp} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      disabled={loading}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      disabled={loading}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                    />
                  </div>

                  <div className="pt-4 border-t-2 border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      OPT Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Program End Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={programEnd}
                          onChange={(e) => setProgramEnd(formatDateInput(e.target.value))}
                          onBlur={() => validateDate(programEnd, 'programEnd', true)}
                          disabled={loading}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                          placeholder="MM/DD/YYYY"
                          maxLength={10}
                        />
                        {dateErrors.programEnd && (
                          <p className="text-xs text-red-600 mt-1">{dateErrors.programEnd}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          DSO Recommendation Date
                        </label>
                        <input
                          type="text"
                          value={dsoReco}
                          onChange={(e) => setDsoReco(formatDateInput(e.target.value))}
                          onBlur={() => validateDate(dsoReco, 'dsoReco', false)}
                          disabled={loading}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                          placeholder="MM/DD/YYYY"
                          maxLength={10}
                        />
                        {dateErrors.dsoReco && (
                          <p className="text-xs text-red-600 mt-1">{dateErrors.dsoReco}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          OPT EAD End Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={optEadEnd}
                          onChange={(e) => setOptEadEnd(formatDateInput(e.target.value))}
                          onBlur={() => validateDate(optEadEnd, 'optEadEnd', true)}
                          disabled={loading}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                          placeholder="MM/DD/YYYY"
                          maxLength={10}
                        />
                        {dateErrors.optEadEnd && (
                          <p className="text-xs text-red-600 mt-1">{dateErrors.optEadEnd}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          OPT Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={optStart}
                          onChange={(e) => setOptStart(formatDateInput(e.target.value))}
                          onBlur={() => validateDate(optStart, 'optStart', true)}
                          disabled={loading}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                          placeholder="MM/DD/YYYY"
                          maxLength={10}
                        />
                        {dateErrors.optStart && (
                          <p className="text-xs text-red-600 mt-1">{dateErrors.optStart}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          STEM Start Date
                        </label>
                        <input
                          type="text"
                          value={stemStart}
                          onChange={(e) => setStemStart(formatDateInput(e.target.value))}
                          onBlur={() => validateDate(stemStart, 'stemStart', false)}
                          disabled={loading}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                          placeholder="MM/DD/YYYY"
                          maxLength={10}
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
                          disabled={loading}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                        <label htmlFor="isStem" className="ml-2 text-sm text-gray-700">
                          I'm STEM-eligible
                        </label>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-900 flex items-start gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-700" />
                        <span>You can edit these dates later in the dashboard</span>
                      </p>
                    </div>
                  </div>

                  {signUpError && (
                    <p className="text-red-500 text-sm">{signUpError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExtensionAuthPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ExtensionAuthContent />
    </Suspense>
  );
}
