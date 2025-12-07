'use client';

/**
 * Document Upload Modal
 * 
 * Upload documents with AI-powered analysis
 * Shows real-time animated progress: Upload → OCR → AI Analysis → Complete
 */

import { useState, useRef, useEffect } from 'react';

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

        {/* Uploading/Processing - Animated Loading State */}
        {(stage === 'uploading' || stage === 'processing') && (
          <AnimatedProcessingState progress={progress} stage={stage} />
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
                <span className="font-medium capitalize">{result.documentType?.replace('_', ' ') || 'Document'}</span>
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

// Task sequences for document processing animation
const PROCESSING_SEQUENCES = [
  {
    status: "Uploading to secure storage",
    lines: [
      "Initializing secure connection...",
      "Encrypting document data...",
      "Uploading to AWS S3...",
      "Verifying upload integrity...",
      "Upload complete ✓",
    ],
  },
  {
    status: "Extracting text with Gemini OCR",
    lines: [
      "Initializing Gemini Vision AI...",
      "Scanning document pages...",
      "Detecting text regions...",
      "Extracting text content...",
      "Processing handwritten text...",
      "Validating extracted data...",
      "OCR extraction complete ✓",
    ],
  },
  {
    status: "Analyzing document type",
    lines: [
      "Analyzing document structure...",
      "Identifying document category...",
      "Matching against known templates...",
      "Detecting Passport format...",
      "Checking Visa indicators...",
      "Validating I-20 patterns...",
      "Document type identified ✓",
    ],
  },
  {
    status: "Extracting metadata fields",
    lines: [
      "Scanning for key fields...",
      "Extracting name information...",
      "Parsing date fields...",
      "Identifying expiry dates...",
      "Extracting document numbers...",
      "Validating field accuracy...",
      "Cross-referencing data...",
      "Metadata extraction complete ✓",
    ],
  },
];

// Animated spinner component
const LoadingSpinner = ({ progress }: { progress: number }) => (
  <div className="relative w-8 h-8">
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label={`Loading progress: ${Math.round(progress)}%`}
    >
      <title>Loading Progress</title>
      <defs>
        <mask id="progress-mask">
          <rect width="240" height="240" fill="black" />
          <circle
            r="120"
            cx="120"
            cy="120"
            fill="white"
            strokeDasharray={`${(progress / 100) * 754}, 754`}
            transform="rotate(-90 120 120)"
          />
        </mask>
      </defs>
      <style>
        {`
          @keyframes rotate-cw {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes rotate-ccw {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
          .g-spin circle {
            transform-origin: 120px 120px;
          }
          .g-spin circle:nth-child(1) { animation: rotate-cw 6s linear infinite; }
          .g-spin circle:nth-child(2) { animation: rotate-ccw 6s linear infinite; }
          .g-spin circle:nth-child(3) { animation: rotate-cw 6s linear infinite; }
          .g-spin circle:nth-child(4) { animation: rotate-ccw 6s linear infinite; }
          .g-spin circle:nth-child(2n) { animation-delay: 0.2s; }
          .g-spin circle:nth-child(3n) { animation-delay: 0.3s; }
        `}
      </style>
      <g
        className="g-spin"
        strokeWidth="16"
        strokeDasharray="18% 40%"
        mask="url(#progress-mask)"
      >
        <circle r="150" cx="120" cy="120" stroke="#06B6D4" opacity="0.95" />
        <circle r="130" cx="120" cy="120" stroke="#22D3EE" opacity="0.95" />
        <circle r="110" cx="120" cy="120" stroke="#67E8F9" opacity="0.95" />
        <circle r="90" cx="120" cy="120" stroke="#A5F3FC" opacity="0.95" />
      </g>
    </svg>
  </div>
);

// Animated processing state component
function AnimatedProcessingState({ progress, stage }: { progress: number; stage: string }) {
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [visibleLines, setVisibleLines] = useState<Array<{ text: string; number: number }>>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const lineHeight = 28;

  const currentSequence = PROCESSING_SEQUENCES[sequenceIndex];
  const totalLines = currentSequence?.lines.length || 0;

  // Update sequence based on progress
  useEffect(() => {
    if (progress <= 30) {
      setSequenceIndex(0); // Uploading
    } else if (progress <= 50) {
      setSequenceIndex(1); // OCR
    } else if (progress <= 75) {
      setSequenceIndex(2); // Analyzing type
    } else {
      setSequenceIndex(3); // Extracting metadata
    }
  }, [progress]);

  // Initialize visible lines when sequence changes
  useEffect(() => {
    if (!currentSequence) return;
    const initialLines = [];
    for (let i = 0; i < Math.min(3, totalLines); i++) {
      initialLines.push({
        text: currentSequence.lines[i],
        number: i + 1,
      });
    }
    setVisibleLines(initialLines);
    setScrollPosition(0);
  }, [sequenceIndex, currentSequence, totalLines]);

  // Handle line advancement
  useEffect(() => {
    if (!currentSequence) return;
    
    const advanceTimer = setInterval(() => {
      const firstVisibleLineIndex = Math.floor(scrollPosition / lineHeight);
      const nextLineIndex = firstVisibleLineIndex + 3;

      if (nextLineIndex < totalLines) {
        setVisibleLines((prevLines) => {
          if (nextLineIndex < totalLines && !prevLines.find(l => l.number === nextLineIndex + 1)) {
            return [
              ...prevLines,
              {
                text: currentSequence.lines[nextLineIndex],
                number: nextLineIndex + 1,
              },
            ];
          }
          return prevLines;
        });
        setScrollPosition((prev) => prev + lineHeight);
      }
    }, 1500);

    return () => clearInterval(advanceTimer);
  }, [scrollPosition, totalLines, currentSequence, lineHeight]);

  // Apply scroll position
  useEffect(() => {
    if (codeContainerRef.current) {
      codeContainerRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  if (!currentSequence) return null;

  return (
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
            className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Animated Status Display */}
      <div className="flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          {/* Current Task Status */}
          <div className="flex items-center space-x-3 text-gray-700 font-medium">
            <LoadingSpinner progress={progress} />
            <span className="text-base">{currentSequence.status}...</span>
          </div>

          {/* Scrolling Lines */}
          <div className="relative">
            <div
              ref={codeContainerRef}
              className="font-mono text-xs overflow-hidden w-full h-[84px] relative rounded-lg bg-gray-50 border border-gray-200"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div>
                {visibleLines.map((line) => (
                  <div
                    key={`${line.number}-${line.text}`}
                    className="flex h-[28px] items-center px-3"
                  >
                    <div className="text-gray-400 pr-3 select-none w-6 text-right">
                      {line.number}
                    </div>
                    <div className={`flex-1 ml-1 ${line.text.includes('✓') ? 'text-green-600 font-medium' : 'text-gray-700'}`}>
                      {line.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gradient Overlay */}
            <div
              className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none rounded-lg"
              style={{
                background: 'linear-gradient(to bottom, rgba(249,250,251,0.9) 0%, rgba(249,250,251,0.5) 30%, transparent 100%)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-center gap-2">
        {PROCESSING_SEQUENCES.map((seq, idx) => (
          <div
            key={seq.status}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx < sequenceIndex ? 'bg-green-500' : 
              idx === sequenceIndex ? 'bg-cyan-500 scale-125' : 
              'bg-gray-300'
            }`}
          />
        ))}
      </div>

      <div className="text-xs text-gray-500 text-center">
        This may take 10-30 seconds depending on document size
      </div>
    </div>
  );
}

