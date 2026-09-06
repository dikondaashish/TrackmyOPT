import type { FormEvent, KeyboardEvent, MutableRefObject } from "react";

type OtpVerificationModalProps = {
  signupEmail: string;
  otpDigits: string[];
  otpInputsRef: MutableRefObject<Array<HTMLInputElement | null>>;
  otpCode: string;
  otpLoading: boolean;
  otpError: string;
  countdown: number;
  canResend: boolean;
  otpAttemptsLeft: number;
  formatTime: (seconds: number) => string;
  onDigitChange: (index: number, value: string) => void;
  onDigitKeyDown: (index: number, e: KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
  onResend: () => void;
};

export function OtpVerificationModal({
  signupEmail,
  otpDigits,
  otpInputsRef,
  otpCode,
  otpLoading,
  otpError,
  countdown,
  canResend,
  otpAttemptsLeft,
  formatTime,
  onDigitChange,
  onDigitKeyDown,
  onSubmit,
  onCancel,
  onResend,
}: OtpVerificationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-card rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600 dark:text-muted-foreground text-sm">
            We&apos;ve sent a 6-digit verification code to <strong>{signupEmail}</strong>. Please
            check your inbox and enter the code below.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex justify-between gap-2">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  otpInputsRef.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={digit}
                onChange={(e) => onDigitChange(index, e.target.value)}
                onKeyDown={(e) => onDigitKeyDown(index, e)}
                disabled={otpLoading || countdown === 0}
                className="w-10 h-12 md:w-12 md:h-14 border-2 border-gray-300 dark:border-border rounded-lg text-center text-xl md:text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white dark:bg-muted dark:text-foreground"
              />
            ))}
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm text-gray-500 dark:text-muted-foreground">
              Code expires in{" "}
              <span className="font-semibold text-gray-700 dark:text-foreground">
                {formatTime(countdown)}
              </span>
            </p>
            {otpAttemptsLeft < 5 && (
              <p className="text-xs text-gray-500 dark:text-muted-foreground">
                Attempts remaining: <span className="font-semibold">{otpAttemptsLeft}</span>
              </p>
            )}
            {countdown === 0 && (
              <p className="text-xs text-red-600 dark:text-red-400">
                Code expired. Please click &quot;Resend Code&quot; to get a new one.
              </p>
            )}
          </div>

          {otpError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
              {otpError}
            </div>
          )}

          <button
            type="submit"
            disabled={
              otpLoading || otpCode.length !== 6 || countdown === 0 || otpAttemptsLeft === 0
            }
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {otpLoading ? "Verifying..." : "Verify & Create Account"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-600 dark:text-muted-foreground hover:text-gray-800 dark:hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onResend}
              disabled={!canResend || otpLoading}
              className={`font-medium ${
                canResend
                  ? "text-blue-600 hover:text-blue-700 cursor-pointer"
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              Resend Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
