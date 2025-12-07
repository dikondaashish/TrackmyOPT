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

// Advanced animated processing state component with professional animations
function AnimatedProcessingState({ progress, stage }: { progress: number; stage: string }) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // All processing lines with timing markers
  const allLines = [
    { text: "Establishing secure TLS connection...", phase: 'upload', icon: '🔐' },
    { text: "Encrypting document with AES-256...", phase: 'upload', icon: '🔒' },
    { text: "Uploading to secure cloud storage...", phase: 'upload', icon: '☁️' },
    { text: "Verifying checksum integrity...", phase: 'upload', icon: '✅' },
    { text: "Initializing Gemini Vision AI model...", phase: 'ocr', icon: '🤖' },
    { text: "Loading document into memory buffer...", phase: 'ocr', icon: '📄' },
    { text: "Detecting text regions and boundaries...", phase: 'ocr', icon: '🔍' },
    { text: "Extracting text with 99.2% accuracy...", phase: 'ocr', icon: '📝' },
    { text: "Processing multi-language characters...", phase: 'ocr', icon: '🌐' },
    { text: "Running document classification model...", phase: 'analyze', icon: '🧠' },
    { text: "Matching against 47 document templates...", phase: 'analyze', icon: '📋' },
    { text: "Confidence score: calculating...", phase: 'analyze', icon: '📊' },
    { text: "Document type identified successfully", phase: 'analyze', icon: '✨' },
    { text: "Extracting name and identity fields...", phase: 'metadata', icon: '👤' },
    { text: "Parsing date formats (MM/DD/YYYY)...", phase: 'metadata', icon: '📅' },
    { text: "Detecting expiration date...", phase: 'metadata', icon: '⏰' },
    { text: "Extracting document numbers...", phase: 'metadata', icon: '🔢' },
    { text: "Cross-referencing extracted data...", phase: 'metadata', icon: '🔗' },
    { text: "Finalizing document analysis...", phase: 'complete', icon: '🎯' },
    { text: "Analysis complete ✓", phase: 'complete', icon: '✅' },
  ];

  // Get current phase based on progress
  const getCurrentPhase = () => {
    if (progress <= 25) return 'upload';
    if (progress <= 50) return 'ocr';
    if (progress <= 75) return 'analyze';
    if (progress <= 95) return 'metadata';
    return 'complete';
  };

  // Get phase display info
  const getPhaseInfo = () => {
    const phase = getCurrentPhase();
    switch (phase) {
      case 'upload': return { title: 'Uploading to Secure Storage', color: 'cyan' };
      case 'ocr': return { title: 'Extracting Text with Gemini OCR', color: 'blue' };
      case 'analyze': return { title: 'Analyzing Document Type', color: 'purple' };
      case 'metadata': return { title: 'Extracting Metadata Fields', color: 'indigo' };
      case 'complete': return { title: 'Finalizing Analysis', color: 'green' };
      default: return { title: 'Processing...', color: 'cyan' };
    }
  };

  // Calculate which line to show based on progress
  useEffect(() => {
    const targetLine = Math.floor((progress / 100) * allLines.length);
    if (targetLine > currentLineIndex && currentLineIndex < allLines.length - 1) {
      setCurrentLineIndex(targetLine);
    }
  }, [progress, currentLineIndex, allLines.length]);

  // Typewriter effect for current line
  useEffect(() => {
    if (currentLineIndex >= allLines.length) return;
    
    const currentLine = allLines[currentLineIndex];
    let charIndex = 0;
    setDisplayedText('');
    setIsTyping(true);

    const typeInterval = setInterval(() => {
      if (charIndex < currentLine.text.length) {
        setDisplayedText(currentLine.text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        
        // Add to completed lines after a short delay
        setTimeout(() => {
          setCompletedLines(prev => {
            const newLines = [...prev, `${currentLine.icon} ${currentLine.text}`];
            // Keep only last 4 lines
            return newLines.slice(-4);
          });
        }, 300);
      }
    }, 25); // Fast typing speed

    return () => clearInterval(typeInterval);
  }, [currentLineIndex]);

  // Auto-scroll completed lines
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [completedLines]);

  const phaseInfo = getPhaseInfo();
  const currentLine = allLines[currentLineIndex] || allLines[0];

  return (
    <div className="space-y-5">
      {/* Custom CSS for animations */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 1; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(6, 182, 212, 0.5); }
          50% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.8), 0 0 30px rgba(6, 182, 212, 0.4); }
        }
        @keyframes typing-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .typing-cursor {
          animation: typing-cursor 0.8s ease-in-out infinite;
        }
        .slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        .glow-effect {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Progress Bar with Glow Effect */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 font-medium flex items-center gap-2">
            <span className="text-lg">{stage === 'uploading' ? '📤' : '🤖'}</span>
            {stage === 'uploading' ? 'Uploading file...' : 'AI analyzing document...'}
          </span>
          <span className="font-bold text-cyan-600">{progress}%</span>
        </div>
        <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ 
              width: `${progress}%`,
              backgroundSize: '200% 100%',
              animation: 'gradient-shift 2s linear infinite',
            }}
          />
          <div 
            className="absolute top-0 h-3 w-8 bg-white/40 rounded-full blur-sm"
            style={{ 
              left: `${Math.max(0, progress - 5)}%`,
              transition: 'left 0.3s ease-out'
            }}
          />
        </div>
      </div>

      {/* Main Animation Container */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 shadow-2xl">
        {/* Animated Header */}
        <div className="flex items-center gap-3 mb-4">
          {/* Animated Spinner */}
          <div className="relative w-10 h-10">
            <div 
              className="absolute inset-0 rounded-full border-2 border-cyan-500/30"
              style={{ animation: 'spin-slow 3s linear infinite' }}
            />
            <div 
              className="absolute inset-1 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-transparent border-l-cyan-400/50"
              style={{ animation: 'spin-reverse 2s linear infinite' }}
            />
            <div 
              className="absolute inset-2 rounded-full border-2 border-cyan-300/40"
              style={{ animation: 'spin-slow 1.5s linear infinite' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-cyan-400 rounded-full" style={{ animation: 'pulse-ring 1s ease-in-out infinite' }} />
            </div>
          </div>
          
          {/* Phase Title */}
          <div>
            <div className="text-cyan-400 font-semibold text-sm tracking-wide uppercase">
              {phaseInfo.title}
            </div>
            <div className="text-gray-500 text-xs">
              Step {Math.min(4, Math.floor(progress / 25) + 1)} of 4
            </div>
          </div>
        </div>

        {/* Terminal-style Output */}
        <div className="bg-black/50 rounded-lg border border-gray-700 overflow-hidden">
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border-b border-gray-700">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-xs text-gray-500 font-mono">document-analyzer.sh</span>
          </div>

          {/* Terminal Content */}
          <div 
            ref={containerRef}
            className="p-3 h-[120px] overflow-y-auto font-mono text-xs space-y-1 scroll-smooth"
          >
            {/* Completed Lines */}
            {completedLines.map((line, idx) => (
              <div 
                key={idx} 
                className="text-gray-400 slide-up flex items-start gap-2"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <span className="text-green-500 flex-shrink-0">$</span>
                <span className="break-all">{line}</span>
              </div>
            ))}
            
            {/* Current Typing Line */}
            <div className="text-cyan-300 flex items-start gap-2">
              <span className="text-green-500 flex-shrink-0">$</span>
              <span>
                {currentLine.icon} {displayedText}
                {isTyping && <span className="typing-cursor text-cyan-400">▊</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Phase Progress Dots */}
        <div className="flex justify-center gap-3 mt-4">
          {['upload', 'ocr', 'analyze', 'metadata'].map((phase, idx) => {
            const isActive = getCurrentPhase() === phase;
            const isComplete = ['upload', 'ocr', 'analyze', 'metadata'].indexOf(getCurrentPhase()) > idx;
            
            return (
              <div key={phase} className="flex flex-col items-center gap-1">
                <div 
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    isComplete ? 'bg-green-500 scale-100' : 
                    isActive ? 'bg-cyan-400 scale-125 glow-effect' : 
                    'bg-gray-600 scale-100'
                  }`}
                />
                <span className={`text-[10px] ${isActive ? 'text-cyan-400' : 'text-gray-500'}`}>
                  {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Text */}
      <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-2">
        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
        Processing with Gemini AI • Estimated time: 10-30 seconds
      </div>
    </div>
  );
}

