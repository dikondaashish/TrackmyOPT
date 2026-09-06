"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PrivateAnswersField,
} from "./PrivateAnswersField";
import type {
  DefaultJobPortalLoginForm,
  LegacyJobPortalLogin,
} from "./private-application-answers-form";

export function DefaultJobPortalLoginPanel({
  login,
  legacyJobPortalLogins,
  onUpdate,
  onChooseLegacy,
  onDiscardLegacy,
}: {
  login: DefaultJobPortalLoginForm;
  legacyJobPortalLogins: LegacyJobPortalLogin[];
  onUpdate: (
    key: keyof DefaultJobPortalLoginForm
  ) => React.ChangeEventHandler<HTMLInputElement>;
  onChooseLegacy: (login: LegacyJobPortalLogin) => void;
  onDiscardLegacy: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-white/80 p-4 dark:border-red-950 dark:bg-zinc-950/50">
      <h4 className="text-sm font-semibold">
        Default job-portal login
      </h4>
      <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-600 dark:text-gray-400">
        TrackMyOPT will offer this same login across all third-party job
        portals where you choose Review, then Approve. It is never filled
        silently, and credential prefill never clicks Login, Continue,
        Next, Create Account, or Submit.
      </p>
      <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs leading-5 text-red-800 dark:bg-red-950/30 dark:text-red-300">
        Using the same password across unrelated employers and hiring
        systems creates a security risk if any one portal is compromised.
        Only save this login if you understand that tradeoff. Do not
        enter your TrackMyOPT password. TrackMyOPT does not generate,
        reset, or verify employer passwords.
      </p>

      {legacyJobPortalLogins.length > 0 && (
        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
            Action required for your older saved logins
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-800 dark:text-amber-300">
            For safety, none of your older site-specific logins will be
            used across all portals automatically. Choose one below as
            the new default, enter a new default, or discard the older
            login entries.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {legacyJobPortalLogins.map((legacy) => (
              <Button
                key={`${legacy.hostname}:${legacy.email}`}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChooseLegacy(legacy)}
              >
                Use {legacy.email} as default
              </Button>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDiscardLegacy}
            >
              Do not use older logins
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PrivateAnswersField label="Default login email">
          <Input
            type="email"
            value={login.email}
            onChange={onUpdate("email")}
            placeholder="you@example.com"
            autoComplete="username"
            spellCheck={false}
          />
        </PrivateAnswersField>
        <div className="hidden sm:block" aria-hidden="true" />
        <PrivateAnswersField label="Default password">
          <Input
            type="password"
            value={login.password}
            onChange={onUpdate("password")}
            minLength={8}
            maxLength={256}
            autoComplete="new-password"
            data-sensitive="true"
          />
        </PrivateAnswersField>
        <PrivateAnswersField label="Default password (re-enter)">
          <Input
            type="password"
            value={login.passwordConfirmation}
            onChange={onUpdate("passwordConfirmation")}
            minLength={8}
            maxLength={256}
            autoComplete="new-password"
            data-sensitive="true"
          />
        </PrivateAnswersField>
      </div>
      <p className="mt-3 text-xs leading-5 text-gray-500 dark:text-gray-400">
        Employer portals may require at least 8 characters, uppercase,
        lowercase, a number, and a special character. TrackMyOPT stores
        the password you provide; each employer portal decides its
        actual password rules.
      </p>
    </div>
  );
}
