"use client";

/**
 * Document Vault passcode settings: the 6-digit passcode change flow (which is
 * OTP-gated), auto-lock timeout, and lockout duration.
 */
import { useState, useEffect } from "react";

import type { DocumentSettings } from "./settings-types";

export function useDocumentPasscode({
  setSuccess,
  setError,
}: {
  setSuccess: (message: string | null) => void;
  setError: (message: string | null) => void;
}) {
  // Document Vault Settings
  const [docSettings, setDocSettings] = useState<DocumentSettings>({
    hasPasscode: false,
    autoLockTimeout: 5,
    lockoutDuration: 10, // Default 10 minutes
  });
  const [showPasscodeChange, setShowPasscodeChange] = useState(false);
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscodes, setShowPasscodes] = useState(false);

  // OTP verification state for passcode change
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const loadDocumentSettings = async () => {
    try {
      const res = await fetch('/api/documents/passcode/status', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setDocSettings({
          hasPasscode: data.hasPasscode || false,
          autoLockTimeout: data.autoLockTimeout || 5,
          lockoutDuration: data.lockoutDuration || 10,
        });
      }
    } catch {
      // Silently fail
    }
  };

  // Change Document Passcode - Step 1: Send OTP
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
      setSendingOtp(true);
      setError(null);

      // Send OTP to user's email
      const res = await fetch('/api/documents/passcode/send-otp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPasscode: docSettings.hasPasscode ? currentPasscode : undefined,
          newPasscode,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setOtpEmail(data.email);
        setShowOtpInput(true);
        setOtpCountdown(600); // 10 minutes
        setSuccess(`OTP sent to ${data.email}`);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };


  // Change Document Passcode - Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError('OTP must be 6 digits');
      return;
    }

    try {
      setVerifyingOtp(true);
      setError(null);

      const res = await fetch('/api/documents/passcode/verify-otp', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp,
          newPasscode,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Passcode changed successfully!');
        // Reset all states
        setShowPasscodeChange(false);
        setShowOtpInput(false);
        setCurrentPasscode('');
        setNewPasscode('');
        setConfirmPasscode('');
        setOtp('');
        setOtpEmail('');
        setOtpCountdown(0);
        setDocSettings(prev => ({ ...prev, hasPasscode: true }));
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.error || 'Failed to verify OTP');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    await handleChangePasscode();
  };

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

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

  // Update Lockout Duration (after 3 failed attempts)
  const handleLockoutDurationChange = async (duration: number) => {
    try {
      setDocSettings(prev => ({ ...prev, lockoutDuration: duration }));

      const res = await fetch('/api/documents/passcode/status', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lockoutDuration: duration }),
      });

      if (res.ok) {
        setSuccess('Lockout duration updated!');
        setTimeout(() => setSuccess(null), 2000);
      } else {
        throw new Error('Failed to update');
      }
    } catch {
      setError('Failed to update lockout duration');
      // Revert on error
      loadDocumentSettings();
    }
  };

  return {
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
  };
}
