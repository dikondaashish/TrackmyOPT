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
          <label className="block text-sm font-medium text-foreground mb-2">
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground shadow-card placeholder:text-muted-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:bg-muted"
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground shadow-card placeholder:text-muted-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:bg-muted"
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          disabled={loading}
          className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground shadow-card placeholder:text-muted-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:bg-muted"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-3 pr-12 border border-input rounded-lg bg-background text-foreground shadow-card placeholder:text-muted-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:bg-muted"
            placeholder="••••••••"
          />
          <PasswordVisibilityButton visible={showPassword} onToggle={onTogglePassword} />
        </div>

        {password.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-muted-foreground font-medium mb-2">
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
                <span className={valid ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
                  {valid ? "✓" : "○"}
                </span>
                <span className={`ml-2 ${valid ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            required
            disabled={loading}
            className="w-full px-4 py-3 pr-12 border border-input rounded-lg bg-background text-foreground shadow-card placeholder:text-muted-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:bg-muted"
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
            className="w-4 h-4 rounded border-input text-primary accent-blue-600 focus:ring-ring focus:ring-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <label
          htmlFor="terms-checkbox"
          className="text-sm text-muted-foreground cursor-pointer select-none"
        >
          I agree to the{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-hover hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-hover hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            Terms & Conditions
          </a>
          {", "}
          <a
            href="/disclaimer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-hover hover:underline font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            Disclaimer
          </a>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || !isPasswordValid || !agreedToTerms}
        className="w-full min-h-12 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold py-3 px-4 rounded-lg shadow-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>

      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignin}
            className="text-primary hover:text-primary-hover font-medium"
          >
            sign in
          </button>
        </p>
      </div>
    </form>
  );
}
