import type { FormEvent } from "react";
import { PasswordVisibilityButton } from "./PasswordVisibilityButton";

type SignInFormProps = {
  email: string;
  password: string;
  rememberMe: boolean;
  showPassword: boolean;
  loading: boolean;
  lastUsedMethod: "email" | "google" | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberMeChange: (value: boolean) => void;
  onTogglePassword: () => void;
  onSubmit: (e: FormEvent) => void;
  onForgotPassword: () => void;
  onGoogleSignIn: () => void;
  onSwitchToSignup: () => void;
};

export function SignInForm({
  email,
  password,
  rememberMe,
  showPassword,
  loading,
  lastUsedMethod,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
  onTogglePassword,
  onSubmit,
  onForgotPassword,
  onGoogleSignIn,
  onSwitchToSignup,
}: SignInFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-2">
          Enter your email address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-muted bg-white dark:bg-muted dark:text-foreground"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-2">
          Enter your password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-muted bg-white dark:bg-muted dark:text-foreground"
            placeholder="••••••••"
          />
          <PasswordVisibilityButton visible={showPassword} onToggle={onTogglePassword} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => onRememberMeChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-foreground">Remember me</span>
        </label>
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Forgot password?
        </button>
      </div>

      <div className="relative">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
        {lastUsedMethod === "email" && (
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
            Last used
          </span>
        )}
      </div>

      <div className="relative my-5 lg:my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 dark:bg-background text-gray-500 dark:text-muted-foreground">
            or login with
          </span>
        </div>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={onGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-card border-2 border-gray-300 dark:border-border hover:border-gray-400 dark:hover:border-muted-foreground text-gray-700 dark:text-foreground font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
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
          Google
        </button>
        {lastUsedMethod === "google" && (
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
            Last used
          </span>
        )}
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600 dark:text-muted-foreground">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            create account
          </button>
        </p>
      </div>

      <div className="text-center mt-4">
        <p className="text-xs text-gray-500 dark:text-muted-foreground">
          <a href="/privacy" className="hover:text-blue-600">
            Privacy Policy
          </a>
          {" · "}
          <a href="/terms" className="hover:text-blue-600">
            Terms & Conditions
          </a>
        </p>
      </div>
    </form>
  );
}
