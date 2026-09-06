"use client";

import { useState } from "react";

type ToolEmails = {
  opt_apply: string;
  opt_clock: string;
  stem_apply: string;
  stem_clock: string;
};

export function useSettingsNotificationEmails({
  setSuccess,
  setError,
  setIsSaving,
}: {
  setSuccess: (message: string | null) => void;
  setError: (message: string | null) => void;
  setIsSaving: (saving: boolean) => void;
}) {
  const [toolEmails, setToolEmails] = useState<ToolEmails>({
    opt_apply: '',
    opt_clock: '',
    stem_apply: '',
    stem_clock: '',
  });

  // Case Status & Document Vault share the same notification email (from profiles.notification_email)
  const [sharedNotificationEmail, setSharedNotificationEmail] = useState('');
  const [editingSharedEmail, setEditingSharedEmail] = useState<'case' | 'document' | null>(null);
  const [tempEmail, setTempEmail] = useState('');

  // Load tool email reminders (synced with OPT Dates page)
  const loadToolEmails = async () => {
    try {
      const res = await fetch('/api/user/tool-email', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.emails) {
          setToolEmails({
            opt_apply: data.emails.opt_apply || '',
            opt_clock: data.emails.opt_clock || '',
            stem_apply: data.emails.stem_apply || '',
            stem_clock: data.emails.stem_clock || '',
          });
        }
      }
    } catch {
      // Silently fail
    }
  };

  // Save tool email (syncs with OPT Dates page)
  const handleSaveToolEmail = async (toolKey: string) => {
    const email = toolEmails[toolKey as keyof typeof toolEmails];
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const res = await fetch('/api/user/tool-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolKey, email }),
      });

      if (res.ok) {
        setSuccess(`Email saved for ${toolKey.replace('_', ' ').toUpperCase()}`);
        setTimeout(() => setSuccess(null), 2000);
      } else {
        throw new Error('Failed to save');
      }
    } catch {
      setError('Failed to save email');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete tool email
  const handleDeleteToolEmail = async (toolKey: string) => {
    try {
      setIsSaving(true);
      const res = await fetch('/api/user/tool-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolKey, email: '' }),
      });

      if (res.ok) {
        setToolEmails(prev => ({ ...prev, [toolKey]: '' }));
        setSuccess('Email removed');
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch {
      setError('Failed to remove email');
    } finally {
      setIsSaving(false);
    }
  };

  // Load shared notification email (used by Case Status & Document Vault)
  // This syncs with CaseStatusSection and DocumentVaultClient
  const loadSharedNotificationEmail = async () => {
    try {
      const res = await fetch('/api/user/notification-email', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSharedNotificationEmail(data.email || '');
      }
    } catch {
      // Silently fail
    }
  };

  // Save shared notification email (syncs with Case Status & Document Vault pages)
  const handleSaveSharedEmail = async () => {
    if (!tempEmail || !tempEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch('/api/user/notification-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: tempEmail }),
      });

      if (res.ok) {
        setSharedNotificationEmail(tempEmail);
        setEditingSharedEmail(null);
        setTempEmail('');
        setSuccess('Notification email saved');
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch {
      setError('Failed to save email');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete shared notification email
  const handleDeleteSharedEmail = async () => {
    try {
      setIsSaving(true);
      // Save empty email to clear it
      const res = await fetch('/api/user/notification-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '' }),
      });

      if (res.ok) {
        setSharedNotificationEmail('');
        setSuccess('Notification email removed');
        setTimeout(() => setSuccess(null), 2000);
      }
    } catch {
      setError('Failed to remove email');
    } finally {
      setIsSaving(false);
    }
  };

  // Start editing shared email
  const startEditingSharedEmail = (source: 'case' | 'document') => {
    setEditingSharedEmail(source);
    setTempEmail(sharedNotificationEmail);
  };

  return {
    toolEmails,
    setToolEmails,
    sharedNotificationEmail,
    editingSharedEmail,
    setEditingSharedEmail,
    tempEmail,
    setTempEmail,
    loadToolEmails,
    handleSaveToolEmail,
    handleDeleteToolEmail,
    loadSharedNotificationEmail,
    handleSaveSharedEmail,
    handleDeleteSharedEmail,
    startEditingSharedEmail,
  };
}
