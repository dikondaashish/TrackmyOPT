'use client';

/**
 * Passcode Setup Modal
 * 
 * First-time setup for 6-digit passcode protection
 */

import { useState } from 'react';

interface PasscodeSetupModalProps {
  open: boolean;
  onComplete: () => void;
}

export function PasscodeSetupModal({ open, onComplete }: PasscodeSetupModalProps) {
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validation
    if (passcode.length !== 6) {
      setError('Passcode must be exactly 6 digits');
      return;
    }

    if (!/^\d{6}$/.test(passcode)) {
      setError('Passcode must contain only numbers');
      return;
    }

    if (passcode !== confirmPasscode) {
      setError('Passcodes do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/documents/passcode/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to set passcode');
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set passcode');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* Icon */}
        <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">Secure Your Document Vault</h2>
        <p className="text-gray-600 text-center mb-6">
          Set up a 6-digit passcode to protect your documents
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Passcode Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Passcode
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="● ● ● ● ● ●"
              required
            />
          </div>

          {/* Confirm Passcode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Passcode
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="● ● ● ● ● ●"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Security Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 text-sm mb-2">🔒 Security Tips:</h4>
            <ul className="text-blue-700 text-xs space-y-1">
              <li>• Use a unique 6-digit code</li>
              <li>• Don't use obvious numbers (123456, birth year, etc.)</li>
              <li>• You'll have 3 attempts before 10-minute lockout</li>
              <li>• Keep your passcode safe - we cannot recover it</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || passcode.length !== 6 || confirmPasscode.length !== 6}
            className="w-full py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Setting up...
              </span>
            ) : (
              'Set Passcode'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

