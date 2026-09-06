import type { FormEvent } from "react";
import { PasswordVisibilityButton } from "./PasswordVisibilityButton";

type PasswordCriteria = {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
};

type SignUpFormProps = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  agreedToTerms: boolean;
  passwordCriteria: PasswordCriteria;
  isPasswordValid: boolean;
  loading: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onAgreedToTermsChange: (value: boolean) => void;
  onSubmit: (e: FormEvent) => void;
  onSwitchToSignin: () => void;
};

export function SignUpForm({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  agreedToTerms,
  passwordCriteria,
  isPasswordValid,
  loading,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onAgreedToTermsChange,
  onSubmit,
  onSwitchToSignin,
}: SignUpFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-2">
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-muted bg-white dark:bg-muted dark:text-foreground"
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-muted bg-white dark:bg-muted dark:text-foreground"
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-2">
          Email
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
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

        {password.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-600 dark:text-muted-foreground font-medium mb-2">
              Password must contain:
            </p>
            {[
              { label: "At least 8 characters", valid: passwordCriteria.hasMinLength },
              { label: "One uppercase letter (A-Z)", valid: passwordCriteria.hasUpperCase },
              { label: "One lowercase letter (a-z)", valid: passwordCriteria.hasLowerCase },
              { label: "One number (0-9)", valid: passwordCriteria.hasNumber },
              {
                label: "One special character (!@#$%^&*...)",
                valid: passwordCriteria.hasSpecialChar,
              },
            ].map(({ label, valid }) => (
              <div key={label} className="flex items-center text-xs">
                <span className={valid ? "text-green-600" : "text-gray-400"}>
                  {valid ? "✓" : "○"}
                </span>
                <span className={`ml-2 ${valid ? "text-green-600" : "text-gray-500"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-foreground mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-muted bg-white dark:bg-muted dark:text-foreground"
            placeholder="••••••••"
          />
          <PasswordVisibilityButton
            visible={showConfirmPassword}
            onToggle={onToggleConfirmPassword}
          />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex items-center h-5 mt-0.5">
          <input
            id="terms-checkbox"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => onAgreedToTermsChange(e.target.checked)}
            disabled={loading}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <label
          htmlFor="terms-checkbox"
          className="text-sm text-gray-600 dark:text-muted-foreground cursor-pointer select-none"
        >
          I agree to the{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            Terms & Conditions
          </a>
          {", "}
          <a
            href="/disclaimer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            Disclaimer
          </a>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || !isPasswordValid || !agreedToTerms}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600 dark:text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignin}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            sign in
          </button>
        </p>
      </div>
    </form>
  );
}
