/**
 * browser-download.ts
 *
 * Safe, cross-browser download helpers.
 *
 * Key guarantees:
 *  1. Download anchors are removed with element.remove() inside try/catch so a
 *     stale parentNode never throws during deferred cleanup.
 *  2. URL.revokeObjectURL is deferred with setTimeout so the browser has time
 *     to start reading the blob before we revoke the URL.
 *  3. Every helper is wrapped in try/catch so a DOM error never surfaces as
 *     an unhandled exception.
 *  4. These functions must only be called from event handlers or useEffect —
 *     never during the React render phase.
 */

const REMOVE_DELAY_MS = 100;

/** Download a Blob as a named file. */
export function triggerBrowserDownload(blob: Blob, filename: string): void {
  try {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = "noopener";
    anchor.style.display = "none";

    document.body.appendChild(anchor);
    anchor.click();

    // Defer removal — guarantees the element is still in the DOM when we
    // remove it, and gives the browser time to initiate the download.
    setTimeout(() => {
      try {
        anchor.remove();
      } catch {
        /* element may already be gone */
      }
      URL.revokeObjectURL(url);
    }, REMOVE_DELAY_MS);
  } catch (err) {
    // Download errors must never crash the page.
    console.error("[browser-download] triggerBrowserDownload failed:", err);
  }
}

/** Download a remote URL (e.g. a compiled PDF blob URL) as a named file. */
export function triggerUrlDownload(href: string, filename: string): void {
  try {
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = filename;
    anchor.rel = "noopener";
    anchor.style.display = "none";

    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(() => {
      try {
        anchor.remove();
      } catch {
        /* element may already be gone */
      }
    }, REMOVE_DELAY_MS);
  } catch (err) {
    console.error("[browser-download] triggerUrlDownload failed:", err);
  }
}

/** Download a plain-text or JSON string as a named file. */
export function triggerTextDownload(
  content: string,
  filename: string,
  mimeType = "text/plain"
): void {
  const blob = new Blob([content], { type: mimeType });
  triggerBrowserDownload(blob, filename);
}
