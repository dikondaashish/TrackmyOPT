/**
 * Shared shapes for the settings screen and its per-tab components.
 */

export type SettingsTab =
  | 'profile'
  | 'security'
  | 'documents'
  | 'notifications'
  | 'privacy'
  | 'extension'
  | 'subscription';

export interface UserProfile {
  email: string;
  fullName: string;
  timezone: string;
  notificationEmail: string;
  authProvider?: string;
  degreeLevel: string | null;
  majorName: string | null;
  isStemEligible: boolean;
}

export interface PremiumStatus {
  isPremium: boolean;
  planName?: string;
  expiresAt?: string;
}

export interface CaseStatusSettings {
  receiptNumber: string;
  autoCheckFrequency: 'hourly' | 'daily' | 'weekly' | 'manual';
  notifyOnChange: boolean;
}

export interface DocumentSettings {
  hasPasscode: boolean;
  /** minutes */
  autoLockTimeout: number;
  /** minutes; applied after 3 failed attempts */
  lockoutDuration: number;
}

export interface ExtensionStatus {
  isConnected: boolean;
  lastSyncTime: string | null;
  version?: string;
}
