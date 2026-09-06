"use client";

import { Check, Download } from "lucide-react";

export function SettingsZipExportUpgradeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Download className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>

        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
          Upgrade to Pro
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          ZIP export with documents is a Pro feature. Upgrade to download all your data including uploaded documents.
        </p>

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

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Maybe Later
          </button>
          <a
            href="/pricing"
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-medium text-center"
          >
            Upgrade to Pro
          </a>
        </div>
      </div>
    </div>
  );
}
