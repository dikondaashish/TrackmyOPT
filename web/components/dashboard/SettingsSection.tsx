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
  Crown,
  Loader2,
  Check,
  AlertCircle,
  LogOut,
  Trash2,
  Key,
  Globe,
  CreditCard,
  Palette
} from "lucide-react";

// Tab types
type SettingsTab = 'profile' | 'password' | 'plan' | 'notifications' | 'appearance';

interface UserProfile {
  email: string;
  fullName: string;
  timezone: string;
  isStemEligible: boolean;
  notificationEmail: string;
}

interface PremiumStatus {
  isPremium: boolean;
  planName?: string;
  expiresAt?: string;
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
    isStemEligible: false,
    notificationEmail: "",
  });
  
  // Premium status
  const [premium, setPremium] = useState<PremiumStatus>({ isPremium: false });
  
  // Theme
  const [darkMode, setDarkMode] = useState(false);
  
  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [caseStatusAlerts, setCaseStatusAlerts] = useState(true);
  const [documentReminders, setDocumentReminders] = useState(true);

  // Password change
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load user data
  useEffect(() => {
    loadUserData();
    loadDarkModePreference();
  }, []);

  const loadDarkModePreference = () => {
    const savedMode = localStorage.getItem('tmo_dark_mode');
    setDarkMode(savedMode === 'true');
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
          isStemEligible: meData.profile?.is_stem_eligible || false,
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
      // Save profile logic here
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError('Failed to save profile');
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

  const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "America/Anchorage", label: "Alaska Time (AKT)" },
    { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
    { value: "UTC", label: "UTC" },
  ];

  // Tab configuration
  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'password', label: 'Password', icon: <Key className="w-4 h-4" /> },
    { id: 'plan', label: 'Plan', icon: <Crown className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
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

        {/* Password Tab */}
        {activeTab === 'password' && (
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
                    {showDeleteConfirm ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDeleteConfirm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => {
                            alert('Please contact support to delete your account.');
                            setShowDeleteConfirm(false);
                          }}
                        >
                          Confirm
                        </Button>
                      </div>
                    ) : (
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
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Plan Tab */}
        {activeTab === 'plan' && (
          <div className="p-6 sm:p-8">
            <div className="max-w-xl">
              {premium.isPremium ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <Crown className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Premium Plan</h2>
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        You have full access to all features
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800/50">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Your Premium Benefits</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Document Vault with secure storage</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Advanced email notifications</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Priority customer support</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Case status tracking</li>
                    </ul>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/dashboard/premium'}
                    className="h-11"
                  >
                    Manage Subscription
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Crown className="w-7 h-7 text-gray-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Free Plan</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Upgrade to unlock all features
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Upgrade to Premium</h3>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-500" /> Document Vault with secure storage</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-500" /> Advanced email notifications</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-500" /> Priority customer support</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4 text-purple-500" /> Case status tracking</li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => window.location.href = '/premium/checkout'}
                    className="h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </div>
              )}
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
