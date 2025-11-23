'use client';

/**
 * Document View Modal
 * 
 * View and download documents with:
 * - Signed URL for secure viewing
 * - Document metadata display
 * - AI-extracted fields
 * - Download button
 */

import { useState, useEffect } from 'react';

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
}

function isValidDate(dateString: string | null): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function DocumentViewModal({ document, onClose, onDelete }: DocumentViewModalProps) {
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDocument();
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

  function handleDownload() {
    if (viewUrl) {
      window.open(viewUrl, '_blank');
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold capitalize">
              {document.documentType?.replace('_', ' ') || 'Document'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">{document.filename}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
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
                  <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '500px' }}>
                    {document.filename?.toLowerCase().endsWith('.pdf') ? (
                      <iframe
                        src={viewUrl}
                        className="w-full h-full"
                        title={document.filename}
                      />
                    ) : (
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
                    <h3 className="font-semibold text-gray-900 mb-2">📝 Summary</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{document.summary}</p>
                  </div>
                )}

                {/* Key Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Document Type */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Document Type</label>
                    <p className="font-semibold text-gray-900 capitalize mt-1">
                      {document.documentType?.replace(/_/g, ' ') || 'Document'}
                    </p>
                  </div>
                  
                  {/* Expiry Date - Prominent */}
                  {document.expiryDate && isValidDate(document.expiryDate) ? (
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                      <label className="text-xs text-orange-700 uppercase tracking-wide font-medium">⏰ Expires On</label>
                      <p className="font-bold text-orange-900 mt-1">
                        {new Date(document.expiryDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-xs text-orange-700 mt-1">
                        {Math.ceil((new Date(document.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Expiry Date</label>
                      <p className="font-semibold text-gray-900 mt-1">No expiry date</p>
                    </div>
                  )}
                  
                  {/* Uploaded Date */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <label className="text-xs text-gray-500 uppercase tracking-wide">📤 Uploaded</label>
                    <p className="font-semibold text-gray-900 mt-1">
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
                    <h3 className="font-semibold text-gray-900 mb-3">Extracted Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {Object.entries(document.extractedFields).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600 capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="font-medium text-gray-900">{String(value)}</span>
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
        <div className="p-6 border-t flex gap-3">
          <button
            onClick={onDelete}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
          <div className="flex-1"></div>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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

