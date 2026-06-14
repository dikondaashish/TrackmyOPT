'use client';

/**
 * Document Upload Modal
 * 
 * Upload documents with AI-powered analysis
 * Shows real-time animated progress: Upload → OCR → AI Analysis → Complete
 */

import { useState, useRef, useEffect } from 'react';
import { Upload, ScanLine } from 'lucide-react';

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

// All processing lines - synced with actual upload progress
const ALL_PROCESSING_LINES = [
  // 0-15% - Upload initialization
  { text: "Initializing secure connection...", phase: "upload" },
  { text: "Encrypting document data...", phase: "upload" },
  { text: "Connecting to AWS S3...", phase: "upload" },
  // 15-30% - Upload in progress
  { text: "Uploading to secure storage...", phase: "upload" },
  { text: "Verifying upload integrity...", phase: "upload" },
  { text: "Upload complete ✓", phase: "upload" },
  // 30-50% - OCR
  { text: "Initializing Gemini Vision AI...", phase: "ocr" },
  { text: "Scanning document pages...", phase: "ocr" },
  { text: "Detecting text regions...", phase: "ocr" },
  { text: "Extracting text content...", phase: "ocr" },
  { text: "Processing document layout...", phase: "ocr" },
  { text: "OCR extraction complete ✓", phase: "ocr" },
  // 50-75% - Analysis
  { text: "Analyzing document structure...", phase: "analyze" },
  { text: "Identifying document category...", phase: "analyze" },
  { text: "Matching against known templates...", phase: "analyze" },
  { text: "Detecting document type...", phase: "analyze" },
  { text: "Document type identified ✓", phase: "analyze" },
  // 75-95% - Metadata
  { text: "Scanning for key fields...", phase: "metadata" },
  { text: "Extracting name information...", phase: "metadata" },
  { text: "Parsing date fields...", phase: "metadata" },
  { text: "Identifying expiry dates...", phase: "metadata" },
  { text: "Extracting document numbers...", phase: "metadata" },
  { text: "Validating field accuracy...", phase: "metadata" },
  // 95-100% - Finalizing
  { text: "Finalizing document analysis...", phase: "final" },
  { text: "Saving to vault...", phase: "final" },
  { text: "All done ✓", phase: "final" },
];

const PHASE_STATUS: Record<string, string> = {
  upload: "Uploading to secure storage",
  ocr: "Extracting text with Gemini OCR",
  analyze: "Analyzing document type",
  metadata: "Extracting metadata fields",
  final: "Finalizing",
};

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
          .g-spin circle:nth-child(1) { animation: rotate-cw 4s linear infinite; }
          .g-spin circle:nth-child(2) { animation: rotate-ccw 4s linear infinite; }
          .g-spin circle:nth-child(3) { animation: rotate-cw 4s linear infinite; }
          .g-spin circle:nth-child(4) { animation: rotate-ccw 4s linear infinite; }
          .g-spin circle:nth-child(2n) { animation-delay: 0.15s; }
          .g-spin circle:nth-child(3n) { animation-delay: 0.25s; }
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

// Typing animation for a single line
function TypingLine({ text, isComplete, isTyping }: { text: string; isComplete: boolean; isTyping: boolean }) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  
  useEffect(() => {
    if (!isTyping) {
      setDisplayText(text);
      return;
    }
    
    setDisplayText('');
    let index = 0;
    const typingSpeed = Math.max(20, 60 - text.length); // Faster for longer text
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, typingSpeed);
    
    return () => clearInterval(typeInterval);
  }, [text, isTyping]);
  
  // Blinking cursor
  useEffect(() => {
    if (!isTyping) {
      setShowCursor(false);
      return;
    }
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 400);
    return () => clearInterval(cursorInterval);
  }, [isTyping]);
  
  const isDone = text.includes('✓');
  
  return (
    <span className={`${isDone ? 'text-green-600 font-medium' : isComplete ? 'text-gray-500' : 'text-gray-700'}`}>
      {displayText}
      {isTyping && displayText.length < text.length && (
        <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>|</span>
      )}
    </span>
  );
}

