'use client';

import type { ReactNode } from 'react';
import { openPrivacySettings } from '@/lib/privacy/privacy-manager';

export const PRIVACY_SETTINGS_LABEL = 'Your Privacy Choices';

/** Persistent entry point to the privacy settings dialog (footers, menus). */
export function PrivacySettingsLink({
  className,
  children = PRIVACY_SETTINGS_LABEL,
  onClick,
}: {
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        onClick?.();
        openPrivacySettings();
      }}
    >
      {children}
    </button>
  );
}
