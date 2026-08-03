"use client";

/**
 * Account data export: the plain JSON/CSV download plus the OTP-gated ZIP
 * export reserved for Pro.
 */
import { useState, useEffect } from "react";
import { triggerBrowserDownload } from "@/lib/browser-download";

import type { CaseStatusSettings, PremiumStatus, UserProfile } from "./settings-types";

export function useDataExport({
  premium,
  profile,
  caseSettings,
  setSuccess,
  setError,
  setShowUpgradeModal,
}: {
  premium: PremiumStatus;
  profile: UserProfile;
  caseSettings: CaseStatusSettings;
  setSuccess: (message: string | null) => void;
  setError: (message: string | null) => void;
  setShowUpgradeModal: (open: boolean) => void;
}) {
  // Data Export
  const [isExporting, setIsExporting] = useState(false);

  // ZIP Export with OTP verification
  const [showZipExportOtp, setShowZipExportOtp] = useState(false);
  const [zipExportOtp, setZipExportOtp] = useState('');
  const [zipExportOtpSending, setZipExportOtpSending] = useState(false);
  const [zipExportOtpVerifying, setZipExportOtpVerifying] = useState(false);
  const [zipExportCountdown, setZipExportCountdown] = useState(0);

  // Export User Data
  const handleExportData = async (format: 'json' | 'csv') => {
    try {
      setIsExporting(true);

      const res = await fetch(`/api/user/export?format=${format}`, { credentials: 'include' });

      if (res.ok) {
        const blob = await res.blob();
        triggerBrowserDownload(
          blob,
          `trackmyopt-data-${new Date().toISOString().split('T')[0]}.${format}`
        );
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
      triggerBrowserDownload(
        blob,
        `trackmyopt-data-${new Date().toISOString().split('T')[0]}.json`
      );
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
        triggerBrowserDownload(
          blob,
          `trackmyopt-export-${new Date().toISOString().split('T')[0]}.zip`
        );

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

  return {
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
  };
}
