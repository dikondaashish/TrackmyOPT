'use client';

/**
 * Document View Modal
 * 
 * View and download documents with:
 * - Signed URL for secure viewing
 * - Document metadata display
 * - AI-extracted fields
 * - Download button
 * - Edit expiry date
 */

import { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, FolderOpen, Upload } from 'lucide-react';
import { triggerBrowserDownload } from '@/lib/browser-download';

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

interface DocumentViewModalProps {
  document: Document;
  onClose: () => void;
  onDelete: () => void;
  onUpdate?: (updatedDoc: Document) => void;
  autoEditExpiry?: boolean;
}

function isValidDate(dateString: string | null): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

function formatDateForInput(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
}

// Default document type options
const DEFAULT_DOC_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'visa', label: 'Visa' },
  { value: 'i20', label: 'I-20' },
  { value: 'ead_card', label: 'EAD Card' },
  { value: 'i983', label: 'I-983' },
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'paystub', label: 'Paystub' },
  { value: 'receipt_notice', label: 'Receipt Notice' },
  { value: 'other', label: 'Other' },
];

export function DocumentViewModal({ document, onClose, onDelete, onUpdate, autoEditExpiry = false }: DocumentViewModalProps) {
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditingExpiry, setIsEditingExpiry] = useState(autoEditExpiry);
  const [expiryDate, setExpiryDate] = useState(formatDateForInput(document.expiryDate));
  const [savingExpiry, setSavingExpiry] = useState(false);
  const [currentExpiryDate, setCurrentExpiryDate] = useState(document.expiryDate);

  // Document type editing state - use category first (holds updated type), fall back to documentType
  const initialDocType = document.category || document.documentType || 'other';
  const [isEditingType, setIsEditingType] = useState(false);
  const [documentType, setDocumentType] = useState(initialDocType);
  const [customType, setCustomType] = useState(!DEFAULT_DOC_TYPES.some(t => t.value === initialDocType) ? initialDocType.replace(/_/g, ' ') : '');
  const [savingType, setSavingType] = useState(false);
  const [currentDocumentType, setCurrentDocumentType] = useState(initialDocType);
  const [isCustomType, setIsCustomType] = useState(!DEFAULT_DOC_TYPES.some(t => t.value === initialDocType));

  useEffect(() => {
    loadDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document.id]);

  async function loadDocument() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/documents/${document.id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load document');
      }

      setViewUrl(data.document.viewUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    try {
      // Use server-side download endpoint to avoid CORS issues
      const res = await fetch(`/api/documents/${document.id}/download`);
      if (!res.ok) throw new Error('Failed to download');

      const blob = await res.blob();
      triggerBrowserDownload(blob, document.filename || 'document');
    } catch (_err) {
      setError('Failed to download document. Please try again.');
    }
  }

  async function handleSaveExpiryDate() {
    setSavingExpiry(true);
    try {
      const res = await fetch(`/api/documents/${document.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiryDate: expiryDate || null }),
      });

      if (!res.ok) {
        throw new Error('Failed to update expiry date');
      }

      setCurrentExpiryDate(expiryDate || null);
      setIsEditingExpiry(false);

      // Notify parent of update
      if (onUpdate) {
        onUpdate({ ...document, expiryDate: expiryDate || null });
      }
    } catch (_err) {
      setError('Failed to save expiry date');
    } finally {
      setSavingExpiry(false);
    }
  }

  function handleCancelEdit() {
    setExpiryDate(formatDateForInput(currentExpiryDate));
    setIsEditingExpiry(false);
  }

  async function handleSaveDocumentType() {
    setSavingType(true);
    try {
      const newType = isCustomType ? customType.toLowerCase().replace(/\s+/g, '_') : documentType;

      if (!newType || newType.trim() === '') {
        setError('Please enter a document type');
        setSavingType(false);
        return;
      }

      const res = await fetch(`/api/documents/${document.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newType }),
      });

      if (!res.ok) {
        throw new Error('Failed to update document type');
      }

      setCurrentDocumentType(newType);
      setIsEditingType(false);

      // Notify parent of update
      if (onUpdate) {
        onUpdate({ ...document, documentType: newType, category: newType });
      }
    } catch (_err) {
      setError('Failed to save document type');
    } finally {
      setSavingType(false);
    }
  }

  function handleCancelTypeEdit() {
    setDocumentType(currentDocumentType);
    setCustomType('');
    setIsCustomType(!DEFAULT_DOC_TYPES.some(t => t.value === currentDocumentType));
    setIsEditingType(false);
  }

  function handleTypeSelectChange(value: string) {
    if (value === 'custom') {
      setIsCustomType(true);
      setDocumentType('');
    } else {
      setIsCustomType(false);
      setDocumentType(value);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold capitalize dark:text-white">
              {currentDocumentType?.replace(/_/g, ' ') || 'Document'}
            </h2>
            <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">{document.filename}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
              </div>
            )}

            {/* Document Preview/Info */}
            {!loading && !error && (
              <>
                {/* Document Viewer */}
                {viewUrl && (
                  <div className="bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden" style={{ height: '500px' }}>
                    {document.filename?.toLowerCase().endsWith('.pdf') ? (
                      <iframe
                        src={viewUrl}
                        className="w-full h-full"
                        title={document.filename}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={viewUrl}
                        alt={document.filename}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                )}

                {/* Summary */}
                {document.summary && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Summary
                    </h3>
                    <p className="text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">{document.summary}</p>
                  </div>
                )}

                {/* Key Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Document Type - Editable */}
                  {isEditingType ? (
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-800/40 dark:to-indigo-800/40 rounded-lg p-4 border border-purple-200 dark:border-purple-500/40">
                      <label className="text-xs text-purple-700 dark:text-purple-300 uppercase tracking-wide font-medium flex items-center gap-1.5">
                        <FolderOpen className="w-3.5 h-3.5" /> Edit Document Type
                      </label>
                      <select
                        value={isCustomType ? 'custom' : documentType}
                        onChange={(e) => handleTypeSelectChange(e.target.value)}
                        className="w-full mt-2 px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 dark:text-white"
                      >
                        {DEFAULT_DOC_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                        <option value="custom">+ Custom Type...</option>
                      </select>
                      {isCustomType && (
                        <input
                          type="text"
                          value={customType}
                          onChange={(e) => setCustomType(e.target.value)}
                          placeholder="Enter custom type (e.g., Driving License)"
                          className="w-full mt-2 px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 dark:text-white"
                        />
                      )}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={handleSaveDocumentType}
                          disabled={savingType}
                          className="flex-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:bg-purple-300"
                        >
                          {savingType ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelTypeEdit}
                          className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 border border-gray-100 dark:border-slate-600">
                      <div className="flex justify-between items-start">
                        <label className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">Document Type</label>
                        <button
                          onClick={() => setIsEditingType(true)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white capitalize mt-1">
                        {currentDocumentType?.replace(/_/g, ' ') || 'Document'}
                      </p>
                    </div>
                  )}

                  {/* Expiry Date - Editable */}
                  {isEditingExpiry ? (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-800/40 dark:to-indigo-800/40 rounded-lg p-4 border border-blue-200 dark:border-blue-500/40">
                      <label className="text-xs text-blue-700 dark:text-blue-300 uppercase tracking-wide font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Edit Expiry Date
                      </label>
                      <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full mt-2 px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={handleSaveExpiryDate}
                          disabled={savingExpiry}
                          className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                        >
                          {savingExpiry ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : currentExpiryDate && isValidDate(currentExpiryDate) ? (
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-800/40 dark:to-red-800/40 rounded-lg p-4 border border-orange-200 dark:border-orange-500/40">
                      <div className="flex justify-between items-start">
                        <label className="text-xs text-orange-700 dark:text-orange-300 uppercase tracking-wide font-medium flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Expires On
                        </label>
                        <button
                          onClick={() => setIsEditingExpiry(true)}
                          className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="font-bold text-orange-900 dark:text-orange-200 mt-1">
                        {new Date(currentExpiryDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                        {Math.ceil((new Date(currentExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-800/40 dark:to-yellow-800/40 rounded-lg p-4 border border-amber-200 dark:border-amber-500/40">
                      <label className="text-xs text-amber-700 dark:text-amber-300 uppercase tracking-wide font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Expiry Date
                      </label>
                      <p className="font-semibold text-amber-900 dark:text-amber-200 mt-1">No expiry date set</p>
                      <button
                        onClick={() => setIsEditingExpiry(true)}
                        className="mt-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-700/50 text-amber-800 dark:text-amber-200 text-sm rounded-lg hover:bg-amber-200 dark:hover:bg-amber-700 border border-amber-300 dark:border-amber-600 w-full font-medium"
                      >
                        + Add Expiry Date
                      </button>
                    </div>
                  )}

                  {/* Uploaded Date */}
                  <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 border border-gray-100 dark:border-slate-600">
                    <label className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" /> Uploaded
                    </label>
                    <p className="font-semibold text-gray-900 dark:text-white mt-1">
                      {isValidDate(document.uploadedAt)
                        ? new Date(document.uploadedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                        : 'Recently'}
                    </p>
                  </div>
                </div>

                {/* Extracted Fields */}
                {document.extractedFields && Object.keys(document.extractedFields).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Extracted Information</h3>
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 space-y-2">
                      {Object.entries(document.extractedFields).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-slate-400 capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t dark:border-slate-700 flex gap-3 flex-wrap">
          <button
            onClick={onDelete}
            className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
          <button
            onClick={() => setIsEditingExpiry(true)}
            className="px-4 py-2 border border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {currentExpiryDate ? 'Edit Expiry' : 'Add Expiry'}
          </button>
          <div className="flex-1"></div>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            disabled={!viewUrl}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

