"use client";

import { useState } from "react";
import type { ExtensionStatus } from "./settings-types";

type RecentLogin = { device: string; location: string; time: string };

export function useSettingsExtension({
  setSuccess,
}: {
  setSuccess: (message: string | null) => void;
}) {
  const [extensionStatus, setExtensionStatus] = useState<ExtensionStatus>({
    isConnected: false,
    lastSyncTime: null,
  });
  const [recentLogins, setRecentLogins] = useState<RecentLogin[]>([]);

  const loadExtensionStatus = async () => {
    try {
      // Method 1: Check localStorage for extension marker (set by extension)
      const extensionConnected = localStorage.getItem('tmo_extension_connected');
      const extensionVersion = localStorage.getItem('tmo_extension_version');
      const lastSync = localStorage.getItem('tmo_extension_last_sync');

      if (extensionConnected === 'true') {
        setExtensionStatus({
          isConnected: true,
          lastSyncTime: lastSync,
          version: extensionVersion || undefined,
        });
        return;
      }

      // Method 2: Check server sessions API
      const res = await fetch('/api/user/sessions', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.extensionStatus?.isConnected) {
          setExtensionStatus({
            isConnected: true,
            lastSyncTime: data.extensionStatus?.lastActiveAt || null,
            version: data.extensionStatus?.version || undefined,
          });
          return;
        }
      }

      // Method 3: Try to detect extension via custom event
      // The extension should listen for this and respond
      window.postMessage({ type: 'TMO_CHECK_EXTENSION' }, '*');

      // Listen for response (extension will reply if installed)
      const handleExtensionResponse = (event: MessageEvent) => {
        if (event.data?.type === 'TMO_EXTENSION_PRESENT') {
          setExtensionStatus({
            isConnected: true,
            lastSyncTime: new Date().toISOString(),
            version: event.data.version || undefined,
          });
          // Also store in localStorage for future checks
          localStorage.setItem('tmo_extension_connected', 'true');
          if (event.data.version) {
            localStorage.setItem('tmo_extension_version', event.data.version);
          }
          localStorage.setItem('tmo_extension_last_sync', new Date().toISOString());
        }
      };

      window.addEventListener('message', handleExtensionResponse);

      // Clean up listener after 2 seconds
      setTimeout(() => {
        window.removeEventListener('message', handleExtensionResponse);
      }, 2000);

    } catch {
      // Silently fail - extension status not critical
    }
  };

  const loadRecentLogins = async () => {
    try {
      const res = await fetch('/api/user/sessions', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.sessions) {
          const formattedLogins = data.sessions.map((session: {
            device_type: string;
            device_info?: string;
            location?: string;
            last_active_at: string;
          }) => {
            // Format time ago
            const lastActive = new Date(session.last_active_at);
            const now = new Date();
            const diffMs = now.getTime() - lastActive.getTime();
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            let timeAgo = 'Just now';
            if (diffDays > 0) {
              timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            } else if (diffHours > 0) {
              timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else if (diffMins > 5) {
              timeAgo = `${diffMins} minutes ago`;
            }

            // Format device name
            const device = session.device_type === 'extension'
              ? 'Chrome Extension'
              : session.device_info || 'Web Browser';

            return {
              device,
              location: session.location || 'Unknown location',
              time: timeAgo,
            };
          });
          setRecentLogins(formattedLogins);
        }
      }
    } catch {
      // If API fails, show empty state
      setRecentLogins([]);
    }
  };

  const handleDisconnectExtension = async () => {
    try {
      // Clear localStorage markers
      localStorage.removeItem('tmo_extension_connected');
      localStorage.removeItem('tmo_extension_version');
      localStorage.removeItem('tmo_extension_last_sync');

      // Also clear server session
      const res = await fetch('/api/user/sessions?device_type=extension', {
        method: 'DELETE',
        credentials: 'include',
      });

      setExtensionStatus({ isConnected: false, lastSyncTime: null });
      setSuccess('Extension disconnected');
      setTimeout(() => setSuccess(null), 3000);

      if (!res.ok) {
        console.error('Failed to clear server session');
      }
    } catch {
      // Still update UI even if server call fails
      setExtensionStatus({ isConnected: false, lastSyncTime: null });
      setSuccess('Extension disconnected');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  return {
    extensionStatus,
    recentLogins,
    loadExtensionStatus,
    loadRecentLogins,
    handleDisconnectExtension,
  };
}
