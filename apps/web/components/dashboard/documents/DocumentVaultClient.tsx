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

import { useState, useEffect, useMemo } from 'react';
import { Clock, FolderOpen, Lock, ScanLine, Mail, ShieldCheck } from 'lucide-react';
import { PasscodeSetupModal } from '../settings/PasscodeSetupModal';
import { PasscodeVerifyModal } from '../security/PasscodeVerifyModal';
import { DocumentUploadModal } from './DocumentUploadModal';
import { DocumentGrid } from './DocumentGrid';
import { DocumentStats } from './DocumentStats';
import { DocumentFilters } from './DocumentFilters';
import { filterAndSortDocuments, type VaultDocument } from '@/lib/documents/vault-utils';

export function DocumentVaultClient() {
  // State
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [premiumCheckError, setPremiumCheckError] = useState(false);
  const [hasPasscode, setHasPasscode] = useState<boolean | null>(null);
  const [passcodeStatusError, setPasscodeStatusError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState('');

  const [showPasscodeSetup, setShowPasscodeSetup] = useState(false);
  const [showPasscodeVerify, setShowPasscodeVerify] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const visibleDocuments = useMemo(
    () => filterAndSortDocuments(documents, selectedCategory, searchQuery, sortBy),
    [documents, selectedCategory, searchQuery, sortBy],
  );

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
  }, [isUnlocked]);

  // Auto-lock timer - locks vault after period of inactivity
  useEffect(() => {
    if (!isUnlocked || autoLockTimeout === 0) return; // 0 = never auto-lock

    const checkInactivity = () => {
      const now = Date.now();
      const inactiveTime = (now - lastActivity) / 1000 / 60; // in minutes

      if (inactiveTime >= autoLockTimeout) {
        setDocuments([]);
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
    } catch (_error) {
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
      const res = await fetch('/api/premium/status', {
        credentials: 'include',
        cache: 'no-store',
      });
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
      if (!res.ok) throw new Error('Could not check vault passcode');
      const data = await res.json();
      setPasscodeStatusError(false);
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
    } catch (_error) {
      setPasscodeStatusError(true);
    }
  }

  async function loadDocuments() {
    setLoading(true);
    try {
      const res = await fetch('/api/documents', { cache: 'no-store' });
      if (!res.ok) throw new Error('Could not load your documents. Please try again.');
      const data = await res.json();
      setDocuments(data.documents || []);
      setDocumentsError('');
    } catch (error) {
      setDocumentsError(error instanceof Error ? error.message : 'Could not load your documents. Please try again.');
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
                <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                Document Vault (Pro)
              </h1>
              <p className="text-sm text-gray-700 dark:text-muted-foreground mt-2 max-w-xl">
                Securely store your I-20s, EAD cards, I-983, offer letters, and paystubs with AI-powered analysis
                and automatic expiry reminders.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a
                href="/premium/checkout?planId=pro&interval=year"
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
              <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              All documents in one place
            </h2>
            <p className="text-sm text-muted-foreground">
              Upload I-20s, EAD cards, passport, visa, I-983, offer letters, and paystubs with smart tags and filters.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              AI-powered document analysis
            </h2>
            <p className="text-sm text-muted-foreground">
              Gemini AI reads your documents to extract expiry dates, SEVIS IDs, receipt numbers, and key fields automatically.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              Smart expiry reminders
            </h2>
            <p className="text-sm text-muted-foreground">
              Get email reminders before a document expires.
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Upgrade to Pro to unlock Document Vault — secure storage for EAD, I-20, and passport with expiry reminders.
        </p>
      </div>
    );
  }

  if (passcodeStatusError) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600 dark:text-muted-foreground">Unable to check your vault passcode. Please try again.</p>
          <button onClick={checkPasscodeStatus} className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700">Retry</button>
        </div>
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
    <div className="space-y-4" data-document-vault data-ph-no-capture>
      {/* Modern Header with Email Notifications */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-800 rounded-xl p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
              <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Document Vault
            </h1>
            <p className="text-sm text-gray-600 dark:text-muted-foreground mt-1">
              Secure storage with AI-powered document analysis
            </p>
          </div>
          <button
            onClick={handleUploadClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload
          </button>
        </div>

        {/* Email Notification Setup */}
        <div className="bg-white dark:bg-card rounded-lg p-3 border border-gray-200 dark:border-border">
          <div className="flex items-center justify-between mb-1">
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
          <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1.5 flex items-start gap-1.5">
            <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>Get email reminders before your documents expire.</span>
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
      {documentsError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {documentsError}
          <button onClick={loadDocuments} className="ml-3 font-semibold underline">Retry</button>
        </div>
      )}
      {(!documentsError || documents.length > 0) && (
        <DocumentGrid
          documents={visibleDocuments}
          loading={loading}
          hasFilters={selectedCategory !== 'all' || searchQuery.trim().length > 0}
          onDocumentDelete={handleDocumentDelete}
          onRefresh={loadDocuments}
        />
      )}

      {/* Security details */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">How your vault is secured</h2>
            <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-300">
              Account sign-in controls access to your documents. The vault passcode locks this screen;
              it does not encrypt your files or replace your account password.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-emerald-900 dark:text-emerald-200">
              <span className="rounded-md border border-emerald-200 bg-white/80 px-2.5 py-1 dark:border-emerald-800 dark:bg-emerald-900/30">Encrypted in transit</span>
              <span className="rounded-md border border-emerald-200 bg-white/80 px-2.5 py-1 dark:border-emerald-800 dark:bg-emerald-900/30">AES-256 at rest in AWS S3</span>
              <span className="rounded-md border border-emerald-200 bg-white/80 px-2.5 py-1 dark:border-emerald-800 dark:bg-emerald-900/30">Time-limited preview links</span>
            </div>
          </div>
        </div>
      </div>

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
