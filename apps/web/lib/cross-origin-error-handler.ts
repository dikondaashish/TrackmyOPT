declare global {
  interface Window {
    __trackmyoptCrossOriginErrorHandlerRegistered?: boolean;
  }
}

/** Tag generic cross-origin script errors for easier debugging in the console. */
export function registerCrossOriginErrorHandler(): void {
  if (typeof window === "undefined") return;
  if (window.__trackmyoptCrossOriginErrorHandlerRegistered) return;

  window.__trackmyoptCrossOriginErrorHandlerRegistered = true;

  window.addEventListener("error", (event) => {
    if (event.message === "Script error." && !event.filename) {
      console.warn("Cross-origin script error — check third-party scripts");
    }
  });
}
