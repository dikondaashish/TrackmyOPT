'use client';

/**
 * Passcode Verify Modal
 * 
 * Unlock document vault with 6-digit passcode
 * - 3 failed attempts → 10-minute lockout
 * - Shows remaining attempts
 */

import { useState, useEffect } from 'react';

interface PasscodeVerifyModalProps {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PasscodeVerifyModal({ open, onSuccess, onCancel }: PasscodeVerifyModalProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);
  const [remainingMinutes, setRemainingMinutes] = useState<number | null>(null);

  // Update countdown for lockout
  useEffect(() => {
    if (!lockedUntil) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const lockTime = new Date(lockedUntil).getTime();
      const diff = lockTime - now;

      if (diff <= 0) {
        setLockedUntil(null);
        setRemainingMinutes(null);
        setError('');
      } else {
        setRemainingMinutes(Math.ceil(diff / 60000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (passcode.length !== 6) {
      setError('Passcode must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/documents/passcode/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          // Locked out
          setLockedUntil(data.lockedUntil);
          setRemainingMinutes(data.remainingMinutes);
          setError(`Too many failed attempts. Locked for ${data.remainingMinutes} minutes.`);
        } else if (res.status === 401) {
          // Wrong passcode
          setError(data.error || 'Invalid passcode');
          setRemainingAttempts(data.remainingAttempts);
        } else {
          throw new Error(data.error || 'Verification failed');
        }
        setPasscode('');
        return;
      }

      // Success!
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setPasscode('');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const isLocked = lockedUntil && remainingMinutes && remainingMinutes > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* Icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          isLocked ? 'bg-red-100' : 'bg-cyan-100'
        }`}>
          {isLocked ? (
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">
          {isLocked ? '🔒 Account Locked' : 'Unlock Document Vault'}
        </h2>
        <p className="text-gray-600 text-center mb-6">
          {isLocked 
            ? `Too many failed attempts. Try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`
            : 'Enter your 6-digit passcode to continue'
          }
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Passcode Input */}
          <div>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
              disabled={isLocked || loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="● ● ● ● ● ●"
              autoFocus
              autoComplete="off"
              name="document-passcode"
              data-lpignore="true"
              data-form-type="other"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
              {remainingAttempts !== null && remainingAttempts > 0 && !isLocked && (
                <div className="mt-2 font-medium">
                  {remainingAttempts} {remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining
                </div>
              )}
            </div>
          )}

          {/* Info */}
          {!error && (
            <div className="text-xs text-gray-500 text-center">
              You have 3 attempts before a 10-minute lockout
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isLocked || passcode.length !== 6}
              className="flex-1 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Unlock'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

