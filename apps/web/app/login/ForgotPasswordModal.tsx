import type { FormEvent } from "react";

type ForgotPasswordModalProps = {
  resetEmail: string;
  resetLoading: boolean;
  resetSuccess: boolean;
  error: string | null;
  onEmailChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
};

export function ForgotPasswordModal({
  resetEmail,
  resetLoading,
  resetSuccess,
  error,
  onEmailChange,
  onSubmit,
  onClose,
}: ForgotPasswordModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-card rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 dark:text-muted-foreground hover:text-gray-600 dark:hover:text-foreground"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">
          Reset Password
        </h2>
        <p className="text-gray-600 dark:text-muted-foreground mb-6">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        {resetSuccess ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
            ✓ Password reset link sent! Check your email.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                required
                disabled={resetLoading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white dark:bg-muted dark:text-foreground"
                placeholder="your@email.com"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={resetLoading}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-border rounded-lg text-gray-700 dark:text-foreground font-medium hover:bg-gray-50 dark:hover:bg-muted transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resetLoading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
