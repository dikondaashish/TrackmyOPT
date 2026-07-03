/** Stable portal mount for modals/calendars — avoids portaling directly to `document.body`. */
export const PORTAL_ROOT_ID = "tmopt-portal-root";

export function getPortalRoot(): HTMLElement {
  if (typeof document === "undefined") {
    throw new Error("getPortalRoot() is client-only");
  }
  return document.getElementById(PORTAL_ROOT_ID) ?? document.body;
}
