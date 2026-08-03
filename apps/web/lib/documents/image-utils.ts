
// Shared state for logo fetching reliability
let isClearbitBlocked = false;
let clearbitFailures = 0;
const MAX_FAILURES = 1; // Lowered to 1 for faster reaction
const STORAGE_KEY = 'trackmyopt_clearbit_blocked';

// Initialize from storage if available (client-side)
if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'true') {
        isClearbitBlocked = true;
    }
}

/**
 * Generates the initial logo URL.
 * Checks the global circuit breaker state to decide between Clearbit and Google.
 */
export const getLogoUrl = (hostname: string): string => {
    if (isClearbitBlocked) {
        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    }
    return `https://logo.clearbit.com/${hostname}`;
};

/**
 * Handles logo loading errors.
 * Updates the circuit breaker state and returns the fallback URL if applicable.
 * Returns null if no fallback is available (i.e., both failed).
 */
export const handleLogoError = (currentSrc: string, hostname: string): string | null => {
    // If we were using Clearbit and it failed
    if (currentSrc.includes('clearbit')) {
        clearbitFailures++;

        // If we hit the threshold, block Clearbit for future requests globally
        if (!isClearbitBlocked && clearbitFailures >= MAX_FAILURES) {
            isClearbitBlocked = true;
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, 'true');
            }
        }

        // Return fallback to Google
        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    }

    // If it wasn't Clearbit (likely already Google), then we have no other fallback
    return null;
};
