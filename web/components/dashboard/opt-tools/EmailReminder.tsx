"use client";

import { useState, useEffect } from "react";
import { Mail, Bell, Crown, Check, X, Loader2 } from "lucide-react";

interface EmailReminderProps {
  toolType: 'opt-apply' | 'opt-clock' | 'stem-apply' | 'stem-clock';
  isPremium: boolean;
  onUpgradeClick?: () => void;
}

const TOOL_LABELS: Record<string, string> = {
  'opt-apply': 'OPT Apply Dates',
  'opt-clock': 'OPT Clock Tracker',
  'stem-apply': 'STEM Apply Dates',
  'stem-clock': 'STEM Clock Tracker',
};

const TOOL_COLORS: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
  'opt-apply': {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500 to-indigo-600',
  },
  'opt-clock': {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500 to-orange-600',
  },
  'stem-apply': {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-600 dark:text-green-400',
    gradient: 'from-green-500 to-emerald-600',
  },
  'stem-clock': {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-500 to-violet-600',
  },
};

export function EmailReminder({ toolType, isPremium, onUpgradeClick }: EmailReminderProps) {
  const [email, setEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const colors = TOOL_COLORS[toolType];
  const label = TOOL_LABELS[toolType];

  useEffect(() => {
    loadEmailPreference();
  }, [toolType]);

  const loadEmailPreference = async () => {
    try {
      const response = await fetch(`/api/tool-emails?tool=${toolType}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.email) {
          setSavedEmail(data.email);
          setEmail(data.email);
        }
      }
    } catch (error) {
      console.error('Failed to load email preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!email.trim() || !email.includes('@')) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/tool-emails', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: toolType, email: email.trim() }),
      });

      if (response.ok) {
        setSavedEmail(email.trim());
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to save email:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/tool-emails?tool=${toolType}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setSavedEmail(null);
        setEmail("");
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to remove email:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-4 animate-pulse`}>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  // Non-premium users see upgrade prompt
  if (!isPremium) {
    return (
      <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-5`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center flex-shrink-0`}>
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 dark:text-white">Daily Email Reminders</h3>
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Premium
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Get daily email updates about your {label.toLowerCase()} deadlines and status changes.
            </p>
            <button
              onClick={onUpgradeClick}
              className={`px-4 py-2 rounded-xl bg-gradient-to-r ${colors.gradient} text-white font-medium text-sm hover:opacity-90 transition-opacity`}
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Premium users can set email reminders
  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-5`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center flex-shrink-0`}>
          <Mail className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 dark:text-white">Daily Email Reminders</h3>
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          </div>
          
          {savedEmail && !isEditing ? (
            // Saved state
            <div className="mt-3">
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{savedEmail}</span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={handleRemove}
                  disabled={isSaving}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                You'll receive daily updates about your {label.toLowerCase()}.
              </p>
            </div>
          ) : (
            // Edit/Add state
            <div className="mt-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Enter your email to receive daily updates about your {label.toLowerCase()}.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSave}
                  disabled={isSaving || !email.trim() || !email.includes('@')}
                  className={`px-4 py-2.5 rounded-xl bg-gradient-to-r ${colors.gradient} text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2`}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                  {savedEmail ? 'Update' : 'Enable'}
                </button>
              </div>
              {savedEmail && (
                <button
                  onClick={() => { setIsEditing(false); setEmail(savedEmail); }}
                  className="text-sm text-gray-500 hover:text-gray-700 mt-2"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
