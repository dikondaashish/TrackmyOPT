"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  User,
  Bell,
  Shield,
  Loader2,
  Check,
  AlertCircle,
  Lock,
  Chrome,
  Database,
  CreditCard} from "lucide-react";
import { useDocumentPasscode } from "./useDocumentPasscode";
import { useDataExport } from "./useDataExport";
import { useSettingsExtension } from "./useSettingsExtension";
import { useSettingsNotificationEmails } from "./useSettingsNotificationEmails";
import { SettingsZipExportUpgradeModal } from "./SettingsZipExportUpgradeModal";
import { ProfileTab } from "./tabs/ProfileTab";
import { SecurityTab } from "./tabs/SecurityTab";
import { SubscriptionTab } from "./tabs/SubscriptionTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { NotificationsTab } from "./tabs/NotificationsTab";
import { PrivacyTab } from "./tabs/PrivacyTab";
import { ExtensionTab } from "./tabs/ExtensionTab";
import type {
  SettingsTab,
  UserProfile,
  PremiumStatus,
  CaseStatusSettings,
} from "./settings-types";

export function SettingsSection() {
  // Get URL search params to handle tab query parameter
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as SettingsTab | null;

  // Active tab - initialize from URL param if valid, otherwise default to 'profile'
  const validTabs: SettingsTab[] = ['profile', 'security', 'documents', 'notifications', 'privacy', 'extension', 'subscription'];
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
    degreeLevel: null,
    majorName: null,
    isStemEligible: false,
  });

  const [showMajorDropdown, setShowMajorDropdown] = useState(false);


  // Premium status
  const [premium, setPremium] = useState<PremiumStatus>({ isPremium: false });

  // Theme
  const [darkMode, setDarkMode] = useState(false);

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [caseStatusAlerts, setCaseStatusAlerts] = useState(true);
  const [documentReminders, setDocumentReminders] = useState(true);

  // Security
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Case Status Settings
  const [caseSettings, setCaseSettings] = useState<CaseStatusSettings>({
    receiptNumber: '',
    autoCheckFrequency: 'daily',
    notifyOnChange: true,
  });


  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const {
    docSettings,
    showPasscodeChange,
    setShowPasscodeChange,
    currentPasscode,
    setCurrentPasscode,
    newPasscode,
    setNewPasscode,
    confirmPasscode,
    setConfirmPasscode,
    showPasscodes,
    setShowPasscodes,
    showOtpInput,
    setShowOtpInput,
    otp,
    setOtp,
    otpEmail,
    otpCountdown,
    setOtpCountdown,
    sendingOtp,
    verifyingOtp,
    loadDocumentSettings,
    handleChangePasscode,
    handleVerifyOtp,
    handleResendOtp,
    handleAutoLockChange,
    handleLockoutDurationChange,
  } = useDocumentPasscode({ setSuccess, setError });

  const {
    isExporting,
    showZipExportOtp,
    setShowZipExportOtp,
    zipExportOtp,
    setZipExportOtp,
    zipExportOtpSending,
    zipExportOtpVerifying,
    zipExportCountdown,
    handleExportData,
    handleZipExportClick,
    handleZipExportVerify,
    handleResendZipOtp,
  } = useDataExport({
    premium,
    profile,
    caseSettings,
    setSuccess,
    setError,
    setShowUpgradeModal,
  });

  const {
    toolEmails,
    setToolEmails,
    sharedNotificationEmail,
    editingSharedEmail,
    setEditingSharedEmail,
    tempEmail,
    setTempEmail,
    loadToolEmails,
    handleSaveToolEmail,
    handleDeleteToolEmail,
    loadSharedNotificationEmail,
    handleSaveSharedEmail,
    handleDeleteSharedEmail,
    startEditingSharedEmail,
  } = useSettingsNotificationEmails({ setSuccess, setError, setIsSaving });

  const {
    extensionStatus,
    recentLogins,
    loadExtensionStatus,
    loadRecentLogins,
    handleDisconnectExtension,
  } = useSettingsExtension({ setSuccess });

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
  const [hasReferralAccess, setHasReferralAccess] = useState(false);

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
    loadReferralAccess();
  }, []);

  const loadReferralAccess = async () => {
    try {
      const res = await fetch("/api/referral/my-stats", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        setHasReferralAccess(false);
        return;
      }
      const data = await res.json();
      setHasReferralAccess(!!data.ok && !!data.hasAccess);
    } catch {
      setHasReferralAccess(false);
    }
  };

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
        const meta = meData.user?.user_metadata || {};
        const metaFullName = meta.full_name || meta.fullName;
        const constructedName = [meta.firstName, meta.lastName].filter(Boolean).join(" ");
        const fallbackFromEmail = meData.user?.email ? meData.user.email.split("@")[0] : "";

        setProfile({
          email: meData.user?.email || "",
          fullName: metaFullName || constructedName || fallbackFromEmail,
          timezone: meData.profile?.timezone || "America/New_York",
          notificationEmail: "",
          degreeLevel: meData.profile?.degree_level || null,
          majorName: meData.profile?.major_name || null,
          isStemEligible: meData.profile?.is_stem_eligible || false,
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
          degree_level: profile.degreeLevel,
          major_name: profile.majorName,
          is_stem_eligible: profile.isStemEligible,
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
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }


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
                flex items-center gap-2 max-md:min-h-11 max-md:px-3 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
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
          <ProfileTab
            darkMode={darkMode}
            handleDarkModeToggle={handleDarkModeToggle}
            handleSaveProfile={handleSaveProfile}
            hasReferralAccess={hasReferralAccess}
            isSaving={isSaving}
            profile={profile}
            setProfile={setProfile}
            setShowMajorDropdown={setShowMajorDropdown}
            showMajorDropdown={showMajorDropdown}
          />
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <SecurityTab
            handleDeleteAccount={handleDeleteAccount}
            handlePasswordReset={handlePasswordReset}
            handleSignOut={handleSignOut}
            isChangingPassword={isChangingPassword}
            isDeleting={isDeleting}
            setShowDeleteConfirm={setShowDeleteConfirm}
            showDeleteConfirm={showDeleteConfirm}
          />
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <NotificationsTab
            editingSharedEmail={editingSharedEmail}
            emailNotifications={emailNotifications}
            handleDeleteSharedEmail={handleDeleteSharedEmail}
            handleDeleteToolEmail={handleDeleteToolEmail}
            handleSaveNotificationEmail={handleSaveNotificationEmail}
            handleSaveSharedEmail={handleSaveSharedEmail}
            handleSaveToolEmail={handleSaveToolEmail}
            isSaving={isSaving}
            premium={premium}
            profile={profile}
            setEditingSharedEmail={setEditingSharedEmail}
            setEmailNotifications={setEmailNotifications}
            setProfile={setProfile}
            setTempEmail={setTempEmail}
            setToolEmails={setToolEmails}
            sharedNotificationEmail={sharedNotificationEmail}
            startEditingSharedEmail={startEditingSharedEmail}
            tempEmail={tempEmail}
            toolEmails={toolEmails}
          />
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <DocumentsTab
            confirmPasscode={confirmPasscode}
            currentPasscode={currentPasscode}
            docSettings={docSettings}
            handleAutoLockChange={handleAutoLockChange}
            handleChangePasscode={handleChangePasscode}
            handleLockoutDurationChange={handleLockoutDurationChange}
            handleResendOtp={handleResendOtp}
            handleVerifyOtp={handleVerifyOtp}
            newPasscode={newPasscode}
            otp={otp}
            otpCountdown={otpCountdown}
            otpEmail={otpEmail}
            sendingOtp={sendingOtp}
            setConfirmPasscode={setConfirmPasscode}
            setCurrentPasscode={setCurrentPasscode}
            setNewPasscode={setNewPasscode}
            setOtp={setOtp}
            setOtpCountdown={setOtpCountdown}
            setShowOtpInput={setShowOtpInput}
            setShowPasscodeChange={setShowPasscodeChange}
            setShowPasscodes={setShowPasscodes}
            showOtpInput={showOtpInput}
            showPasscodeChange={showPasscodeChange}
            showPasscodes={showPasscodes}
            verifyingOtp={verifyingOtp}
          />
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <PrivacyTab
            handleExportData={handleExportData}
            handleResendZipOtp={handleResendZipOtp}
            handleZipExportClick={handleZipExportClick}
            handleZipExportVerify={handleZipExportVerify}
            isExporting={isExporting}
            setShowZipExportOtp={setShowZipExportOtp}
            setZipExportOtp={setZipExportOtp}
            showZipExportOtp={showZipExportOtp}
            zipExportCountdown={zipExportCountdown}
            zipExportOtp={zipExportOtp}
            zipExportOtpSending={zipExportOtpSending}
            zipExportOtpVerifying={zipExportOtpVerifying}
          />
        )}

        {/* Extension Tab */}
        {activeTab === 'extension' && (
          <ExtensionTab
            extensionStatus={extensionStatus}
            handleDisconnectExtension={handleDisconnectExtension}
            profile={profile}
            recentLogins={recentLogins}
          />
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <SubscriptionTab
            handleManageSubscription={handleManageSubscription}
            isLoading={isLoading}
            premium={premium}
            profile={profile}
          />
        )}



      </div>

      <SettingsZipExportUpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

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
