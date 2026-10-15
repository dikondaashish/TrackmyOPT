'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  closePrivacySettings,
  saveConsent,
  takePrivacySettingsOpener,
} from '@/lib/privacy/privacy-manager';
import { servicesInCategory } from '@/lib/privacy/services';
import type {
  ConsentCategory,
  ConsentChoices,
  OptionalConsentCategory,
  PrivacySnapshot,
} from '@/lib/privacy/types';
import { usePrivacy } from '@/components/privacy/use-privacy';

const CATEGORY_COPY: Record<ConsentCategory, { title: string; description: string }> = {
  essential: {
    title: 'Essential',
    description:
      'Needed for sign-in, security, payments, error monitoring, and remembering these choices. Always on.',
  },
  functional: {
    title: 'Functional',
    description:
      'Small conveniences, like remembering a referral link or the sign-in method you used last.',
  },
  analytics: {
    title: 'Analytics',
    description:
      'Helps us understand which pages and features are used so we can improve them.',
  },
  marketing: {
    title: 'Marketing',
    description:
      'Lets Google show ads on free articles, which may use cookies to choose and measure ads.',
  },
};

const buttonBase =
  'min-h-11 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900';
const primaryButton = `${buttonBase} bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500`;
const secondaryButton = `${buttonBase} border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 focus-visible:ring-gray-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-gray-100 dark:hover:bg-zinc-800`;

function CategoryRow({
  category,
  checked,
  locked,
  note,
  onChange,
}: {
  category: ConsentCategory;
  checked: boolean;
  locked: boolean;
  note?: string;
  onChange?: (checked: boolean) => void;
}) {
  const id = useId();
  const copy = CATEGORY_COPY[category];
  const services = servicesInCategory(category).map((service) => service.name);
  return (
    <li className="rounded-xl border border-gray-200 p-4 dark:border-zinc-700">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <label htmlFor={id} className="text-sm font-semibold text-gray-900 dark:text-white">
            {copy.title}
          </label>
          <p id={`${id}-description`} className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {copy.description}
          </p>
          {services.length > 0 ? (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Used for: {services.join(', ')}
            </p>
          ) : null}
          {note ? (
            <p className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-200">{note}</p>
          ) : null}
        </div>
        <div className="flex min-h-11 shrink-0 items-center gap-2">
          {locked ? (
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400" aria-hidden>
              {checked ? 'Always on' : 'Off'}
            </span>
          ) : null}
          <Switch
            id={id}
            checked={checked}
            disabled={locked}
            onCheckedChange={onChange}
            aria-describedby={`${id}-description`}
          />
        </div>
      </div>
    </li>
  );
}

function SettingsForm({ privacy }: { privacy: PrivacySnapshot }) {
  // Mounted on each open, so the draft starts from the current permissions.
  const [draft, setDraft] = useState<ConsentChoices>(privacy.choices);
  const setCategory = (category: OptionalConsentCategory) => (checked: boolean) =>
    setDraft((current) => ({ ...current, [category]: checked }));

  const marketingNote = privacy.gpc
    ? 'Your browser’s Global Privacy Control signal is on, so marketing stays off.'
    : privacy.region === 'US'
      ? 'Turning this off opts you out of “sale” or “sharing” of personal information for targeted ads, as some U.S. state laws define those terms.'
      : undefined;

  return (
    <>
      <ul className="mt-4 space-y-3">
        <CategoryRow category="essential" checked locked />
        <CategoryRow
          category="functional"
          checked={draft.functional}
          locked={false}
          onChange={setCategory('functional')}
        />
        <CategoryRow
          category="analytics"
          checked={draft.analytics}
          locked={false}
          onChange={setCategory('analytics')}
        />
        <CategoryRow
          category="marketing"
          checked={draft.marketing && !privacy.gpc}
          locked={privacy.gpc}
          note={marketingNote}
          onChange={setCategory('marketing')}
        />
      </ul>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
        <button
          type="button"
          className={secondaryButton}
          onClick={() =>
            saveConsent({ functional: false, analytics: false, marketing: false }, 'reject_all')
          }
        >
          Reject non-essential
        </button>
        <button
          type="button"
          className={secondaryButton}
          onClick={() =>
            saveConsent({ functional: true, analytics: true, marketing: true }, 'accept_all')
          }
        >
          Accept all
        </button>
        <button
          type="button"
          className={primaryButton}
          onClick={() => saveConsent(draft, 'custom')}
        >
          Save choices
        </button>
      </div>
    </>
  );
}

/** Second-layer settings, reopened from "Your Privacy Choices" anywhere on the site. */
export function PrivacySettingsDialog() {
  const privacy = usePrivacy();
  const open = privacy.status === 'ready' && privacy.settingsOpen;
  const wasOpen = useRef(false);

  // Runs after the shared Dialog's own cleanup, so this focus wins.
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    const opener = takePrivacySettingsOpener();
    if (opener?.isConnected) opener.focus();
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) closePrivacySettings();
      }}
    >
      <DialogContent
        aria-labelledby="privacy-settings-title"
        aria-describedby="privacy-settings-description"
        className="max-w-xl bg-white p-6 dark:bg-zinc-900"
      >
        <DialogHeader className="pr-8">
          <DialogTitle id="privacy-settings-title" className="text-gray-900 dark:text-white">
            Your Privacy Choices
          </DialogTitle>
          <DialogDescription
            id="privacy-settings-description"
            className="text-gray-600 dark:text-gray-300"
          >
            Choose which optional technologies TrackMyOPT may use. Essential
            technology always stays on so the site works.{' '}
            <Link
              href="/cookie-policy"
              className="font-medium text-blue-700 underline-offset-2 hover:underline dark:text-blue-300"
              onClick={closePrivacySettings}
            >
              Cookie Policy
            </Link>
          </DialogDescription>
        </DialogHeader>
        <SettingsForm privacy={privacy} />
      </DialogContent>
    </Dialog>
  );
}
