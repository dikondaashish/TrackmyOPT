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

// Debug: Log extension configuration on load
if (typeof window !== "undefined") {
  console.log("🔧 Extension Config:", {
    EXTENSION_ID: EXTENSION_ID || "(not set)",
    CHROME_STORE_URL,
    envCheck: process.env.NEXT_PUBLIC_CHROME_EXTENSION_ID ? "ENV loaded" : "ENV missing",
  });
}

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
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [showDebug, setShowDebug] = useState(false);

  // Check if Chrome extension is installed
  const checkExtensionInstalled = useCallback(async (): Promise<boolean> => {
    let debug = `Extension ID: ${EXTENSION_ID || "(not set)"}\n`;
    console.log("🔍 Checking extension installation...");
    console.log("📋 Extension ID being used:", EXTENSION_ID || "(empty)");
    
    // Only works in Chrome
    if (typeof chrome === "undefined") {
      debug += "❌ Not in Chrome browser\n";
      console.log("❌ chrome object is undefined - not in Chrome browser");
      setDebugInfo(debug);
      return false;
    }
    
    if (!chrome.runtime) {
      debug += "❌ chrome.runtime unavailable\n";
      console.log("❌ chrome.runtime is undefined - extension APIs not available");
      setDebugInfo(debug);
      return false;
    }
    
    debug += "✓ chrome.runtime available\n";
    console.log("✓ chrome.runtime is available");

    if (!EXTENSION_ID) {
      debug += "❌ Extension ID not configured\n";
      console.log("⚠️ Extension ID not configured in environment variables");
      console.log("💡 Add NEXT_PUBLIC_CHROME_EXTENSION_ID to your .env.local file");
      setDebugInfo(debug);
      return false;
    }
    
    debug += `📤 Sending PING to ${EXTENSION_ID.substring(0, 8)}...\n`;
    console.log("📤 Sending PING to extension:", EXTENSION_ID);

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
              const errorMsg = chrome.runtime.lastError.message || "Unknown error";
              console.log("❌ Extension not installed:", errorMsg);
              setDebugInfo(debug + `❌ Error: ${errorMsg}\n`);
              resolve(false);
            } else if (response && response.installed) {
              console.log("✅ Extension installed, version:", response.version);
              setDebugInfo(debug + `✅ Connected! v${response.version}\n`);
              resolve(true);
            } else {
              console.log("❌ No response from extension");
              setDebugInfo(debug + "❌ No response from extension\n");
              resolve(false);
            }
          }
        );
        
        // Timeout fallback
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            console.log("⏱️ Extension check timed out");
            setDebugInfo(debug + "⏱️ Timed out waiting for response\n");
            resolve(false);
          }
        }, 2000);
      } catch (err) {
        console.log("❌ Error checking extension:", err);
        setDebugInfo(debug + `❌ Exception: ${err}\n`);
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
              console.error("Error:", chrome.runtime.lastError);
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
        console.error("Error sending message:", err);
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

  // Retry check function
  const retryCheck = async () => {
    setIsCheckingExtension(true);
    const installed = await checkExtensionInstalled();
    setExtensionInstalled(installed);
    setIsCheckingExtension(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Your Toolkit</h2>
        <div className="flex items-center gap-2 text-xs">
          {isCheckingExtension ? (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Checking...
            </span>
          ) : extensionInstalled ? (
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
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-muted-foreground hover:text-foreground px-1"
            title="Debug info"
          >
            🔧
          </button>
        </div>
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <div className="bg-slate-100 dark:bg-slate-800 border border-border rounded-lg p-4 text-xs font-mono">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Extension Debug Info</span>
            <button
              onClick={retryCheck}
              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              Retry Check
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-muted-foreground">
            {debugInfo || "Click 'Retry Check' to test connection"}
          </pre>
          <div className="mt-2 pt-2 border-t border-border text-muted-foreground">
            <p><strong>Steps to fix:</strong></p>
            <ol className="list-decimal list-inside space-y-1 mt-1">
              <li>Get your extension ID from <code>chrome://extensions</code></li>
              <li>Add to <code>.env.local</code>: <code>NEXT_PUBLIC_CHROME_EXTENSION_ID=your-id</code></li>
              <li>Restart your Next.js dev server</li>
              <li>Reload the extension in <code>chrome://extensions</code> (click refresh icon)</li>
              <li>Refresh this page and click "Retry Check"</li>
            </ol>
          </div>
        </div>
      )}
      
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

