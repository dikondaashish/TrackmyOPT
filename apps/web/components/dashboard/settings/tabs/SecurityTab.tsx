"use client";

import { Button } from "@/components/ui/button";
import {
  Shield,
  Loader2,
  AlertCircle,
  LogOut,
  Trash2,
  Key} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface SecurityTabProps {
  handleDeleteAccount: () => Promise<void>;
  handlePasswordReset: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  isChangingPassword: boolean;
  isDeleting: boolean;
  setShowDeleteConfirm: Dispatch<SetStateAction<boolean>>;
  showDeleteConfirm: boolean;
}

export function SecurityTab({
  handleDeleteAccount,
  handlePasswordReset,
  handleSignOut,
  isChangingPassword,
  isDeleting,
  setShowDeleteConfirm,
  showDeleteConfirm,
}: SecurityTabProps) {

  return (
    (
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
        )
  );
}
