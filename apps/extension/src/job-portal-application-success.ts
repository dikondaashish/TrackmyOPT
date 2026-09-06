/**
 * Detect "application submitted" success pages for auto-add-to-tracker.
 */

// Phrases that indicate "application submitted" success (case-insensitive)
const APPLICATION_SUCCESS_PATTERNS = [
  /congratulat/i,
  /application\s+(submitted|received|sent|successful)/i,
  /thank\s+you\s+for\s+applying/i,
  /your\s+application\s+has\s+been\s+(sent|submitted|received)/i,
  /we've\s+received\s+your\s+application/i,
  /we\s+have\s+received\s+your\s+application/i,
  /successfully\s+applied/i,
  /you've\s+applied\s+to/i,
  /you\s+have\s+applied\s+to/i,
  /application\s+complete/i,
  /application\s+successful/i,
  /your\s+application\s+was\s+submitted/i,
  /submitted\s+successfully/i,
];

export function isApplicationSuccessPage(): boolean {
  const text = (document.body?.innerText || document.body?.textContent || '').slice(0, 10000);
  if (!text || text.length < 20) return false;
  for (let i = 0; i < APPLICATION_SUCCESS_PATTERNS.length; i++) {
    if (APPLICATION_SUCCESS_PATTERNS[i].test(text)) return true;
  }
  return false;
}
