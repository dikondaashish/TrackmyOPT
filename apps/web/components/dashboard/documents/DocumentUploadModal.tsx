'use client';

/**
 * Document Upload Modal
 * 
 * Upload documents with AI-powered analysis
 * Shows upload state and AI analysis results
 */

import { useState, useRef, useEffect } from 'react';
import { ScanLine } from 'lucide-react';
import { documentTypeLabel, formatExpiryDate } from '@/lib/documents/vault-utils';
import type { VaultDocument } from '@/lib/documents/vault-utils';

interface DocumentUploadModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type UploadStage = 'select' | 'saving' | 'complete' | 'error';

export function DocumentUploadModal({ open, onClose, onComplete }: DocumentUploadModalProps) {
  const [stage, setStage] = useState<UploadStage>('select');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState<VaultDocument | null>(null);
  const [needsManualExpiry, setNeedsManualExpiry] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    return () => {
      if (dialog?.open) {
        if (typeof dialog.close === 'function') dialog.close();
        else dialog.removeAttribute('open');
      }
    };
  }, [open]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    e.target.value = '';
    if (selectedFile) selectFile(selectedFile);
  }

  function selectFile(selectedFile: File) {

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setFile(null);
      setError('Invalid file type. Only PDF, JPEG, PNG, and WebP are allowed.');
      return;
    }

    if (selectedFile.size === 0) {
      setFile(null);
      setError('This file is empty. Choose a document with content.');
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    setFile(selectedFile);
    setError('');
  }

  async function handleUpload() {
    if (!file || stage === 'saving') return;

    setStage('saving');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResult(data.document);
      setNeedsManualExpiry(Boolean(data.needsManualExpiry));
      setStage('complete');


    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setStage('error');
    }
  }

  function handleClose() {
    if (stage === 'saving') return;
    if (stage === 'complete') { onComplete(); return; }
    resetState();
    onClose();
  }

  function resetState() {
    setStage('select');
    setFile(null);
    setError('');
    setResult(null);
    setNeedsManualExpiry(false);
  }

  function handleTryAgain() {
    setStage('select');
    setError('');
  }

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-label="Upload document"
      onCancel={(event) => {
        event.preventDefault();
        if (stage !== 'saving') handleClose();
      }}
      className="w-[calc(100%-2rem)] max-w-xl max-h-[92dvh] overflow-y-auto rounded-lg bg-white p-4 sm:p-6 backdrop:bg-black/50"
    >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Upload Document</h2>
          {stage !== 'saving' && (
            <button
              type="button"
              onClick={handleClose}
              className="min-h-11 min-w-11 text-gray-400 hover:text-gray-600"
              aria-label="Close document upload"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* File Select */}
        {stage === 'select' && (
          <div className="space-y-4">
            {/* Drop Zone */}
            <div
              onDragOver={event => event.preventDefault()}
              onDrop={event => {
                event.preventDefault();
                if (event.dataTransfer.files.length !== 1) { setError('Choose one document at a time.'); return; }
                selectFile(event.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Select a document to upload"
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center cursor-pointer hover:border-cyan-500 transition-colors"
            >
              <svg className="w-10 h-10 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="break-all text-base font-medium text-gray-700 mb-2">
                {file ? file.name : 'Choose a file or drop it here'}
              </p>
              <p className="text-sm text-gray-500">
                PDF, JPEG, PNG, or WebP • Max 10MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              aria-label="Document file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {error && (
              <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {file && (
              <div className="flex gap-3">
                <button
                  onClick={() => { setFile(null); setError(''); }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Remove file
                </button>
                <button
                  onClick={handleUpload}
                  className="flex-1 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                >
                  Upload & Analyze
                </button>
              </div>
            )}
          </div>
        )}

        {/* The server handles upload and analysis in one request. */}
        {stage === 'saving' && (
          <div role="status" className="flex flex-col items-center gap-3 py-10 text-center text-gray-700">
            <ScanLine className="h-8 w-8 animate-pulse text-blue-600" aria-hidden />
            <p className="font-medium">Uploading and analyzing your document…</p>
            <p className="text-sm text-gray-500">This can take a little while for larger files.</p>
          </div>
        )}

        {/* Complete */}
        {stage === 'complete' && result && (
          <div role="status" className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Complete!</h3>
              <p className="text-gray-600">Document saved to your vault</p>
            </div>

            {/* Results Summary */}
            <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span className="text-gray-600">Document Type:</span>
                <span className="font-medium capitalize">{documentTypeLabel(result.documentType || 'other')}</span>
              </div>
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span className="text-gray-600">AI Confidence:</span>
                <span className="font-medium">{result.aiConfidence}%</span>
              </div>
              {result.expiryDate && (
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span className="text-gray-600">Expiry Date:</span>
                  <span className="font-medium">{formatExpiryDate(result.expiryDate, { month: 'short', day: 'numeric', year: 'numeric' }) || 'Not detected'}</span>
                </div>
              )}
            </div>

            {needsManualExpiry ? (
              <div className="space-y-3">
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  Please review this document and add or confirm its expiry date so reminders can be scheduled.
                </p>
                <button onClick={onComplete} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                  View documents
                </button>
              </div>
            ) : (
              <button onClick={onComplete} className="min-h-11 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">View documents</button>
            )}
          </div>
        )}

        {/* Error */}
        {stage === 'error' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Failed</h3>
              <p role="alert" className="text-red-600">{error}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleTryAgain}
                className="flex-1 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
    </dialog>
  );
}
