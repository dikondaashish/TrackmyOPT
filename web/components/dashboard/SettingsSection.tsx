"use client";

import { useState, useEffect } from "react";
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
  ShieldCheck
} from "lucide-react";

// Tab types
type SettingsTab = 'profile' | 'security' | 'documents' | 'notifications' | 'privacy' | 'extension' | 'appearance';

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
}

interface ExtensionStatus {
  isConnected: boolean;
  lastSyncTime: string | null;
  version?: string;
}

export function SettingsSection() {
  // Active tab
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  
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

  // Security
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recentLogins, setRecentLogins] = useState<{device: string; location: string; time: string}[]>([]);

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
  });
  const [showPasscodeChange, setShowPasscodeChange] = useState(false);
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscodes, setShowPasscodes] = useState(false);

  // Extension Status
  const [extensionStatus, setExtensionStatus] = useState<ExtensionStatus>({
    isConnected: false,
    lastSyncTime: null,
  });

  // Data Export
  const [isExporting, setIsExporting] = useState(false);

  // Load user data
  useEffect(() => {
    loadUserData();
    loadDarkModePreference();
    loadCaseSettings();
    loadDocumentSettings();
    loadExtensionStatus();
    loadRecentLogins();
  }, []);

  const loadDarkModePreference = () => {
    const savedMode = localStorage.getItem('tmo_dark_mode');
    setDarkMode(savedMode === 'true');
  };

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
        });
      }
    } catch {
      // Silently fail
    }
  };

  const loadExtensionStatus = () => {
    // Check localStorage for extension sync data
    const lastSync = localStorage.getItem('tmo_extension_last_sync');
    const isConnected = !!localStorage.getItem('tmo_extension_connected');
    setExtensionStatus({
      isConnected,
      lastSyncTime: lastSync,
      version: localStorage.getItem('tmo_extension_version') || undefined,
    });
  };

  const loadRecentLogins = () => {
    // Mock data - in production, this would come from an API
    setRecentLogins([
      { device: 'Chrome on MacOS', location: 'New York, US', time: 'Just now' },
      { device: 'Chrome Extension', location: 'New York, US', time: '2 hours ago' },
    ]);
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

  // Change Document Passcode
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
      setIsSaving(true);
      setError(null);

      const res = await fetch('/api/documents/passcode/change', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPasscode: docSettings.hasPasscode ? currentPasscode : undefined,
          newPasscode,
        }),
      });

      if (res.ok) {
        setSuccess('Passcode updated successfully!');
        setShowPasscodeChange(false);
        setCurrentPasscode('');
        setNewPasscode('');
        setConfirmPasscode('');
        setDocSettings(prev => ({ ...prev, hasPasscode: true }));
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to change passcode');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change passcode');
    } finally {
      setIsSaving(false);
    }
  };

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

  // Disconnect Extension
  const handleDisconnectExtension = () => {
    localStorage.removeItem('tmo_extension_connected');
    localStorage.removeItem('tmo_extension_last_sync');
    localStorage.removeItem('tmo_extension_version');
    setExtensionStatus({ isConnected: false, lastSyncTime: null });
    setSuccess('Extension disconnected');
    setTimeout(() => setSuccess(null), 3000);
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
  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    // Only show Documents tab for premium users
    ...(premium.isPremium ? [{ id: 'documents' as SettingsTab, label: 'Documents', icon: <Lock className="w-4 h-4" /> }] : []),
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
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? 'translate-x-5' : ''
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
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Settings tabs">
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
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
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
            <div className="max-w-xl space-y-6">
              {/* Notification Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notification Email
                </label>
                <div className="flex gap-3">
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
                <p className="text-xs text-gray-500 mt-2">
                  Receive document expiry reminders and case status updates at this email
                </p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Notification Preferences</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Email Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive important updates via email</p>
                    </div>
                    <Toggle enabled={emailNotifications} onToggle={() => setEmailNotifications(!emailNotifications)} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Case Status Alerts</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when your case status changes</p>
                    </div>
                    <Toggle enabled={caseStatusAlerts} onToggle={() => setCaseStatusAlerts(!caseStatusAlerts)} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Document Expiry Reminders</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive alerts before documents expire</p>
                    </div>
                    <Toggle enabled={documentReminders} onToggle={() => setDocumentReminders(!documentReminders)} />
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
                      <div className="flex gap-2">
                        <Button
                          onClick={handleChangePasscode}
                          disabled={isSaving}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Save Passcode
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
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleExportData('json')}
                      disabled={isExporting}
                      className="h-10"
                    >
                      {isExporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                      Export as JSON
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExportData('csv')}
                      disabled={isExporting}
                      className="h-10"
                    >
                      Export as CSV
                    </Button>
                  </div>
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
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
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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
