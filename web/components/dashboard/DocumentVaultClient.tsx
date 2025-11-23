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
import { PremiumUpsellModal } from './PremiumUpsellModal';

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
    }
  }, [isUnlocked, selectedCategory, searchQuery, sortBy]);

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

  // Show premium upsell if not premium
  if (isPremium === false) {
    return (
      <PremiumUpsellModal
        open={true}
        onClose={() => window.history.back()}
        feature="Document Vault"
      />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔐 Document Vault</h1>
          <p className="text-gray-600 mt-1">
            Securely store and manage your immigration documents with AI-powered analysis
          </p>
        </div>
        <button
          onClick={handleUploadClick}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Document
        </button>
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