// Animated processing state component
function AnimatedProcessingState({ progress, stage }: { progress: number; stage: string }) {
  const [visibleLines, setVisibleLines] = useState<Array<{ text: string; phase: string; index: number }>>([]);
  const [currentTypingIndex, setCurrentTypingIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate which line index we should be at based on progress
  const targetLineIndex = Math.min(
    Math.floor((progress / 100) * ALL_PROCESSING_LINES.length),
    ALL_PROCESSING_LINES.length - 1
  );
  
  // Get current phase for status display
  const currentPhase = ALL_PROCESSING_LINES[targetLineIndex]?.phase || 'upload';
  const currentStatus = PHASE_STATUS[currentPhase] || 'Processing';
  
  // Add lines progressively based on progress
  useEffect(() => {
    // Add all lines up to target
    const newLines = ALL_PROCESSING_LINES.slice(0, targetLineIndex + 1).map((line, idx) => ({
      ...line,
      index: idx,
    }));
    
    if (newLines.length > visibleLines.length) {
      setVisibleLines(newLines);
      setCurrentTypingIndex(newLines.length - 1);
    }
  }, [targetLineIndex, visibleLines.length]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [visibleLines]);
  
  // Phase indicators
  const phases = ['upload', 'ocr', 'analyze', 'metadata', 'final'];
  const currentPhaseIndex = phases.indexOf(currentPhase);

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
          <span className="inline-flex items-center gap-2">
            {stage === 'uploading' ? (
              <>
                <Upload className="w-4 h-4" />
                Uploading file...
              </>
            ) : (
              <>
                <ScanLine className="w-4 h-4" />
                Analyzing document...
              </>
            )}
          </span>
          </span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Animated Status Display */}
      <div className="flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          {/* Current Task Status */}
          <div className="flex items-center space-x-3 text-gray-700 font-medium">
            {progress >= 100 ? (
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <LoadingSpinner progress={progress} />
            )}
            <span className="text-base">
              {progress >= 100 ? 'Processing complete!' : `${currentStatus}...`}
            </span>
          </div>

          {/* Scrolling Lines Container */}
          <div className="relative">
            <div
              ref={containerRef}
              className="font-mono text-xs overflow-hidden w-full h-[112px] rounded-lg bg-gray-50 border border-gray-200"
            >
              <div className="p-2 space-y-1">
                {visibleLines.map((line, idx) => (
                  <div
                    key={`${line.index}-${line.text}`}
                    className="flex items-center px-2 py-1 animate-fadeIn"
                    style={{
                      animation: idx === visibleLines.length - 1 ? 'fadeIn 0.3s ease-out' : 'none',
                    }}
                  >
                    <div className="text-gray-400 pr-3 select-none w-6 text-right text-[10px]">
                      {String(line.index + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 ml-1">
                      <TypingLine 
                        text={line.text} 
                        isComplete={idx < visibleLines.length - 1}
                        isTyping={idx === currentTypingIndex}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Gradient Overlay */}
            <div
              className="absolute top-0 left-0 right-0 h-6 pointer-events-none rounded-t-lg"
              style={{
                background: 'linear-gradient(to bottom, rgba(249,250,251,0.95) 0%, transparent 100%)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Phase Indicators */}
      <div className="flex justify-center gap-3">
        {phases.map((phase, idx) => (
          <div
            key={phase}
            className={`flex items-center gap-1.5 transition-all duration-500 ${
              idx <= currentPhaseIndex ? 'opacity-100' : 'opacity-40'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx < currentPhaseIndex ? 'bg-green-500' : 
                idx === currentPhaseIndex ? 'bg-cyan-500 scale-125 animate-pulse' : 
                'bg-gray-300'
              }`}
            />
            {idx === currentPhaseIndex && (
              <span className="text-[10px] text-cyan-600 font-medium hidden sm:inline">
                {PHASE_STATUS[phase]?.split(' ')[0]}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 text-center">
        {progress >= 95 ? 'Almost done...' : 'This may take 10-30 seconds depending on document size'}
      </div>
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

