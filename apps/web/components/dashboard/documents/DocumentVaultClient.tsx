'use client';

/**
 * Document Vault Client Component
 * 
 * Main interface for secure document storage with:
 * - Passcode protection
 * - AI document analysis  
 * - Document upload, view, delete
 * - Expiry tracking and reminders
 */

import { useState, useEffect } from 'react';
import { PasscodeSetupModal } from '../settings/PasscodeSetupModal';
import { PasscodeVerifyModal } from '../security/PasscodeVerifyModal';
import { DocumentUploadModal } from './DocumentUploadModal';
import { DocumentGrid } from './DocumentGrid';
import { DocumentStats } from './DocumentStats';
import { DocumentFilters } from './DocumentFilters';
import { PremiumUpsellModal } from '../widgets/PremiumUpsellModal';

interface Document {
  id: string;
  filename: string;
  documentType: string;
  category: string;
  issueDate: string | null;
  expiryDate: string | null;
  summary: string;
  extractedFields: Record<string, any>;
  aiConfidence: number;
  uploadedAt: string;
}

export function DocumentVaultClient() {
  // State
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [premiumCheckError, setPremiumCheckError] = useState(false);
  const [hasPasscode, setHasPasscode] = useState<boolean | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const [showPasscodeSetup, setShowPasscodeSetup] = useState(false);
  const [showPasscodeVerify, setShowPasscodeVerify] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Email notification state
  const [notificationEmail, setNotificationEmail] = useState('');
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);

  // Auto-lock timeout state
  const [autoLockTimeout, setAutoLockTimeout] = useState<number>(5); // Default 5 minutes
  const [lastActivity, setLastActivity] = useState<number>(0);

  // Check premium status
  useEffect(() => {
    checkPremiumStatus();
    // Initialize lastActivity to current time after hydration
    setLastActivity(Date.now());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check passcode status and get auto-lock settings
  useEffect(() => {
    if (isPremium) {
      checkPasscodeStatus();
    }
  }, [isPremium]);

  // Load documents after unlock
  useEffect(() => {
    if (isUnlocked) {
      loadDocuments();
      loadNotificationEmail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnlocked, selectedCategory, searchQuery, sortBy]);

  // Auto-lock timer - locks vault after period of inactivity
  useEffect(() => {
    if (!isUnlocked || autoLockTimeout === 0) return; // 0 = never auto-lock

    const checkInactivity = () => {
      const now = Date.now();
      const inactiveTime = (now - lastActivity) / 1000 / 60; // in minutes

      if (inactiveTime >= autoLockTimeout) {
        setIsUnlocked(false);
        setShowPasscodeVerify(true);
      }
    };

    const interval = setInterval(checkInactivity, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isUnlocked, autoLockTimeout, lastActivity]);

  // Track user activity to reset auto-lock timer
  useEffect(() => {
    if (!isUnlocked) return;

    const resetActivity = () => setLastActivity(Date.now());

    // Track mouse, keyboard, touch events
    window.addEventListener('mousemove', resetActivity);
    window.addEventListener('keydown', resetActivity);
    window.addEventListener('click', resetActivity);
    window.addEventListener('scroll', resetActivity);
    window.addEventListener('touchstart', resetActivity);

    return () => {
      window.removeEventListener('mousemove', resetActivity);
      window.removeEventListener('keydown', resetActivity);
      window.removeEventListener('click', resetActivity);
      window.removeEventListener('scroll', resetActivity);
      window.removeEventListener('touchstart', resetActivity);
    };
  }, [isUnlocked]);

  async function loadNotificationEmail() {
    try {
      const res = await fetch('/api/user/notification-email');
      if (res.ok) {
        const data = await res.json();
        setNotificationEmail(data.email || '');
      }
    } catch (error) {
    }
  }

  async function saveNotificationEmail() {
    if (!notificationEmail || !notificationEmail.trim()) {
      alert('Please enter a valid email address');
      return;
    }

    setEmailSaving(true);
    try {
      const res = await fetch('/api/user/notification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: notificationEmail.trim(), toolType: 'documents' }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setEditingEmail(false);
        // Optionally show success message
      } else {
        const errorMessage = data.error || 'Failed to save notification email';
        alert(errorMessage);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save notification email. Please try again.');
    } finally {
      setEmailSaving(false);
    }
  }

  async function checkPremiumStatus() {
    try {
      const res = await fetch('/api/premium/status');
      if (!res.ok) {
        // Server-side error — don't falsely show the upsell; show retry instead
        setPremiumCheckError(true);
        return;
      }
      const data = await res.json();
      setPremiumCheckError(false);
      setIsPremium(data.isPremium === true);
    } catch {
      // Network error — keep isPremium as null and show a retry state
      setPremiumCheckError(true);
    }
  }

  async function checkPasscodeStatus() {
    try {
      const res = await fetch('/api/documents/passcode/status');
      const data = await res.json();
      setHasPasscode(data.hasPasscode);

      // Set auto-lock timeout from settings
      if (data.autoLockTimeout !== undefined) {
        setAutoLockTimeout(data.autoLockTimeout);
      }

      if (!data.hasPasscode) {
        setShowPasscodeSetup(true);
      } else {
        setShowPasscodeVerify(true);
      }
    } catch (error) {
      setHasPasscode(false);
      setShowPasscodeSetup(true);
    }
  }

  async function loadDocuments() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      params.append('sort', sortBy);

      const res = await fetch(`/api/documents?${params}`);
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (error) {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }

  function handlePasscodeSetupComplete() {
    setShowPasscodeSetup(false);
    setHasPasscode(true);
    setShowPasscodeVerify(true);
  }

  function handlePasscodeVerifySuccess() {
    setShowPasscodeVerify(false);
    setIsUnlocked(true);
    setLastActivity(Date.now()); // Reset activity timer on unlock
  }

  function handleUploadClick() {
    setShowUploadModal(true);
  }

  function handleUploadComplete() {
    setShowUploadModal(false);
    loadDocuments(); // Refresh document list
  }

  function handleDocumentDelete(documentId: string) {
    setDocuments(docs => docs.filter(d => d.id !== documentId));
  }

  // Network / server error while checking premium — show retry, not upsell
  if (premiumCheckError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <p className="text-gray-600 dark:text-muted-foreground text-sm">
            Unable to verify your account. Please try again.
          </p>
          <button
            onClick={() => {
              setPremiumCheckError(false);
              checkPremiumStatus();
            }}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show an upsell / preview for non-premium users instead of hard redirect
  if (isPremium === false) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-8">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 border border-blue-100 dark:border-blue-800 rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
                <span className="text-3xl">🔐</span>
                Document Vault (Pro)
              </h1>
              <p className="text-sm text-gray-700 dark:text-muted-foreground mt-2 max-w-xl">
                Securely store your I-20s, EAD cards, I-983, offer letters, and paystubs with AI-powered analysis
                and automatic expiry reminders.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a
                href="/premium/checkout"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm hover:shadow-md"
              >
                Unlock with Pro
              </a>
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-gray-300 dark:border-border text-sm font-medium text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-muted transition"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <span className="text-lg">📁</span>
              All documents in one place
            </h2>
            <p className="text-sm text-muted-foreground">
              Upload I-20s, EAD cards, passport, visa, I-983, offer letters, and paystubs with smart tags and filters.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <span className="text-lg">🤖</span>
              AI-powered document analysis
            </h2>
            <p className="text-sm text-muted-foreground">
              Gemini AI reads your documents to extract expiry dates, SEVIS IDs, receipt numbers, and key fields automatically.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <span className="text-lg">⏰</span>
              Smart expiry reminders
            </h2>
            <p className="text-sm text-muted-foreground">
              Get email alerts at 60, 45, 30, 20, 15, 10, 5, 3, 2, and 1 day before any critical document expires.
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          You can continue using the rest of your dashboard on the Free plan. Upgrade any time to unlock Document Vault.
        </p>
      </div>
    );
  }

  // Show loading state
  if (isPremium === null || hasPasscode === null) {
    return <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-muted-foreground">Loading Document Vault...</p>
      </div>
    </div>;
  }

  // Show passcode setup modal
  if (showPasscodeSetup) {
    return (
      <PasscodeSetupModal
        open={showPasscodeSetup}
        onComplete={handlePasscodeSetupComplete}
      />
    );
  }

  // Show passcode verification modal
  if (showPasscodeVerify) {
    return (
      <PasscodeVerifyModal
        open={showPasscodeVerify}
        onSuccess={handlePasscodeVerifySuccess}
        onCancel={() => window.history.back()}
      />
    );
  }

  // Main document vault interface
  return (
    <div className="space-y-4">
      {/* Security Trust Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-300 text-sm">Enterprise-Grade Security</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Your documents are protected with bank-level security</p>
            </div>
          </div>

          {/* Security Badges */}
          <div className="flex flex-wrap gap-2">
            {/* SSL/TLS Encryption */}
            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-700 shadow-sm">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">SSL/TLS Encrypted</span>
            </div>

            {/* AWS S3 */}
            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-700 shadow-sm">
              <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">AWS S3 Storage</span>
            </div>

            {/* AES-256 Encryption */}
            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-700 shadow-sm">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">AES-256 Encryption</span>
            </div>

            {/* Secure Authentication */}
            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-700 shadow-sm">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">2FA Ready</span>
            </div>

            {/* Passcode Protected */}
            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-700 shadow-sm">
              <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
              </svg>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Passcode Protected</span>
            </div>

            {/* SOC 2 Compliant */}
            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-700 shadow-sm">
              <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">SOC 2 Type II</span>
            </div>

            {/* GDPR Compliant */}
            <div className="flex items-center gap-1.5 bg-white/80 dark:bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-700 shadow-sm">
              <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">GDPR Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Header with Email Notifications */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-800 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
              <span className="text-3xl">🔐</span>
              Document Vault
            </h1>
            <p className="text-sm text-gray-600 dark:text-muted-foreground mt-1">
              Secure storage with AI-powered document analysis
            </p>
          </div>
          <button
            onClick={handleUploadClick}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload
          </button>
        </div>

        {/* Email Notification Setup */}
        <div className="bg-white dark:bg-card rounded-lg p-4 border border-gray-200 dark:border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-900 dark:text-foreground">Expiry Reminder Email</span>
            </div>
            {!editingEmail && notificationEmail && (
              <button
                onClick={() => setEditingEmail(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit
              </button>
            )}
          </div>

          {editingEmail || !notificationEmail ? (
            <div className="flex gap-2">
              <input
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                placeholder="Enter email for document reminders"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-muted dark:text-foreground"
              />
              <button
                onClick={saveNotificationEmail}
                disabled={emailSaving || !notificationEmail}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors font-medium"
              >
                {emailSaving ? 'Saving...' : 'Save'}
              </button>
              {notificationEmail && editingEmail && (
                <button
                  onClick={() => {
                    setEditingEmail(false);
                    loadNotificationEmail();
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-border text-gray-700 dark:text-foreground text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-muted-foreground">{notificationEmail}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-muted-foreground mt-2">
            📬 Get notified at 60, 45, 30, 20, 15, 10, 5, 3, 2, and 1 day before your documents expire
          </p>
        </div>
      </div>

      {/* Stats */}
      <DocumentStats documents={documents} />

      {/* Filters */}
      <DocumentFilters
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        sortBy={sortBy}
        onCategoryChange={setSelectedCategory}
        onSearchChange={setSearchQuery}
        onSortChange={setSortBy}
        customCategories={[...new Set(documents.map(d => d.category || d.documentType).filter(Boolean))]}
      />

      {/* Documents Grid */}
      <DocumentGrid
        documents={documents}
        loading={loading}
        onDocumentDelete={handleDocumentDelete}
        onRefresh={loadDocuments}
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <DocumentUploadModal
          open={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onComplete={handleUploadComplete}
        />
      )}
    </div>
  );
}

