/**
 * usePrefersReducedMotion — hydration-safe replacement for framer-motion's
 * `useReducedMotion`.
 *
 * framer-motion's hook reads `matchMedia("(prefers-reduced-motion: reduce)")`
 * synchronously in its `useState` initializer, so for users with Reduce
 * Motion enabled the first client render differs from the server HTML
 * (which always renders the `null`/falsy branch) and throws hydration
 * error #418.
 *
 * `useSyncExternalStore` avoids that: the hydration render uses the server
 * snapshot (`false`, matching the SSR HTML), then React immediately
 * re-renders with the real media-query value after mount. It also live-updates
 * if the user toggles the OS setting.
 */

"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  if (typeof mql.addEventListener === "function") {
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  }

  // Older Safari versions only expose the legacy MediaQueryList API.
  mql.addListener(callback);
  return () => mql.removeListener(callback);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
