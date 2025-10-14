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

      if (!state || !redirect_uri) {
        const url = new URL(window.location.href);
        const qState = url.searchParams.get("state");
        const qRedirect = url.searchParams.get("redirect_uri");
        if (qState && qRedirect) {
          sessionStorage.setItem("tmo_redirect_uri", qRedirect);
        }
      }

      const finalRedirectUri = redirect_uri || new URL(window.location.href).searchParams.get("redirect_uri") || "";
      const finalState = state || new URL(window.location.href).searchParams.get("state") || "";

      if (access_token && refresh_token) {
        const serverUrl = new URL("/auth/extension/callback/server", window.location.origin);
        serverUrl.searchParams.set("access_token", access_token);
        serverUrl.searchParams.set("refresh_token", refresh_token);
        serverUrl.searchParams.set("state", finalState);
        serverUrl.searchParams.set("redirect_uri", finalRedirectUri);
        window.location.replace(serverUrl.toString());
        return;
      }

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
