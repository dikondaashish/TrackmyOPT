/** Whether the browser can open a Supabase Realtime WebSocket (HTTPS + WebSocket API). */
export function isSupabaseRealtimeSupported(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof WebSocket === "undefined") return false;
  // Mobile Safari private mode / strict Firefox ETP can block WebSocket even on HTTPS.
  if (typeof window.isSecureContext === "boolean" && !window.isSecureContext) {
    return false;
  }
  return true;
}
