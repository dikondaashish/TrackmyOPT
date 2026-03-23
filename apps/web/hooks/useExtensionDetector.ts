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
        const extensionId = "hfljbefkccdmlnhclfojlafipjnjbajm";
        
        const checkExtension = async () => {
            // Method 1: Check for the injected DOM marker
            const marker = document.getElementById("trackmyopt-extension-installed");
            
            // Method 2: Check for a global flag injected by the extension
            const hasGlobalFlag = (window as any).__TRACKMYOPT_EXTENSION_INSTALLED__ === true;
            
            // Method 3: Check for attribute on html/body
            const hasAttribute = document.documentElement.hasAttribute('data-trackmyopt-extension') || 
                                document.body.hasAttribute('data-trackmyopt-extension');

            if (marker || hasGlobalFlag || hasAttribute) {
                setIsInstalled(true);
                return;
            }

            // Method 4: Check for a web-accessible resource (common icons or manifest)
            try {
                const response = await fetch(`chrome-extension://${extensionId}/icon128.png`);
                if (response.ok) {
                    setIsInstalled(true);
                    return;
                }
            } catch (e) {
                // Fetch to chrome-extension:// will fail if not installed or not externally connectable
            }

            setIsInstalled(false);
        };

        checkExtension();

        const handleExtensionLoaded = () => {
            checkExtension();
        };
        window.addEventListener("trackmyopt-extension-loaded", handleExtensionLoaded);

        const timeoutId = setTimeout(checkExtension, 2000);

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
