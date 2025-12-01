"use client";
import { useState, useEffect, useCallback } from "react";
import { Download, ExternalLink, Check, Loader2 } from "lucide-react";

// Chrome API type declarations for extension communication
declare global {
  interface Window {
    chrome?: typeof chrome;
  }
}

declare const chrome: {
  runtime?: {
    sendMessage: (
      extensionId: string,
      message: { type: string; tool?: string },
      callback: (response: ExtensionResponse) => void
    ) => void;
    lastError?: { message: string };
  };
};

interface ExtensionResponse {
  ok: boolean;
  installed?: boolean;
  version?: string;
  opened?: boolean;
  message?: string;
  error?: string;
}

// Chrome Extension Configuration
const EXTENSION_ID = process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID || "";
const CHROME_STORE_URL = process.env.NEXT_PUBLIC_CHROME_STORE_URL || 
  "https://chrome.google.com/webstore/detail/trackmyopt";


// Tool to extension page mapping
const TOOL_PAGE_MAP: Record<string, string> = {
  "opt-apply": "opt-apply",
  "stem-apply": "stem-apply", 
  "clock": "clock",
  "stem-clock": "stem-clock",
};

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  available: boolean;
  toolId?: string;
  extensionInstalled: boolean;
  onOpenTool: (toolId: string) => void;
  isLoading?: boolean;
}

function ToolCard({ 
  icon, 
  title, 
  description, 
  available, 
  toolId,
  extensionInstalled,
  onOpenTool,
  isLoading
}: ToolCardProps) {
  const handleClick = () => {
    if (available && toolId) {
      onOpenTool(toolId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && available && toolId) {
      e.preventDefault();
      onOpenTool(toolId);
    }
  };

  return (
    <div
      className={`group bg-card border border-border rounded-xl p-6 transition-all duration-200 ${
        available 
          ? "hover:border-primary hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] cursor-pointer" 
          : "opacity-50 cursor-not-allowed"
      }`}
      role="button"
      tabIndex={available ? 0 : -1}
      aria-disabled={!available}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="mb-4 transition-transform duration-200 group-hover:scale-110">{icon}</div>
      <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      {available && (
        <div className="mt-4 flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isLoading ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Opening...
            </>
          ) : extensionInstalled ? (
            <>
              Open in Extension
              <svg className="w-3 h-3 ml-1 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          ) : (
            <>
              <Download className="w-3 h-3 mr-1" />
              Get Extension
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: "success" | "info" | "error"; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-blue-600";

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5`}>
      {type === "success" && <Check className="w-5 h-5" />}
      {type === "info" && <ExternalLink className="w-5 h-5" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">×</button>
    </div>
  );
}

export function ToolsGrid() {
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [isCheckingExtension, setIsCheckingExtension] = useState(true);
  const [loadingTool, setLoadingTool] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  // Check if Chrome extension is installed
  const checkExtensionInstalled = useCallback(async (): Promise<boolean> => {
    // Only works in Chrome with extension APIs
    if (typeof chrome === "undefined" || !chrome.runtime || !EXTENSION_ID) {
      return false;
    }

    return new Promise((resolve) => {
      let resolved = false;
      try {
        chrome.runtime!.sendMessage(
          EXTENSION_ID,
          { type: "PING" },
          (response) => {
            if (resolved) return;
            resolved = true;
            
            if (chrome.runtime?.lastError) {
              resolve(false);
            } else if (response && response.installed) {
              resolve(true);
            } else {
              resolve(false);
            }
          }
        );
        
        // Timeout fallback
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve(false);
          }
        }, 2000);
      } catch {
        resolve(false);
      }
    });
  }, []);

  // Check extension on mount
  useEffect(() => {
    const check = async () => {
      setIsCheckingExtension(true);
      const installed = await checkExtensionInstalled();
      setExtensionInstalled(installed);
      setIsCheckingExtension(false);
    };
    check();
  }, [checkExtensionInstalled]);

  // Handle tool click
  const handleOpenTool = useCallback(async (toolId: string) => {
    const extensionPage = TOOL_PAGE_MAP[toolId];
    if (!extensionPage) return;

    setLoadingTool(toolId);

    // Re-check if extension is installed
    const installed = await checkExtensionInstalled();
    setExtensionInstalled(installed);

    if (installed && EXTENSION_ID && chrome.runtime) {
      // Extension is installed - send message to open the tool
      try {
        chrome.runtime.sendMessage(
          EXTENSION_ID,
          { type: "OPEN_TOOL", tool: extensionPage },
          (response) => {
            setLoadingTool(null);
            
            if (chrome.runtime?.lastError) {
              setToast({ message: "Error communicating with extension", type: "error" });
              return;
            }

            if (response && response.ok) {
              if (response.opened) {
                setToast({ message: "Tool opened in extension!", type: "success" });
              } else {
                // Popup couldn't be opened directly - show instruction
                setToast({ 
                  message: "Click the TrackMyOPT extension icon in your browser toolbar to open the tool", 
                  type: "info" 
                });
              }
            }
          }
        );
      } catch (err) {
        setLoadingTool(null);
        setToast({ message: "Error opening extension", type: "error" });
      }
    } else {
      // Extension not installed - redirect to Chrome Web Store
      setLoadingTool(null);
      window.open(CHROME_STORE_URL, "_blank");
      setToast({ 
        message: "Install the TrackMyOPT extension to use this tool", 
        type: "info" 
      });
    }
  }, [checkExtensionInstalled]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Your Toolkit</h2>
        {!isCheckingExtension && (
          <div className="flex items-center gap-2 text-xs">
            {extensionInstalled ? (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                <Check className="w-3 h-3" />
                Extension Installed
              </span>
            ) : (
              <a
                href={CHROME_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Download className="w-3 h-3" />
                Get Extension
              </a>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ToolCard 
          icon={<span className="text-3xl">📝</span>} 
          title="OPT Apply Start Dates" 
          description="Calculate when you can start applying for OPT" 
          available 
          toolId="opt-apply"
          extensionInstalled={extensionInstalled}
          onOpenTool={handleOpenTool}
          isLoading={loadingTool === "opt-apply"}
        />
        <ToolCard 
          icon={<span className="text-3xl">🎒</span>} 
          title="STEM OPT Apply Start Dates" 
          description="Calculate STEM OPT extension application dates" 
          available 
          toolId="stem-apply"
          extensionInstalled={extensionInstalled}
          onOpenTool={handleOpenTool}
          isLoading={loadingTool === "stem-apply"}
        />
        <ToolCard 
          icon={<span className="text-3xl">⏱️</span>} 
          title="OPT Clock Tracker" 
          description="Track your unemployment days in real-time" 
          available 
          toolId="clock"
          extensionInstalled={extensionInstalled}
          onOpenTool={handleOpenTool}
          isLoading={loadingTool === "clock"}
        />
        <ToolCard 
          icon={<span className="text-3xl">⏲️</span>} 
          title="STEM Clock Tracker" 
          description="Track your STEM OPT unemployment days" 
          available 
          toolId="stem-clock"
          extensionInstalled={extensionInstalled}
          onOpenTool={handleOpenTool}
          isLoading={loadingTool === "stem-clock"}
        />
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}

