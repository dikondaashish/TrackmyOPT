"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User,
  Mail,
  Bell,
  Moon,
  Sun,
  Shield,
  Loader2,
  Check,
  AlertCircle,
  LogOut,
  Trash2,
  Key,
  Globe,
  Lock,
  Palette,
  Download,
  Chrome,
  Link2,
  Clock,
  RefreshCw,
  Smartphone,
  Database,
  Eye,
  EyeOff,
  Unlink,
  Activity,
  History,
  ShieldCheck,
  CreditCard,
  ChevronDown,
  ChevronUp,
  HelpCircle
} from "lucide-react";
import { BillingHistory } from "./BillingHistory";
import { SubscriptionUsage } from "./SubscriptionUsage";

import { SubscriptionFAQ } from "./SubscriptionFAQ";
import { PlanComparisonModal } from "./PlanComparisonModal";


// Tab types
type SettingsTab = 'profile' | 'security' | 'documents' | 'notifications' | 'privacy' | 'extension' | 'appearance' | 'subscription';

interface UserProfile {
  email: string;
  fullName: string;
  timezone: string;
  notificationEmail: string;
  authProvider?: string;
}

interface PremiumStatus {
  isPremium: boolean;
  planName?: string;
  expiresAt?: string;
}

interface CaseStatusSettings {
  receiptNumber: string;
  autoCheckFrequency: 'hourly' | 'daily' | 'weekly' | 'manual';
  notifyOnChange: boolean;
}

interface DocumentSettings {
  hasPasscode: boolean;
  autoLockTimeout: number; // in minutes
  lockoutDuration: number; // in minutes - lockout after 3 failed attempts
}

interface ExtensionStatus {
  isConnected: boolean;
  lastSyncTime: string | null;
  version?: string;
}

