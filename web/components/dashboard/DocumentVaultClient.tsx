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
import { PasscodeSetupModal } from './PasscodeSetupModal';
import { PasscodeVerifyModal } from './PasscodeVerifyModal';
import { DocumentUploadModal } from './DocumentUploadModal';
import { DocumentGrid } from './DocumentGrid';
import { DocumentStats } from './DocumentStats';
import { DocumentFilters } from './DocumentFilters';

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

  // Check premium status
  useEffect(() => {
    checkPremiumStatus();
  }, []);

  // Check passcode status
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
  }, [isUnlocked, selectedCategory, searchQuery, sortBy]);
  
  async function loadNotificationEmail() {
    try {
      const res = await fetch('/api/user/notification-email');
      if (res.ok) {
        const data = await res.json();
        setNotificationEmail(data.email || '');
      }
    } catch (error) {
      console.error('Error loading notification email:', error);
    }
  }
  
  async function saveNotificationEmail() {
    setEmailSaving(true);
    try {
      const res = await fetch('/api/user/notification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: notificationEmail }),
      });
      
      if (res.ok) {
        setEditingEmail(false);
      } else {
        throw new Error('Failed to save email');
      }
    } catch (error) {
      console.error('Error saving email:', error);
      alert('Failed to save notification email');
    } finally {
      setEmailSaving(false);
    }
  }

  async function checkPremiumStatus() {
    try {
      const res = await fetch('/api/premium/status');
      const data = await res.json();
      setIsPremium(data.isPremium || false);
    } catch (error) {
      console.error('Error checking premium status:', error);
      setIsPremium(false);
    }
  }

  async function checkPasscodeStatus() {
    try {
      const res = await fetch('/api/documents/passcode/status');
      const data = await res.json();
      setHasPasscode(data.hasPasscode);
      
      if (!data.hasPasscode) {
        setShowPasscodeSetup(true);
      } else {
        setShowPasscodeVerify(true);
      }
    } catch (error) {
      console.error('Error checking passcode status:', error);
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
      console.error('Error loading documents:', error);
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

  // Redirect non-premium users to pricing page
  if (isPremium === false) {
    if (typeof window !== 'undefined') {
      window.location.href = '/premium/checkout';
    }
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to upgrade page...</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isPremium === null || hasPasscode === null) {
    return <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Document Vault...</p>
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
      {/* Modern Header with Email Notifications */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-3xl">🔐</span>
              Document Vault
            </h1>
            <p className="text-sm text-gray-600 mt-1">
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
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Expiry Reminder Email</span>
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
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-600">{notificationEmail}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            📬 Get notified 30 days before your documents expire
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

