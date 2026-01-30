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
        // Small delay to ensure extension content script has time to inject the marker
        const checkExtension = () => {
            const marker = document.getElementById("trackmyopt-extension-installed");
            setIsInstalled(!!marker);
        };

        // Check immediately
        checkExtension();

        // Also check after a short delay in case the extension loads slightly after our component
        const timeoutId = setTimeout(checkExtension, 500);

        return () => clearTimeout(timeoutId);
    }, []);

    return {
        isExtensionInstalled: isInstalled === true,
        isLoading: isInstalled === null,
    };
}
