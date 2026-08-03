"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bell,
  Shield,
  Loader2,
  Trash2,
  Lock,
  Clock} from "lucide-react";
import { OPT_TOOL_ICONS, type OptToolIconKey } from "@/lib/opt-tool-icons";
import type { Dispatch, SetStateAction } from "react";
import type { PremiumStatus, UserProfile } from "../settings-types";
import { Toggle } from "../SettingsToggle";

interface NotificationsTabProps {
  editingSharedEmail: "case" | "document" | null;
  emailNotifications: boolean;
  handleDeleteSharedEmail: () => Promise<void>;
  handleDeleteToolEmail: (toolKey: string) => Promise<void>;
  handleSaveNotificationEmail: () => Promise<void>;
  handleSaveSharedEmail: () => Promise<void>;
  handleSaveToolEmail: (toolKey: string) => Promise<void>;
  isSaving: boolean;
  premium: PremiumStatus;
  profile: UserProfile;
  setEditingSharedEmail: Dispatch<SetStateAction<"case" | "document" | null>>;
  setEmailNotifications: Dispatch<SetStateAction<boolean>>;
  setProfile: Dispatch<SetStateAction<UserProfile>>;
  setTempEmail: Dispatch<SetStateAction<string>>;
  setToolEmails: Dispatch<SetStateAction<{ opt_apply: string; opt_clock: string; stem_apply: string; stem_clock: string; }>>;
  sharedNotificationEmail: string;
  startEditingSharedEmail: (source: "case" | "document") => void;
  tempEmail: string;
  toolEmails: { opt_apply: string; opt_clock: string; stem_apply: string; stem_clock: string; };
}

export function NotificationsTab({
  editingSharedEmail,
  emailNotifications,
  handleDeleteSharedEmail,
  handleDeleteToolEmail,
  handleSaveNotificationEmail,
  handleSaveSharedEmail,
  handleSaveToolEmail,
  isSaving,
  premium,
  profile,
  setEditingSharedEmail,
  setEmailNotifications,
  setProfile,
  setTempEmail,
  setToolEmails,
  sharedNotificationEmail,
  startEditingSharedEmail,
  tempEmail,
  toolEmails,
}: NotificationsTabProps) {

  return (
    (
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
                      onClick={() => window.location.href = '/premium/checkout?planId=pro&interval=year'}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 text-base font-semibold shadow-lg"
                    >
                      Upgrade to Pro
                    </Button>
                  </div>
                )}

                <div className={`space-y-3 ${!premium.isPremium ? 'filter blur-[2px] pointer-events-none' : ''}`}>
                  {([
                    { key: 'opt_apply' as const, label: 'OPT Apply Dates', icon: 'opt_apply' as OptToolIconKey, description: 'OPT filing deadline reminders' },
                    { key: 'opt_clock' as const, label: 'OPT Clock Tracker', icon: 'opt_clock' as OptToolIconKey, description: 'Unemployment days tracking alerts' },
                    { key: 'stem_apply' as const, label: 'STEM Apply Dates', icon: 'stem_apply' as OptToolIconKey, description: 'STEM extension deadline reminders' },
                    { key: 'stem_clock' as const, label: 'STEM Clock Tracker', icon: 'stem_clock' as OptToolIconKey, description: 'STEM unemployment tracking alerts' },
                  ]).map((tool) => {
                    const ToolIcon = OPT_TOOL_ICONS[tool.icon];
                    return (
                    <div key={tool.key} className="p-4 rounded-xl border bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-200/80 dark:bg-gray-800">
                            <ToolIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                          </div>
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
                    );
                  })}
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
                      onClick={() => window.location.href = '/premium/checkout?planId=pro&interval=year'}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 text-base font-semibold shadow-lg"
                    >
                      Upgrade to Pro
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
                      onClick={() => window.location.href = '/premium/checkout?planId=pro&interval=year'}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 text-base font-semibold shadow-lg"
                    >
                      Upgrade to Pro
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
        )
  );
}
