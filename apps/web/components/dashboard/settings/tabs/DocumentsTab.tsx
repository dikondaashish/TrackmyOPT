"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Shield,
  Loader2,
  AlertCircle,
  Lock,
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { DocumentSettings } from "../settings-types";

interface DocumentsTabProps {
  confirmPasscode: string;
  currentPasscode: string;
  docSettings: DocumentSettings;
  handleAutoLockChange: (timeout: number) => Promise<void>;
  handleChangePasscode: () => Promise<void>;
  handleLockoutDurationChange: (duration: number) => Promise<void>;
  handleResendOtp: () => Promise<void>;
  handleVerifyOtp: () => Promise<void>;
  newPasscode: string;
  otp: string;
  otpCountdown: number;
  otpEmail: string;
  sendingOtp: boolean;
  setConfirmPasscode: Dispatch<SetStateAction<string>>;
  setCurrentPasscode: Dispatch<SetStateAction<string>>;
  setNewPasscode: Dispatch<SetStateAction<string>>;
  setOtp: Dispatch<SetStateAction<string>>;
  setOtpCountdown: Dispatch<SetStateAction<number>>;
  setShowOtpInput: Dispatch<SetStateAction<boolean>>;
  setShowPasscodeChange: Dispatch<SetStateAction<boolean>>;
  setShowPasscodes: Dispatch<SetStateAction<boolean>>;
  showOtpInput: boolean;
  showPasscodeChange: boolean;
  showPasscodes: boolean;
  verifyingOtp: boolean;
}

export function DocumentsTab({
  confirmPasscode,
  currentPasscode,
  docSettings,
  handleAutoLockChange,
  handleChangePasscode,
  handleLockoutDurationChange,
  handleResendOtp,
  handleVerifyOtp,
  newPasscode,
  otp,
  otpCountdown,
  otpEmail,
  sendingOtp,
  setConfirmPasscode,
  setCurrentPasscode,
  setNewPasscode,
  setOtp,
  setOtpCountdown,
  setShowOtpInput,
  setShowPasscodeChange,
  setShowPasscodes,
  showOtpInput,
  showPasscodeChange,
  showPasscodes,
  verifyingOtp,
}: DocumentsTabProps) {

  return (
    (
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
        )
  );
}
