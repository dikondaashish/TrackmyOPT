"use client";

import { Button } from "@/components/ui/button";
import {
  Loader2,
  Check,
  Download,
  Database,
  History} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface PrivacyTabProps {
  handleExportData: (format: "json" | "csv") => Promise<void>;
  handleResendZipOtp: () => Promise<void>;
  handleZipExportClick: () => Promise<void>;
  handleZipExportVerify: () => Promise<void>;
  isExporting: boolean;
  setShowZipExportOtp: Dispatch<SetStateAction<boolean>>;
  setZipExportOtp: Dispatch<SetStateAction<string>>;
  showZipExportOtp: boolean;
  zipExportCountdown: number;
  zipExportOtp: string;
  zipExportOtpSending: boolean;
  zipExportOtpVerifying: boolean;
}

export function PrivacyTab({
  handleExportData,
  handleResendZipOtp,
  handleZipExportClick,
  handleZipExportVerify,
  isExporting,
  setShowZipExportOtp,
  setZipExportOtp,
  showZipExportOtp,
  zipExportCountdown,
  zipExportOtp,
  zipExportOtpSending,
  zipExportOtpVerifying,
}: PrivacyTabProps) {

  return (
    (
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
                      Data protected with HTTPS (TLS) and access controls
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      We never sell your personal information
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      See Privacy Policy for your rights and choices
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
        )
  );
}
