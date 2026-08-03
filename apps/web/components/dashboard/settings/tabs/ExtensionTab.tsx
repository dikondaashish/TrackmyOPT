"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Check,
  Chrome,
  Link2,
  RefreshCw,
  Smartphone,
  Unlink,
  Activity,
  ArrowRight
} from "lucide-react";

import type { ExtensionStatus, UserProfile } from "../settings-types";

interface ExtensionTabProps {
  extensionStatus: ExtensionStatus;
  handleDisconnectExtension: () => Promise<void>;
  profile: UserProfile;
  recentLogins: { device: string; location: string; time: string; }[];
}

export function ExtensionTab({
  extensionStatus,
  handleDisconnectExtension,
  profile,
  recentLogins,
}: ExtensionTabProps) {

  return (
    (
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
                <Link
                  href="/dashboard/extension"
                  className="group flex min-h-24 items-center gap-4 rounded-xl border border-blue-200 bg-blue-50/60 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-blue-900 dark:bg-blue-950/20 dark:hover:border-blue-800 dark:hover:bg-blue-950/30"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Chrome className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Set up Chrome Job Prefill
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-gray-600 dark:text-gray-300">
                      Add or edit the contact, address, visa, work preference,
                      and optional DEI data used by the extension.
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-blue-600 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-blue-400" />
                </Link>

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
                        onClick={() => window.open('https://chromewebstore.google.com/detail/hfljbefkccdmlnhclfojlafipjnjbajm?utm_source=item-share-cb', '_blank')}
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
        )
  );
}
