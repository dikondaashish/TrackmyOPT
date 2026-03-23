"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to detect if the TrackMyOPT Chrome extension is installed.
 * 
 * The extension should inject a hidden DOM element with id="trackmyopt-extension-installed"
 * when the user visits trackmyopt.com. This hook checks for that marker.
 * 
 * @returns {Object} { isExtensionInstalled: boolean, isLoading: boolean }
 */
export function useExtensionDetector() {
    const [isInstalled, setIsInstalled] = useState<boolean | null>(null);

    useEffect(() => {
        const checkExtension = () => {
            // Method 1: Check for the injected DOM marker
            const marker = document.getElementById("trackmyopt-extension-installed");
            
            // Method 2: Check for a global flag injected by the extension
            const hasGlobalFlag = (window as any).__TRACKMYOPT_EXTENSION_INSTALLED__ === true;
            
            // Method 3: Check for attribute on html/body (common for extensions)
            const hasAttribute = document.documentElement.hasAttribute('data-trackmyopt-extension') || 
                                document.body.hasAttribute('data-trackmyopt-extension');

            setIsInstalled(!!marker || hasGlobalFlag || hasAttribute);
        };

        // Check immediately
        checkExtension();

        // Listen for a custom event if the extension fires one after loading
        const handleExtensionLoaded = () => {
            checkExtension();
        };
        window.addEventListener("trackmyopt-extension-loaded", handleExtensionLoaded);

        // Also check after a short delay in case of late injection
        const timeoutId = setTimeout(checkExtension, 1000);

        return () => {
            window.removeEventListener("trackmyopt-extension-loaded", handleExtensionLoaded);
            clearTimeout(timeoutId);
        };
    }, []);

    return {
        isExtensionInstalled: isInstalled === true,
        isLoading: isInstalled === null,
    };
}
