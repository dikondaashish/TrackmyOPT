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
      <div className="bg-card border border-border rounded-xl shadow-elevated max-w-md w-full p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

        <h2 className="text-2xl font-bold text-foreground mb-2">
          Reset Password
        </h2>
        <p className="text-muted-foreground mb-6">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        {resetSuccess ? (
          <div className="rounded-lg border-l-4 border-l-emerald-500 bg-emerald-50 p-4 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            ✓ Password reset link sent! Check your email.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                required
                disabled={resetLoading}
                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground shadow-card placeholder:text-muted-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:bg-muted"
                placeholder="your@email.com"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg border-l-4 border-l-red-500 bg-red-50 text-red-700 text-sm dark:bg-red-950 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={resetLoading}
                className="flex-1 min-h-12 px-4 py-3 border border-input bg-background rounded-lg text-foreground font-medium shadow-card hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resetLoading}
                className="flex-1 min-h-12 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold shadow-button hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
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