export function SettingsSection() {
  // Get URL search params to handle tab query parameter
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as SettingsTab | null;

  // Active tab - initialize from URL param if valid, otherwise default to 'profile'
  const validTabs: SettingsTab[] = ['profile', 'security', 'documents', 'notifications', 'privacy', 'extension', 'appearance', 'subscription'];
  const initialTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'profile';
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // User profile state
  const [profile, setProfile] = useState<UserProfile>({
    email: "",
    fullName: "",
    timezone: "America/New_York",
    notificationEmail: "",
    authProvider: "email",
  });

  // Premium status
  const [premium, setPremium] = useState<PremiumStatus>({ isPremium: false });

  // Theme
  const [darkMode, setDarkMode] = useState(false);

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [caseStatusAlerts, setCaseStatusAlerts] = useState(true);
  const [documentReminders, setDocumentReminders] = useState(true);

  // Tool email reminders (synced with OPT Dates)
  const [toolEmails, setToolEmails] = useState<{
    opt_apply: string;
    opt_clock: string;
    stem_apply: string;
    stem_clock: string;
  }>({
    opt_apply: '',
    opt_clock: '',
    stem_apply: '',
    stem_clock: '',
  });

  // Case Status & Document Vault share the same notification email (from profiles.notification_email)
  const [sharedNotificationEmail, setSharedNotificationEmail] = useState('');
  const [editingSharedEmail, setEditingSharedEmail] = useState<'case' | 'document' | null>(null);
  const [tempEmail, setTempEmail] = useState('');

  // Security
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recentLogins, setRecentLogins] = useState<{ device: string; location: string; time: string }[]>([]);

  // Case Status Settings
  const [caseSettings, setCaseSettings] = useState<CaseStatusSettings>({
    receiptNumber: '',
    autoCheckFrequency: 'daily',
    notifyOnChange: true,
  });

  // Document Vault Settings
  const [docSettings, setDocSettings] = useState<DocumentSettings>({
    hasPasscode: false,
    autoLockTimeout: 5,
    lockoutDuration: 10, // Default 10 minutes
  });
  const [showPasscodeChange, setShowPasscodeChange] = useState(false);
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscodes, setShowPasscodes] = useState(false);

  // OTP verification state for passcode change
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Extension Status
  const [extensionStatus, setExtensionStatus] = useState<ExtensionStatus>({
    isConnected: false,
    lastSyncTime: null,
  });

  // Data Export
  const [isExporting, setIsExporting] = useState(false);

  // ZIP Export with OTP verification
  const [showZipExportOtp, setShowZipExportOtp] = useState(false);
  const [zipExportOtp, setZipExportOtp] = useState('');
  const [zipExportOtpSending, setZipExportOtpSending] = useState(false);
  const [zipExportOtpVerifying, setZipExportOtpVerifying] = useState(false);
  const [zipExportCountdown, setZipExportCountdown] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Update active tab when URL param changes
  useEffect(() => {
    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTab(tabParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  // Load user data
  useEffect(() => {
    loadUserData();
    loadDarkModePreference();
    loadCaseSettings();
    loadDocumentSettings();
    loadExtensionStatus();
    loadRecentLogins();
    loadToolEmails();
    loadSharedNotificationEmail();
  }, []);

  const loadDarkModePreference = () => {
    const savedMode = localStorage.getItem('tmo_dark_mode');
    setDarkMode(savedMode === 'true');
  };

  // Listen for dark mode changes from header
  useEffect(() => {
    const handleDarkModeChange = (e: CustomEvent) => {
      setDarkMode(e.detail.darkMode);
    };

    window.addEventListener('darkModeChanged', handleDarkModeChange as EventListener);
    return () => window.removeEventListener('darkModeChanged', handleDarkModeChange as EventListener);
  }, []);

  const loadCaseSettings = async () => {
    try {
      const res = await fetch('/api/case-status', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.data) {
          setCaseSettings({
            receiptNumber: data.data.receipt_number || '',
            autoCheckFrequency: data.data.auto_check_frequency || 'daily',
            notifyOnChange: data.data.notify_on_change !== false,
          });
        }
      }
    } catch {
      // Silently fail
    }
  };

  const loadDocumentSettings = async () => {
    try {
      const res = await fetch('/api/documents/passcode/status', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setDocSettings({
          hasPasscode: data.hasPasscode || false,
          autoLockTimeout: data.autoLockTimeout || 5,
          lockoutDuration: data.lockoutDuration || 10,
        });
      }
    } catch {
      // Silently fail
    }
  };

  // Load tool email reminders (synced with OPT Dates page)
  const loadToolEmails = async () => {
    try {
      const res = await fetch('/api/user/tool-email', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.emails) {
          setToolEmails({
            opt_apply: data.emails.opt_apply || '',
            opt_clock: data.emails.opt_clock || '',
            stem_apply: data.emails.stem_apply || '',
            stem_clock: data.emails.stem_clock || '',
          });
        }
      }
    } catch {
      // Silently fail
    }
  };

  // Save tool email (syncs with OPT Dates page)
  const handleSaveToolEmail = async (toolKey: string) => {
    const email = toolEmails[toolKey as keyof typeof toolEmails];
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const res = await fetch('/api/user/tool-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolKey, email }),
      });

      if (res.ok) {
        setSuccess(`Email saved for ${toolKey.replace('_', ' ').toUpperCase()}`);
        setTimeout(() => setSuccess(null), 2000);
      } else {
        throw new Error('Failed to save');
      }
    } catch {
      setError('Failed to save email');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete tool email
  const handleDeleteToolEmail = async (toolKey: string) => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/user/tool-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolKey, email: '' }),
      });

      if (res.ok) {
        setToolEmails(prev => ({ ...prev, [toolKey]: '' }));
        setSuccess('Email removed');
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch {
      setError('Failed to remove email');
    } finally {
      setIsSaving(false);
    }
  };

  // Load shared notification email (used by Case Status & Document Vault)
  // This syncs with CaseStatusSection and DocumentVaultClient
  const loadSharedNotificationEmail = async () => {
    try {
      const res = await fetch('/api/user/notification-email', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSharedNotificationEmail(data.email || '');
      }
    } catch {
      // Silently fail
    }
  };

  // Save shared notification email (syncs with Case Status & Document Vault pages)
  const handleSaveSharedEmail = async () => {
    if (!tempEmail || !tempEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch('/api/user/notification-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tempEmail }),
      });

      if (res.ok) {
        setSharedNotificationEmail(tempEmail);
        setEditingSharedEmail(null);
        setTempEmail('');
        setSuccess('Notification email saved');
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch {
      setError('Failed to save email');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete shared notification email
  const handleDeleteSharedEmail = async () => {
    try {
      setIsSaving(true);
      // Save empty email to clear it
      const res = await fetch('/api/user/notification-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '' }),
      });

      if (res.ok) {
        setSharedNotificationEmail('');
        setSuccess('Notification email removed');
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch {
      setError('Failed to remove email');
    } finally {
      setIsSaving(false);
    }
  };

  // Start editing shared email
  const startEditingSharedEmail = (source: 'case' | 'document') => {
    setEditingSharedEmail(source);
    setTempEmail(sharedNotificationEmail);
  };

  const loadExtensionStatus = async () => {
    try {
      // Method 1: Check localStorage for extension marker (set by extension)
      const extensionConnected = localStorage.getItem('tmo_extension_connected');
      const extensionVersion = localStorage.getItem('tmo_extension_version');
      const lastSync = localStorage.getItem('tmo_extension_last_sync');

      if (extensionConnected === 'true') {
        setExtensionStatus({
          isConnected: true,
          lastSyncTime: lastSync,
          version: extensionVersion || undefined,
        });
        return;
      }

      // Method 2: Check server sessions API
      const res = await fetch('/api/user/sessions', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.extensionStatus?.isConnected) {
          setExtensionStatus({
            isConnected: true,
            lastSyncTime: data.extensionStatus?.lastActiveAt || null,
            version: data.extensionStatus?.version || undefined,
          });
          return;
        }
      }

      // Method 3: Try to detect extension via custom event
      // The extension should listen for this and respond
      window.postMessage({ type: 'TMO_CHECK_EXTENSION' }, '*');

      // Listen for response (extension will reply if installed)
      const handleExtensionResponse = (event: MessageEvent) => {
        if (event.data?.type === 'TMO_EXTENSION_PRESENT') {
          setExtensionStatus({
            isConnected: true,
            lastSyncTime: new Date().toISOString(),
            version: event.data.version || undefined,
          });
          // Also store in localStorage for future checks
          localStorage.setItem('tmo_extension_connected', 'true');
          if (event.data.version) {
            localStorage.setItem('tmo_extension_version', event.data.version);
          }
          localStorage.setItem('tmo_extension_last_sync', new Date().toISOString());
        }
      };

      window.addEventListener('message', handleExtensionResponse);

      // Clean up listener after 2 seconds
      setTimeout(() => {
        window.removeEventListener('message', handleExtensionResponse);
      }, 2000);

    } catch {
      // Silently fail - extension status not critical
    }
  };

  const loadRecentLogins = async () => {
    try {
      const res = await fetch('/api/user/sessions', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.sessions) {
          const formattedLogins = data.sessions.map((session: {
            device_type: string;
            device_info?: string;
            location?: string;
            last_active_at: string;
          }) => {
            // Format time ago
            const lastActive = new Date(session.last_active_at);
            const now = new Date();
            const diffMs = now.getTime() - lastActive.getTime();
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            let timeAgo = 'Just now';
            if (diffDays > 0) {
              timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            } else if (diffHours > 0) {
              timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else if (diffMins > 5) {
              timeAgo = `${diffMins} minutes ago`;
            }

            // Format device name
            let device = session.device_type === 'extension'
              ? 'Chrome Extension'
              : session.device_info || 'Web Browser';

            return {
              device,
              location: session.location || 'Unknown location',
              time: timeAgo,
            };
          });
          setRecentLogins(formattedLogins);
        }
      }
    } catch {
      // If API fails, show empty state
      setRecentLogins([]);
    }
  };

  const loadUserData = async () => {
    try {
      setIsLoading(true);

      // Fetch user data
      const [meRes, premiumRes, notifRes] = await Promise.all([
        fetch('/api/me', { credentials: 'include' }),
        fetch('/api/premium/status', { credentials: 'include' }),
        fetch('/api/user/notification-email', { credentials: 'include' }),
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setProfile({
          email: meData.user?.email || "",
          fullName: meData.user?.user_metadata?.full_name || "",
          timezone: meData.profile?.timezone || "America/New_York",
          notificationEmail: "",
        });
      }

      if (premiumRes.ok) {
        const premiumData = await premiumRes.json();
        setPremium({
          isPremium: premiumData.isPremium || false,
          planName: premiumData.planName,
          expiresAt: premiumData.expiresAt,
        });
      }

      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setProfile(prev => ({
          ...prev,
          notificationEmail: notifData.email || prev.email,
        }));
      }

    } catch {
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Save profile to API
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profile.fullName,
          timezone: profile.timezone,
        }),
      });

      if (res.ok) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotificationEmail = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const res = await fetch('/api/user/notification-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.notificationEmail }),
      });

      if (res.ok) {
        setSuccess('Notification email updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update email');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDarkModeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('tmo_dark_mode', String(newMode));

    // Apply to document
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Dispatch custom event to sync with header
    window.dispatchEvent(new CustomEvent('darkModeChanged', { detail: { darkMode: newMode } }));
  };

  const handlePasswordReset = async () => {
    try {
      setIsChangingPassword(true);
      setError(null);

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email }),
      });

      if (res.ok) {
        setSuccess('Password reset email sent! Check your inbox.');
        setTimeout(() => setSuccess(null), 5000);
      } else {
        throw new Error('Failed to send password reset email');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/auth/signout', {
        method: 'POST',
        credentials: 'include',
      });
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  // Delete Account
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        // Clear all local data
        localStorage.clear();
        sessionStorage.clear();
        // Redirect to home page
        window.location.href = '/?deleted=true';
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete account');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Save Case Status Settings
  const handleSaveCaseSettings = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const res = await fetch('/api/case-status', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receipt_number: caseSettings.receiptNumber,
          auto_check_frequency: caseSettings.autoCheckFrequency,
          notify_on_change: caseSettings.notifyOnChange,
        }),
      });

      if (res.ok) {
        setSuccess('Case status settings saved!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Failed to save');
      }
    } catch {
      setError('Failed to save case settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Change Document Passcode - Step 1: Send OTP
  const handleChangePasscode = async () => {
    if (newPasscode !== confirmPasscode) {
      setError('Passcodes do not match');
      return;
    }
    // Passcode must be exactly 6 digits
    if (!/^\d{6}$/.test(newPasscode)) {
      setError('Passcode must be exactly 6 digits');
      return;
    }

    try {
      setSendingOtp(true);
      setError(null);

      // Send OTP to user's email
      const res = await fetch('/api/documents/passcode/send-otp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPasscode: docSettings.hasPasscode ? currentPasscode : undefined,
          newPasscode,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setOtpEmail(data.email);
        setShowOtpInput(true);
        setOtpCountdown(600); // 10 minutes
        setSuccess(`OTP sent to ${data.email}`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/premium/portal', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to redirect');
      }
    } catch (error) {
      console.error('Portal Error:', error);
      setError('Failed to load subscription portal');
      setIsLoading(false);
    }
  };

  // Change Document Passcode - Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError('OTP must be 6 digits');
      return;
    }

    try {
      setVerifyingOtp(true);
      setError(null);

      const res = await fetch('/api/documents/passcode/verify-otp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp,
          newPasscode,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Passcode changed successfully!');
        // Reset all states
        setShowPasscodeChange(false);
        setShowOtpInput(false);
        setCurrentPasscode('');
        setNewPasscode('');
        setConfirmPasscode('');
        setOtp('');
        setOtpEmail('');
        setOtpCountdown(0);
        setDocSettings(prev => ({ ...prev, hasPasscode: true }));
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.error || 'Failed to verify OTP');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    await handleChangePasscode();
  };

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Update Auto-lock Timeout
  const handleAutoLockChange = async (timeout: number) => {
    try {
      setDocSettings(prev => ({ ...prev, autoLockTimeout: timeout }));

      const res = await fetch('/api/documents/passcode/status', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoLockTimeout: timeout }),
      });

      if (res.ok) {
        setSuccess('Auto-lock timeout updated!');
        setTimeout(() => setSuccess(null), 2000);
      } else {
        throw new Error('Failed to update');
      }
    } catch {
      setError('Failed to update auto-lock timeout');
      // Revert on error
      loadDocumentSettings();
    }
  };

  // Update Lockout Duration (after 3 failed attempts)
  const handleLockoutDurationChange = async (duration: number) => {
    try {
      setDocSettings(prev => ({ ...prev, lockoutDuration: duration }));

      const res = await fetch('/api/documents/passcode/status', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lockoutDuration: duration }),
      });

      if (res.ok) {
        setSuccess('Lockout duration updated!');
        setTimeout(() => setSuccess(null), 2000);
      } else {
        throw new Error('Failed to update');
      }
    } catch {
      setError('Failed to update lockout duration');
      // Revert on error
      loadDocumentSettings();
    }
  };

  // Export User Data
  const handleExportData = async (format: 'json' | 'csv') => {
    try {
      setIsExporting(true);

      const res = await fetch(`/api/user/export?format=${format}`, { credentials: 'include' });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trackmyopt-data-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSuccess('Data exported successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error('Export failed');
      }
    } catch {
      // If API doesn't exist, create mock export
      const mockData = {
        profile,
        caseSettings,
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(mockData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trackmyopt-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('Data exported!');
      setTimeout(() => setSuccess(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  // ZIP Export countdown timer
  useEffect(() => {
    if (zipExportCountdown > 0) {
      const timer = setTimeout(() => setZipExportCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [zipExportCountdown]);

  // Handle ZIP Export click - check if Pro, then send OTP
  const handleZipExportClick = async () => {
    if (!premium.isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    // Send OTP for verification
    setZipExportOtpSending(true);
    try {
      const res = await fetch('/api/user/send-export-otp', {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        setShowZipExportOtp(true);
        setZipExportCountdown(60);
        setSuccess('Verification code sent to your email!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setZipExportOtpSending(false);
    }
  };

  // Verify OTP and download ZIP
  const handleZipExportVerify = async () => {
    if (zipExportOtp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setZipExportOtpVerifying(true);
    try {
      const res = await fetch('/api/user/export-zip', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: zipExportOtp }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trackmyopt-export-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setShowZipExportOtp(false);
        setZipExportOtp('');
        setSuccess('Data exported successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Verification failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setZipExportOtpVerifying(false);
    }
  };

  // Resend ZIP export OTP
  const handleResendZipOtp = async () => {
    if (zipExportCountdown > 0) return;
    await handleZipExportClick();
  };

  // Disconnect Extension
  const handleDisconnectExtension = async () => {
    try {
      // Clear localStorage markers
      localStorage.removeItem('tmo_extension_connected');
      localStorage.removeItem('tmo_extension_version');
      localStorage.removeItem('tmo_extension_last_sync');

      // Also clear server session
      const res = await fetch('/api/user/sessions?device_type=extension', {
        method: 'DELETE',
        credentials: 'include',
      });

      setExtensionStatus({ isConnected: false, lastSyncTime: null });
      setSuccess('Extension disconnected');
      setTimeout(() => setSuccess(null), 3000);

      if (!res.ok) {
        console.error('Failed to clear server session');
      }
    } catch {
      // Still update UI even if server call fails
      setExtensionStatus({ isConnected: false, lastSyncTime: null });
      setSuccess('Extension disconnected');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "America/Anchorage", label: "Alaska Time (AKT)" },
    { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
    { value: "UTC", label: "UTC" },
  ];

  // Tab configuration - Updated with all new tabs
  // Documents tab only visible for premium users
  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode; isPro?: boolean }[] = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'subscription', label: 'Subscription', icon: <CreditCard className="w-4 h-4" /> },
    // Only show Documents tab for premium users
    ...(premium.isPremium ? [{ id: 'documents' as SettingsTab, label: 'Documents', icon: <Lock className="w-4 h-4" />, isPro: true }] : []),
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Database className="w-4 h-4" /> },
    { id: 'extension', label: 'Extension', icon: <Chrome className="w-4 h-4" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Toggle Switch Component
  const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-5' : ''
          }`}
      />
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto no-scrollbar pb-1" aria-label="Settings tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                ${activeTab === tab.id
                  ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              {tab.icon}
              {tab.label}
              {tab.isPro && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-md">
                  PRO
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3 text-green-700 dark:text-green-300">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8 text-center sm:text-left">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {profile.fullName || 'Your Name'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
              </div>
            </div>

            <div className="space-y-6 max-w-xl">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="h-11"
                />
              </div>

              {/* Email (Read Only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={profile.email}
                  disabled
                  className="h-11 bg-gray-50 dark:bg-gray-900 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Timezone
                  </div>
                </label>
                <select
                  value={profile.timezone}
                  onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 h-11 px-6"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="p-6 sm:p-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Password & Security</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage your password and security settings</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Password Reset */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Password</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Reset your password via email
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handlePasswordReset}
                      disabled={isChangingPassword}
                      className="h-10"
                    >
                      {isChangingPassword ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Key className="w-4 h-4 mr-2" />
                      )}
                      Reset Password
                    </Button>
                  </div>
                </div>

                {/* Sign Out */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Sign Out</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Sign out of your account on this device
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleSignOut}
                      className="h-10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>

                {/* Delete Account */}
                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-600 dark:text-red-400">Delete Account</p>
                      <p className="text-sm text-red-500/80 dark:text-red-400/70 mt-1">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    {!showDeleteConfirm && (
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="h-10 text-red-600 border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>

                  {/* Delete Confirmation Warning */}
                  {showDeleteConfirm && (
                    <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-700 dark:text-red-300 mb-2">
                            Warning: This action is permanent!
                          </p>
                          <ul className="text-sm text-red-600 dark:text-red-400 space-y-1 mb-4">
                            <li>• All your data will be permanently deleted</li>
                            <li>• You will NOT be able to create a new account with this email</li>
                            <li>• This email address will be permanently blocked from our platform</li>
                            <li>• This action cannot be undone</li>
                          </ul>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowDeleteConfirm(false)}
                              disabled={isDeleting}
                              className="bg-white dark:bg-gray-800"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={handleDeleteAccount}
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  Deleting...
                                </>
                              ) : (
                                'Yes, Delete My Account'
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="p-6 sm:p-8">
            <div className="max-w-2xl space-y-8">

              {/* Preferences Section - Combined with Notification Email */}
              <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Preferences</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage how you receive updates from TrackMyOPT</p>
                  </div>
                </div>

                {/* Email Notifications Toggle */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg mb-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive important updates, tips, and promotional offers via email</p>
                  </div>
                  <Toggle enabled={emailNotifications} onToggle={() => setEmailNotifications(!emailNotifications)} />
                </div>

                {/* Notification Email */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Notification Email</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Email address for receiving notifications</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      value={profile.notificationEmail}
                      onChange={(e) => setProfile({ ...profile, notificationEmail: e.target.value })}
                      placeholder="Email for notifications"
                      className="flex-1 h-11"
                    />
                    <Button
                      onClick={handleSaveNotificationEmail}
                      disabled={isSaving}
                      className="h-11 px-6 bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Daily Reminders (4 Tools) - Premium Feature */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Daily Reminders (9:00 AM ET)</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email reminders for each OPT tracking tool</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-md">
                    PRO
                  </span>
                </div>

                {/* Blur overlay for non-premium */}
                {!premium.isPremium && (
                  <div className="absolute inset-0 top-16 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                    <Button
                      onClick={() => window.location.href = '/premium/checkout'}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 text-base font-semibold shadow-lg"
                    >
                      Upgrade to Premium
                    </Button>
                  </div>
                )}

                <div className={`space-y-3 ${!premium.isPremium ? 'filter blur-[2px] pointer-events-none' : ''}`}>
                  {[
                    { key: 'opt_apply', label: 'OPT Apply Dates', icon: '📅', description: 'OPT filing deadline reminders' },
                    { key: 'opt_clock', label: 'OPT Clock Tracker', icon: '⏰', description: 'Unemployment days tracking alerts' },
                    { key: 'stem_apply', label: 'STEM Apply Dates', icon: '🎓', description: 'STEM extension deadline reminders' },
                    { key: 'stem_clock', label: 'STEM Clock Tracker', icon: '⏲️', description: 'STEM unemployment tracking alerts' },
                  ].map((tool) => (
                    <div key={tool.key} className="p-4 rounded-xl border bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <span className="text-xl">{tool.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{tool.label}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{tool.description}</p>
                          </div>
                        </div>
                        {toolEmails[tool.key as keyof typeof toolEmails] ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                              {toolEmails[tool.key as keyof typeof toolEmails]}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setToolEmails(prev => ({ ...prev, [tool.key]: '' }))}
                              className="h-8 px-2"
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteToolEmail(tool.key)}
                              className="h-8 px-2 text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Input
                              type="email"
                              value={toolEmails[tool.key as keyof typeof toolEmails] || ''}
                              onChange={(e) => setToolEmails(prev => ({ ...prev, [tool.key]: e.target.value }))}
                              placeholder="Enter email"
                              className="w-48 h-9 text-sm"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSaveToolEmail(tool.key)}
                              disabled={isSaving}
                              className="h-9"
                            >
                              {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Case Status Notifications - Premium Feature */}
              {/* Synced with Case Status page via /api/user/notification-email */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Case Status Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when your USCIS case status changes</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-md">
                    PRO
                  </span>
                </div>

                {/* Blur overlay for non-premium */}
                {!premium.isPremium && (
                  <div className="absolute inset-0 top-16 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                    <Button
                      onClick={() => window.location.href = '/premium/checkout'}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 text-base font-semibold shadow-lg"
                    >
                      Upgrade to Premium
                    </Button>
                  </div>
                )}

                <div className={`p-4 rounded-xl border bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 ${!premium.isPremium ? 'filter blur-[2px] pointer-events-none' : ''}`}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                    <div className="w-full sm:w-auto text-center sm:text-left mb-2 sm:mb-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100">Case Status Alerts</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive email when your case status updates</p>
                    </div>
                    {sharedNotificationEmail && editingSharedEmail !== 'case' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                          {sharedNotificationEmail}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditingSharedEmail('case')}
                          className="h-8 px-2"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleDeleteSharedEmail}
                          disabled={isSaving}
                          className="h-8 px-2 text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          type="email"
                          value={editingSharedEmail === 'case' ? tempEmail : tempEmail}
                          onChange={(e) => setTempEmail(e.target.value)}
                          placeholder="Enter email"
                          className="w-48 h-9 text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={handleSaveSharedEmail}
                          disabled={isSaving}
                          className="h-9"
                        >
                          {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                        </Button>
                        {editingSharedEmail === 'case' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setEditingSharedEmail(null); setTempEmail(''); }}
                            className="h-9"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Vault Expiry Reminder - Premium Feature */}
              {/* Synced with Documents page via /api/user/notification-email (same email as Case Status) */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">Document Vault Expiry Reminder</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get alerts before your documents expire</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-md">
                    PRO
                  </span>
                </div>

                {/* Blur overlay for non-premium */}
                {!premium.isPremium && (
                  <div className="absolute inset-0 top-16 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                    <Button
                      onClick={() => window.location.href = '/premium/checkout'}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 text-base font-semibold shadow-lg"
                    >
                      Upgrade to Premium
                    </Button>
                  </div>
                )}

                <div className={`p-4 rounded-xl border bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 ${!premium.isPremium ? 'filter blur-[2px] pointer-events-none' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Document Expiry Reminders</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive alerts 30, 14, and 7 days before expiry</p>
                    </div>
                    {sharedNotificationEmail && editingSharedEmail !== 'document' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                          {sharedNotificationEmail}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditingSharedEmail('document')}
                          className="h-8 px-2"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleDeleteSharedEmail}
                          disabled={isSaving}
                          className="h-8 px-2 text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          type="email"
                          value={editingSharedEmail === 'document' ? tempEmail : tempEmail}
                          onChange={(e) => setTempEmail(e.target.value)}
                          placeholder="Enter email"
                          className="w-48 h-9 text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={handleSaveSharedEmail}
                          disabled={isSaving}
                          className="h-9"
                        >
                          {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                        </Button>
                        {editingSharedEmail === 'document' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setEditingSharedEmail(null); setTempEmail(''); }}
                            className="h-9"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="p-6 sm:p-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Document Vault Settings</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage your document vault security</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Passcode Status */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${docSettings.hasPasscode ? 'bg-green-100 dark:bg-green-900/50' : 'bg-yellow-100 dark:bg-yellow-900/50'}`}>
                        {docSettings.hasPasscode ? (
                          <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {docSettings.hasPasscode ? 'Passcode Protected' : 'No Passcode Set'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {docSettings.hasPasscode ? 'Your documents are secured' : 'Set a passcode to protect your documents'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowPasscodeChange(!showPasscodeChange)}
                      className="h-10"
                    >
                      {docSettings.hasPasscode ? 'Change' : 'Set Passcode'}
                    </Button>
                  </div>

                  {showPasscodeChange && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                      {docSettings.hasPasscode && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Current Passcode (6 digits)
                          </label>
                          <div className="relative">
                            <Input
                              type={showPasscodes ? 'text' : 'password'}
                              value={currentPasscode}
                              onChange={(e) => setCurrentPasscode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="Enter 6-digit passcode"
                              className="h-11 pr-10 font-mono tracking-widest"
                              maxLength={6}
                              inputMode="numeric"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasscodes(!showPasscodes)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                              {showPasscodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          New Passcode (6 digits)
                        </label>
                        <Input
                          type={showPasscodes ? 'text' : 'password'}
                          value={newPasscode}
                          onChange={(e) => setNewPasscode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Enter 6-digit passcode"
                          className="h-11 font-mono tracking-widest"
                          maxLength={6}
                          inputMode="numeric"
                        />
                        <p className="text-xs text-gray-500 mt-1">{newPasscode.length}/6 digits</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm Passcode
                        </label>
                        <Input
                          type={showPasscodes ? 'text' : 'password'}
                          value={confirmPasscode}
                          onChange={(e) => setConfirmPasscode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Re-enter 6-digit passcode"
                          className="h-11 font-mono tracking-widest"
                          maxLength={6}
                          inputMode="numeric"
                        />
                      </div>
                      {/* OTP Verification Section */}
                      {showOtpInput ? (
                        <div className="space-y-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                            <Mail className="w-5 h-5" />
                            <p className="text-sm font-medium">
                              OTP sent to {otpEmail}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Enter 6-digit OTP
                            </label>
                            <Input
                              type="text"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="Enter OTP"
                              className="h-11 font-mono tracking-widest text-center text-lg"
                              maxLength={6}
                              inputMode="numeric"
                              autoFocus
                            />
                            {otpCountdown > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                Expires in {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={handleVerifyOtp}
                              disabled={verifyingOtp || otp.length !== 6}
                              className="bg-indigo-600 hover:bg-indigo-700"
                            >
                              {verifyingOtp ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                              Verify & Change Passcode
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleResendOtp}
                              disabled={sendingOtp || otpCountdown > 540}
                            >
                              {sendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowOtpInput(false);
                                setOtp('');
                                setOtpCountdown(0);
                              }}
                            >
                              Back
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            onClick={handleChangePasscode}
                            disabled={sendingOtp || newPasscode.length !== 6 || confirmPasscode.length !== 6}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            {sendingOtp ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                            Send OTP & Save
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowPasscodeChange(false);
                              setCurrentPasscode('');
                              setNewPasscode('');
                              setConfirmPasscode('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Auto-lock Timeout */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Auto-lock Timeout
                    </div>
                  </label>
                  <select
                    value={docSettings.autoLockTimeout}
                    onChange={(e) => handleAutoLockChange(parseInt(e.target.value))}
                    className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={0}>Never (not recommended)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Vault will lock after this period of inactivity</p>
                </div>

                {/* Lockout Duration - After 3 Failed Attempts */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Failed Attempts Lockout
                    </div>
                  </label>
                  <select
                    value={docSettings.lockoutDuration}
                    onChange={(e) => handleLockoutDurationChange(parseInt(e.target.value))}
                    className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={1}>1 minute</option>
                    <option value={2}>2 minutes</option>
                    <option value={3}>3 minutes</option>
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes (default)</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    You have 3 attempts before a {docSettings.lockoutDuration} minute{docSettings.lockoutDuration > 1 ? 's' : ''} lockout
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="p-6 sm:p-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <Database className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Data & Privacy</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage your data and privacy settings</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Export Data */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Export Your Data</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Download all your data in a portable format</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleExportData('json')}
                      disabled={isExporting}
                      className="h-10 w-full sm:w-auto"
                    >
                      {isExporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                      Export as JSON
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExportData('csv')}
                      disabled={isExporting}
                      className="h-10 w-full sm:w-auto"
                    >
                      Export as CSV
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleZipExportClick}
                      disabled={zipExportOtpSending || showZipExportOtp}
                      className="h-10 relative w-full sm:w-auto"
                    >
                      {zipExportOtpSending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Export as ZIP
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-md">
                        PRO
                      </span>
                    </Button>
                  </div>

                  {/* ZIP Export OTP Verification */}
                  {showZipExportOtp && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                        Enter the 6-digit code sent to your email to verify and download your data.
                      </p>
                      <div className="flex gap-3 items-center">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={zipExportOtp}
                          onChange={(e) => setZipExportOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 6-digit code"
                          className="flex-1 h-10 px-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-center text-lg font-mono tracking-widest"
                        />
                        <Button
                          onClick={handleZipExportVerify}
                          disabled={zipExportOtpVerifying || zipExportOtp.length !== 6}
                          className="h-10 bg-blue-600 hover:bg-blue-700"
                        >
                          {zipExportOtpVerifying ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Verify & Download'
                          )}
                        </Button>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <button
                          onClick={handleResendZipOtp}
                          disabled={zipExportCountdown > 0}
                          className={`text-sm ${zipExportCountdown > 0 ? 'text-gray-400' : 'text-blue-600 hover:underline'}`}
                        >
                          {zipExportCountdown > 0 ? `Resend in ${zipExportCountdown}s` : 'Resend code'}
                        </button>
                        <button
                          onClick={() => {
                            setShowZipExportOtp(false);
                            setZipExportOtp('');
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    <span className="font-medium">ZIP export (Pro):</span> Includes your profile data, OPT dates, case status, and all uploaded documents.
                  </p>
                </div>

                {/* Data Retention */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <p className="font-medium text-gray-900 dark:text-gray-100">Data Retention</p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    We retain your data as long as your account is active. You can request deletion at any time.
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      Your data is encrypted at rest
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      We never sell your personal information
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      GDPR and CCPA compliant
                    </li>
                  </ul>
                </div>

                {/* Privacy Links */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Policy</a>
                  <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">Terms of Service</a>
                  <a href="mailto:privacy@trackmyopt.com" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Privacy Team</a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Extension Tab */}
        {activeTab === 'extension' && (
          <div className="p-6 sm:p-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Chrome className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Chrome Extension</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage your browser extension connection</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Connection Status */}
                <div className={`p-4 rounded-xl border ${extensionStatus.isConnected ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'}`}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${extensionStatus.isConnected ? 'bg-green-100 dark:bg-green-900/50' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        {extensionStatus.isConnected ? (
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <Unlink className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {extensionStatus.isConnected ? 'Extension Connected' : 'Not Connected'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {extensionStatus.isConnected
                            ? `Version ${extensionStatus.version || 'Unknown'}`
                            : 'Install the Chrome extension to sync'}
                        </p>
                      </div>
                    </div>
                    {extensionStatus.isConnected ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Active
                      </span>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}
                        className="h-10"
                      >
                        Install Extension
                      </Button>
                    )}
                  </div>
                </div>

                {extensionStatus.isConnected && (
                  <>
                    {/* Last Sync */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Last Sync</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {extensionStatus.lastSyncTime
                              ? new Date(extensionStatus.lastSyncTime).toLocaleString()
                              : 'Never synced'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Disconnect */}
                    <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-600 dark:text-red-400">Disconnect Extension</p>
                          <p className="text-sm text-red-500/80 dark:text-red-400/70">
                            Remove the connection between this account and the extension
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleDisconnectExtension}
                          className="h-10 text-red-600 border-red-300 hover:bg-red-50 dark:border-red-800"
                        >
                          <Unlink className="w-4 h-4 mr-2" />
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {/* Linked Accounts Section */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    Linked Accounts
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">Google Account</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {profile.email}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                        Connected
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Recent Login Activity
                  </h3>
                  <div className="space-y-3">
                    {recentLogins.map((login, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{login.device}</p>
                            <p className="text-xs text-gray-500">{login.location}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{login.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="p-6 sm:p-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Subscription</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage your billing and plan details</p>
                </div>
              </div>

              {!premium.isPremium ? (
                /* Free User View */
                <div className="space-y-6">
                  {/* Usage Stats */}
                  <div className="flex justify-end mb-2">
                    <PlanComparisonModal />
                  </div>
                  <SubscriptionUsage />

                  {/* Current Plan Card */}
                  <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Current Plan</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Basic features</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                        Active
                      </span>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        You are currently on the Free Plan. Upgrade to access premium features.
                      </p>
                    </div>
                  </div>

                  {/* Upgrade Hero Card */}
                  <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl text-white relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <h3 className="text-xl font-bold mb-1">Unlock Pro Features</h3>
                          <p className="text-gray-300 text-sm">Get lifetime access to all tools</p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="text-2xl font-bold">$2.99</p>
                          <p className="text-xs text-gray-400">One-time payment</p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 mb-8">
                        {[
                          "Unlimited Job Tracking",
                          "Automated H-1B Insights",
                          "PDF Case Tracking & Alerts",
                          "AI-Powered Resume Analysis",
                          "Daily Email Reminders",
                          "Document Safe & Export"
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-green-400" />
                            </div>
                            <span className="text-sm text-gray-200">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <a
                        href="/premium/checkout"
                        className="block w-full text-center py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
                      >
                        Upgrade Now
                      </a>
                    </div>
                  </div>

                  {/* FAQ Section */}
                  <SubscriptionFAQ />
                </div>
              ) : (
                /* Pro User View */
                <div className="space-y-6">
                  {/* Subscription Details */}
                  <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {premium.planName || "TrackMyOPT Pro"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Member since {premium.expiresAt ? new Date(premium.expiresAt).toLocaleDateString() : 'recently'}
                          </span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full border border-green-200 dark:border-green-800">
                        Active
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <Button
                        onClick={handleManageSubscription}
                        disabled={isLoading}
                        className="flex-1 bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Manage Subscription
                      </Button>
                      <p className="text-xs text-center sm:text-left text-gray-500 max-w-xs mt-2 sm:mt-0">
                        Update payment method, download invoices, or cancel subscription via secure Stripe portal.
                      </p>
                    </div>
                  </div>

                  {/* Billing History */}
                  <BillingHistory />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="p-6 sm:p-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  {darkMode ? (
                    <Moon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Sun className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Appearance</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Customize how TrackMyOPT looks</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {darkMode ? 'Currently using dark theme' : 'Currently using light theme'}
                    </p>
                  </div>
                  <Toggle enabled={darkMode} onToggle={handleDarkModeToggle} />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Upgrade Modal for Non-Pro Users */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            {/* Icon */}
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
              Upgrade to Pro
            </h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              ZIP export with documents is a Pro feature. Upgrade to download all your data including uploaded documents.
            </p>

            {/* Features */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Export profile, OPT dates & case status</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Download all uploaded documents</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Everything in one ZIP file</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Secure OTP verification</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Maybe Later
              </button>
              <a
                href="/upgrade"
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-medium text-center"
              >
                Upgrade Now
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p className="font-medium mb-1">TrackMyOPT</p>
          <p className="text-xs">Version 1.0.0</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <a href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="mailto:support@trackmyopt.com" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
