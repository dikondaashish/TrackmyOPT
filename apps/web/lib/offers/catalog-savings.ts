/** Documented first-year savings per partner (USD). */
export const ESTIMATED_SAVINGS_USD: Record<string, number> = {
    "kimber-health": 1200,
    "chatgpt-student": 80,
    "google-gemini-student": 240,
    "figma-education": 180,
    "autodesk-education": 600,
    "rowzero-student": 120,
    "github-student-pack": 1000,
    "perplexity-education": 120,
    "notion-education": 120,
    "adobe-creative-cloud": 540,
    "kickresume-student": 72,
    "microsoft-office-education": 100,
    "spotify-student": 156,
    "google-gemini-youtube-bundle": 168,
    "nordvpn-student": 100,
    "amazon-prime-student": 110,
    "linkedin-student-beans": 335,
    "google-ai-career-certificates": 300,
    "rowzero-scholarship": 1000,
    "princeton-review": 600,
    "kaplan-test-prep": 150,
    "wise-students": 120,
    remitly: 25,
    "uhaul-collegeboxes": 80,
    sprintax: 20,
    "fuel-discount": 210,
    "weekly-freebees": 390,
};

export const OFFERS_CATALOG_TOTAL_SAVINGS_USD = Object.values(ESTIMATED_SAVINGS_USD).reduce(
    (sum, amount) => sum + amount,
    0,
);

export function getOfferSavings(offerId: string) {
    return ESTIMATED_SAVINGS_USD[offerId] ?? 0;
}

export function formatUsd(amount: number) {
    return amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
