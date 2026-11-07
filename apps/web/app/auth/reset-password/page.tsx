'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

const INVALID_RESET_LINK_MESSAGE =
  'This password reset link is invalid or expired. Request a new link and open it in the same browser.';

type RecoveryStatus = 'checking' | 'ready' | 'invalid';

function resetErrorMessage(error: unknown) {
  if (
    error instanceof Error &&
    (error.name === 'AuthSessionMissingError' || /auth session missing/i.test(error.message))
  ) {
    return INVALID_RESET_LINK_MESSAGE;
  }

  return error instanceof Error
    ? error.message
    : 'Failed to reset password. Please try again.';
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState<RecoveryStatus>('checking');

  useEffect(() => {
    let active = true;

    async function verifyRecoverySession() {
      const url = new URL(window.location.href);
      const hashParams = new URLSearchParams(url.hash.slice(1));
      const callbackError =
        url.searchParams.get('error_description') || hashParams.get('error_description');

      if (callbackError) {
        if (active) {
          setRecoveryStatus('invalid');
          setError(INVALID_RESET_LINK_MESSAGE);
        }
        return;
      }

      // createBrowserClient completes Supabase's PKCE/hash callback during its
      // initialization. getSession waits for that initialization to finish.
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (!active) return;

      if (sessionError || !data.session) {
        setRecoveryStatus('invalid');
        setError(INVALID_RESET_LINK_MESSAGE);
        return;
      }

      setRecoveryStatus('ready');
      setError(null);
    }

    void verifyRecoverySession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!success) return;

    const redirectTimer = window.setTimeout(() => {
      router.push('/');
    }, 3000);

    return () => window.clearTimeout(redirectTimer);
  }, [router, success]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (recoveryStatus !== 'ready') {
      setError(INVALID_RESET_LINK_MESSAGE);
      return;
    }

    setLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(resetErrorMessage(err));
      if (
        err instanceof Error &&
        (err.name === 'AuthSessionMissingError' || /auth session missing/i.test(err.message))
      ) {
        setRecoveryStatus('invalid');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="bg-card border border-border rounded-xl shadow-elevated p-6 sm:p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-300" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Password Reset Successful!</h1>
            <p className="text-muted-foreground mb-4">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to home page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="bg-card border border-border rounded-xl shadow-elevated p-6 sm:p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Reset Your Password</h1>
          <p className="text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-lg border-l-4 border-l-red-500 bg-red-50 text-red-700 text-sm dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </div>
        )}

        <form onSubmit={handlePasswordReset} className="space-y-4" method="post">
          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-foreground mb-2"
            >
              New Password
            </label>
            <input
              type="password"
              name="new-password"
              id="new-password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || recoveryStatus !== 'ready'}
              minLength={6}
              className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground shadow-card placeholder:text-muted-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:bg-muted"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-muted-foreground">Must be at least 6 characters</p>
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirm-password"
              id="confirm-password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || recoveryStatus !== 'ready'}
              minLength={6}
              className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground shadow-card placeholder:text-muted-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:bg-muted"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || recoveryStatus !== 'ready'}
            className="w-full min-h-12 py-3 px-4 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold rounded-lg shadow-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {recoveryStatus === 'checking'
              ? 'Verifying Reset Link...'
              : loading
                ? 'Resetting Password...'
                : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          {recoveryStatus === 'invalid' && (
            <Link
              href="/login"
              className="block mb-3 text-sm text-primary hover:text-primary-hover font-medium"
            >
              Request a new reset link
            </Link>
          )}
          <Link
            href="/"
            className="text-sm text-primary hover:text-primary-hover font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
