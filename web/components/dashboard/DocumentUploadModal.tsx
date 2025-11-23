'use client';

/**
 * Document Upload Modal
 * 
 * Upload documents with AI-powered analysis
 * Shows real-time progress: Upload → OCR → AI Analysis → Complete
 */

import { useState, useRef } from 'react';

interface DocumentUploadModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type UploadStage = 'select' | 'uploading' | 'processing' | 'complete' | 'error';

export function DocumentUploadModal({ open, onClose, onComplete }: DocumentUploadModalProps) {
  const [stage, setStage] = useState<UploadStage>('select');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Only PDF, JPEG, PNG, and WebP are allowed.');
      return;
    }

    // Validate file size (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    setFile(selectedFile);
    setError('');
  }

  async function handleUpload() {
    if (!file) return;

    setStage('uploading');
    setProgress(0);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress for upload phase
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 30) {
            clearInterval(progressInterval);
            return 30;
          }
          return prev + 10;
        });
      }, 200);

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(40);
      setStage('processing');

      // Simulate AI processing progress
      const aiProgressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(aiProgressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const data = await res.json();

      clearInterval(aiProgressInterval);
      setProgress(100);

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResult(data.document);
      setStage('complete');

      // Auto-close after 2 seconds
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setStage('error');
    }
  }

  function handleClose() {
    if (stage === 'uploading' || stage === 'processing') {
      if (!confirm('Upload in progress. Are you sure you want to cancel?')) {
        return;
      }
    }
    resetState();
    onClose();
  }

  function resetState() {
    setStage('select');
    setFile(null);
    setProgress(0);
    setError('');
    setResult(null);
  }

  function handleTryAgain() {
    resetState();
    fileInputRef.current?.click();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Upload Document</h2>
          {stage === 'select' && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
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
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-cyan-500 transition-colors"
            >
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {file ? file.name : 'Click to select a file'}
              </p>
              <p className="text-sm text-gray-500">
                PDF, JPEG, PNG, or WebP • Max 10MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {file && (
              <div className="flex gap-3">
                <button
                  onClick={() => setFile(null)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
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

        {/* Uploading/Processing */}
        {(stage === 'uploading' || stage === 'processing') && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  {stage === 'uploading' ? '📤 Uploading file...' : '🤖 AI analyzing document...'}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-cyan-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Processing Steps */}
            <div className="space-y-3">
              <ProcessingStep
                icon="📤"
                label="Uploading to secure storage"
                active={stage === 'uploading'}
                complete={progress > 30}
              />
              <ProcessingStep
                icon="📄"
                label="Extracting text with Gemini OCR"
                active={stage === 'processing' && progress < 60}
                complete={progress >= 60}
              />
              <ProcessingStep
                icon="🤖"
                label="Analyzing document type"
                active={stage === 'processing' && progress >= 60 && progress < 80}
                complete={progress >= 80}
              />
              <ProcessingStep
                icon="🔍"
                label="Extracting metadata fields"
                active={stage === 'processing' && progress >= 80}
                complete={progress >= 100}
              />
            </div>

            <div className="text-xs text-gray-500 text-center">
              This may take 10-30 seconds depending on document size
            </div>
          </div>
        )}

        {/* Complete */}
        {stage === 'complete' && result && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Complete!</h3>
              <p className="text-gray-600">Document analyzed successfully</p>
            </div>

            {/* Results Summary */}
            <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Document Type:</span>
                <span className="font-medium capitalize">{result.documentType.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">AI Confidence:</span>
                <span className="font-medium">{result.aiConfidence}%</span>
              </div>
              {result.expiryDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expiry Date:</span>
                  <span className="font-medium">{new Date(result.expiryDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500">
              Closing automatically...
            </p>
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
              <p className="text-red-600">{error}</p>
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
      </div>
    </div>
  );
}

function ProcessingStep({
  icon,
  label,
  active,
  complete,
}: {
  icon: string;
  label: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${
      active ? 'bg-cyan-50 border border-cyan-200' : complete ? 'bg-green-50' : 'bg-gray-50'
    }`}>
      <span className="text-2xl">{complete ? '✅' : active ? icon : '⏸️'}</span>
      <span className={`flex-1 ${active ? 'font-medium text-cyan-900' : complete ? 'text-green-700' : 'text-gray-600'}`}>
        {label}
      </span>
      {active && (
        <div className="animate-spin h-5 w-5 border-2 border-cyan-500 border-t-transparent rounded-full" />
      )}
    </div>
  );
}

