'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { LoginPostHogIdentify } from '@/components/analytics/LoginPostHogIdentify';
import {
  captureUserSignedIn,
  captureUserSignedUp,
  identifyLoginSessionUser,
} from '@/lib/posthog-client';
import { safeInternalRedirectTarget } from '@/lib/auth/safe-oauth-redirect';
import {
  safeStorageGet,
  safeStorageRemove,
  safeStorageSet,
} from "@/lib/safe-storage";
import { OtpVerificationModal } from './OtpVerificationModal';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { LoginImageCarousel } from './LoginImageCarousel';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

type Mode = 'signin' | 'signup';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  // Middleware sets returnTo; some links use redirect. Never send a completed
  // login to an untrusted origin supplied in the query string.
  const requestedRedirect =
    searchParams.get('redirect') || searchParams.get('returnTo');
  const safeRedirect = safeInternalRedirectTarget(
    requestedRedirect,
    typeof window === 'undefined'
      ? 'https://www.trackmyopt.com'
      : window.location.origin
  );
  const redirectTo = `${safeRedirect.pathname}${safeRedirect.search}${safeRedirect.hash}`;

  const [mode, setMode] = useState<Mode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorParam);
  const [rememberMe, setRememberMe] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // OTP Verification
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(180); // 3 minutes = 180 seconds
  const [canResend, setCanResend] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [otpAttemptsLeft, setOtpAttemptsLeft] = useState(5);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [lastUsedMethod, setLastUsedMethod] = useState<'email' | 'google' | null>(null);

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sign In/Up Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Password validation
  const validatePassword = (pwd: string) => ({
    hasMinLength: pwd.length >= 8,
    hasUpperCase: /[A-Z]/.test(pwd),
    hasLowerCase: /[a-z]/.test(pwd),
    hasNumber: /\d/.test(pwd),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  });

  const passwordCriteria = validatePassword(password);
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  // Load saved email and last used method on mount
  useEffect(() => {
    const savedEmail = safeStorageGet('trackmyopt_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    const savedMethod = safeStorageGet('trackmyopt_last_method') as 'email' | 'google' | null;
    if (savedMethod) {
      setLastUsedMethod(savedMethod);
    }
  }, []);

  // Countdown timer for OTP. The updater only decrements — queueing another
  // setState from inside it is impure and can trip React's update-depth guard.
  useEffect(() => {
    if (!showOTPModal || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [showOTPModal, countdown]);

  // Resend unlocks once the countdown drains.
  useEffect(() => {
    if (showOTPModal && countdown === 0) setCanResend(true);
  }, [showOTPModal, countdown]);

  // Format countdown as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-scroll images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    // Derive both values up front: a state updater must stay pure, so it cannot
    // queue setOtpCode from inside setOtpDigits.
    const next = [...otpDigits];
    next[index] = digit;
    setOtpDigits(next);
    setOtpCode(next.join(''));

    if (digit && index < 5) {
      const nextInput = otpInputsRef.current[index + 1];
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = otpInputsRef.current[index - 1];
      prevInput?.focus();
    }
  };

  // Don't auto-redirect if already logged in - let user choose
  // This prevents redirect loops if session check is inconsistent

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    // Safety timeout: if OAuth doesn't complete (user closes popup, etc.),
    // reset loading state and show a friendly message.
    const timeoutId = window.setTimeout(() => {
      setLoading(false);
      setError('Google sign-in did not complete. Please try again.');
    }, 60000);

    // Save last used method
    safeStorageSet('trackmyopt_last_method', 'google');

    try {
      // Include referral code in the callback URL so the server-side callback can attribute it
      const refCode = safeStorageGet('trackmyopt_ref');
      let redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;
      if (refCode) {
        redirectUrl += `&ref=${encodeURIComponent(refCode)}`;
      }

      // Use auth callback route for proper session handling
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (oauthError) {
        throw oauthError;
      }

      // Clear referral code from localStorage (will be handled server-side)
      if (refCode) {
        safeStorageRemove('trackmyopt_ref');
      }

      // OAuth will redirect automatically, don't set loading to false
      window.clearTimeout(timeoutId);
    } catch (err: any) {
      window.clearTimeout(timeoutId);
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check if email is blocked (previously deleted account)
      const blockedRes = await fetch('/api/auth/check-blocked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const blockedData = await blockedRes.json();

      if (blockedData.blocked) {
        throw new Error('This email has been permanently blocked. Previously deleted accounts cannot be recreated or used to sign in.');
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      if (data.user) {
        identifyLoginSessionUser(data.user);
        captureUserSignedIn({ provider: 'email' });
      }

      // Save email if remember me
      if (rememberMe) {
        safeStorageSet('trackmyopt_remember_email', email);
      } else {
        safeStorageRemove('trackmyopt_remember_email');
      }

      // Save last used method
      safeStorageSet('trackmyopt_last_method', 'email');

      // Redirect to intended page or dashboard - session is now in cookies
      window.location.href = redirectTo;
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setError(null);

    try {
      // Validate email format first
      if (!resetEmail || !resetEmail.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Send reset request via server API. Do not rely on profiles table existence.
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail.trim().toLowerCase() }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to send reset link');
      }

      // Success
      setResetSuccess(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSuccess(false);
        setResetEmail('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpLoading(true);
    setOtpError('');

    try {
      // Resend OTP by calling signUp again
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password, // Use the same password
        options: {
          data: {
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) throw error;

      // Reset timer and attempts
      setCountdown(180);
      setCanResend(false);
      setOtpError('');
      setOtpAttemptsLeft(5);
      setOtpCode('');
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err: any) {
      setOtpError(err.message || 'Failed to resend code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError('');

    try {
      // Verify OTP token
      const { data, error } = await supabase.auth.verifyOtp({
        email: signupEmail,
        token: otpCode,
        type: 'signup',
      });

      if (error) throw error;

      const refCode = safeStorageGet('trackmyopt_ref');

      if (data.user) {
        identifyLoginSessionUser(data.user);
        captureUserSignedUp({
          provider: 'email',
          ...(refCode ? { referred_by: refCode } : {}),
        });

        // The user checked the signup Terms/Privacy acknowledgement before
        // creating this account. Persist the current versions after the OTP
        // creates a session; a new account should not see the update modal.
        await fetch('/api/policy/consent', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consentMethod: 'signup_checkbox',
            recordSignupAcceptance: true,
          }),
        }).catch(() => undefined);
      }

      // Track referral signup if we have a code
      if (refCode) {
        fetch('/api/referral/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: refCode }),
        }).catch(() => { }); // fire-and-forget
        safeStorageRemove('trackmyopt_ref');
      }

      // Redirect to intended page or dashboard
      window.location.href = redirectTo;
    } catch (err: any) {
      const baseMessage = err.message || 'Invalid or expired code. Please try again.';
      setOtpAttemptsLeft((prev) => {
        const next = Math.max(prev - 1, 0);
        const suffix =
          next > 0
            ? ` (${next} attempts left)`
            : ' (No attempts left, please resend a new code.)';
        setOtpError(baseMessage + suffix);
        return next;
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isPasswordValid) {
      setError('Password does not meet all security criteria');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Check if email is blocked (previously deleted account)
      const blockedRes = await fetch('/api/auth/check-blocked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const blockedData = await blockedRes.json();

      if (blockedData.blocked) {
        throw new Error('This email has been permanently blocked. Previously deleted accounts cannot be recreated.');
      }

      // Capture referral code from localStorage (set by ReferralCapture component)
      const refCode = safeStorageGet('trackmyopt_ref');

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
            ...(refCode ? { referral_code: refCode } : {}),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }


      // Show OTP modal
      setSignupEmail(email);
      setShowOTPModal(true);
      setCountdown(180); // Reset to 3 minutes
      setCanResend(false);
      setLoading(false);
    } catch (err: any) {
      // ISS-008: map common Supabase signup errors to friendly copy
      const raw = String(err?.message || '').toLowerCase();
      let friendly = err?.message || 'Sign up failed. Please try again.';
      if (raw.includes('already registered') || raw.includes('user already exists') || raw.includes('email already')) {
        friendly = 'An account already exists with this email. Try signing in instead, or use "Forgot password" to reset it.';
      } else if (raw.includes('weak password') || raw.includes('password should be')) {
        friendly = 'Password is too weak. Use at least 8 characters with a mix of letters and numbers.';
      } else if (raw.includes('rate limit') || raw.includes('too many')) {
        friendly = 'Too many signup attempts. Please wait a few minutes and try again.';
      } else if (raw.includes('invalid email')) {
        friendly = 'That email address looks invalid. Double-check it and try again.';
      } else if (raw.includes('network') || raw.includes('fetch')) {
        friendly = 'Connection issue. Check your internet and try again.';
      }
      setError(friendly);
      setLoading(false);
    }
  };

  const images = [
    {
      title: 'Track Your OPT Timeline',
      description: 'Track filing windows, unemployment days, and STEM deadlines with daily reminders',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Calculate Filing Windows',
      description: 'Know exactly when to apply for OPT and STEM extension',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Stay Compliant',
      description: 'Automatic reminders for unemployment days and deadlines',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-background">
      {showOTPModal && (
        <OtpVerificationModal
          signupEmail={signupEmail}
          otpDigits={otpDigits}
          otpInputsRef={otpInputsRef}
          otpCode={otpCode}
          otpLoading={otpLoading}
          otpError={otpError}
          countdown={countdown}
          canResend={canResend}
          otpAttemptsLeft={otpAttemptsLeft}
          formatTime={formatTime}
          onDigitChange={handleOtpDigitChange}
          onDigitKeyDown={handleOtpKeyDown}
          onSubmit={handleVerifyOTP}
          onCancel={() => {
            setShowOTPModal(false);
            setOtpCode('');
            setOtpError('');
          }}
          onResend={handleResendOTP}
        />
      )}

      {showForgotPassword && (
        <ForgotPasswordModal
          resetEmail={resetEmail}
          resetLoading={resetLoading}
          resetSuccess={resetSuccess}
          error={error}
          onEmailChange={setResetEmail}
          onSubmit={handleForgotPassword}
          onClose={() => {
            setShowForgotPassword(false);
            setError(null);
            setResetEmail('');
          }}
        />
      )}

      <LoginImageCarousel
        images={images}
        currentImageIndex={currentImageIndex}
        onSelectIndex={setCurrentImageIndex}
      />

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobile only: single hero (avoid duplicate TrackMyOPT + tighter visual hierarchy) */}
          <div className="mb-6 space-y-3 text-center lg:hidden">
            <div className="mx-auto flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-2xl bg-[#226BE7] shadow-md shadow-[#226BE7]/35 ring-1 ring-white/25 dark:bg-[#226BE7] dark:shadow-[#226BE7]/25 dark:ring-white/15">
              <Image
                src="/TrackMyOPT Logo/logo.gif"
                alt="TrackMyOPT"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
                unoptimized
              />
            </div>
            <h1 className="text-[1.625rem] font-bold tracking-tight text-gray-900 dark:text-foreground">
              TrackMyOPT
            </h1>
            <p className="text-sm font-semibold text-[#226BE7] dark:text-blue-300">
              Your OPT Timeline Companion
            </p>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-zinc-400">
              Calculate filing windows, track unemployment days, and get reminders.
            </p>
          </div>

          {/* Desktop only: unchanged copy & layout */}
          <div className="mb-8 hidden lg:block">
            <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-foreground">
              TrackMyOPT
            </h2>
            <p className="text-gray-600 dark:text-muted-foreground">
              Calculate filing windows, track unemployment days, and get reminders.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {mode === 'signin' && (
            <SignInForm
              email={email}
              password={password}
              rememberMe={rememberMe}
              showPassword={showPassword}
              loading={loading}
              lastUsedMethod={lastUsedMethod}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onRememberMeChange={setRememberMe}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onSubmit={handleSignIn}
              onForgotPassword={() => {
                setShowForgotPassword(true);
                setResetEmail(email);
                setError(null);
              }}
              onGoogleSignIn={handleGoogleSignIn}
              onSwitchToSignup={() => {
                setMode('signup');
                setError(null);
                setPassword('');
                setConfirmPassword('');
              }}
            />
          )}

          {mode === 'signup' && (
            <SignUpForm
              firstName={firstName}
              lastName={lastName}
              email={email}
              password={password}
              confirmPassword={confirmPassword}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              agreedToTerms={agreedToTerms}
              passwordCriteria={passwordCriteria}
              isPasswordValid={isPasswordValid}
              loading={loading}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
              onAgreedToTermsChange={setAgreedToTerms}
              onSubmit={handleSignUp}
              onSwitchToSignin={() => {
                setMode('signin');
                setError(null);
                setPassword('');
                setConfirmPassword('');
                setAgreedToTerms(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginPostHogIdentify />
      <LoginPageContent />
    </Suspense>
  );
}
