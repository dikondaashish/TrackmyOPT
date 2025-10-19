"use client";
import { useEffect } from "react";

export default function ExtensionClientCallback() {
  useEffect(() => {
    try {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      const state = params.get("state");
      const redirect_uri = sessionStorage.getItem("tmo_redirect_uri");

      // Check if this is a web flow (has redirect param) or extension flow (has redirect_uri)
      const url = new URL(window.location.href);
      const redirect = url.searchParams.get("redirect");
      const qState = url.searchParams.get("state");
      const qRedirect = url.searchParams.get("redirect_uri");

      if (!state || !redirect_uri) {
        if (qState && qRedirect) {
          sessionStorage.setItem("tmo_redirect_uri", qRedirect);
        }
      }

      const finalRedirectUri = redirect_uri || qRedirect || "";
      const finalState = state || qState || "";

      // If this is a web flow (has redirect param), handle it differently
      if (redirect && access_token && refresh_token) {
        console.log('🌐 Web flow: Setting session and redirecting to', redirect);
        
        // For web flow, we need to establish a server-side session
        // Redirect to a web-specific callback that handles this
        const webCallbackUrl = new URL("/auth/callback", window.location.origin);
        webCallbackUrl.searchParams.set("access_token", access_token);
        webCallbackUrl.searchParams.set("refresh_token", refresh_token);
        webCallbackUrl.searchParams.set("next", redirect);
        window.location.replace(webCallbackUrl.toString());
        return;
      }

      // Extension flow: redirect to server callback
      if (access_token && refresh_token) {
        const serverUrl = new URL("/auth/extension/callback/server", window.location.origin);
        serverUrl.searchParams.set("access_token", access_token);
        serverUrl.searchParams.set("refresh_token", refresh_token);
        serverUrl.searchParams.set("state", finalState);
        serverUrl.searchParams.set("redirect_uri", finalRedirectUri);
        window.location.replace(serverUrl.toString());
        return;
      }

      // Fallback for extension flow
      const fallbackUrl = new URL("/auth/extension/callback/server", window.location.origin);
      fallbackUrl.searchParams.set("state", finalState);
      fallbackUrl.searchParams.set("redirect_uri", finalRedirectUri);
      window.location.replace(fallbackUrl.toString());
    } catch (e) {
      console.error("OAuth client callback error", e);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-500">Completing sign-in…</p>
    </div>
  );
}
