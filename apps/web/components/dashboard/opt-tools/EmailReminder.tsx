"use client";

import { useState, useEffect } from "react";
import { Mail, Bell, Crown, Check, BellOff, Loader2, CheckCircle2, Pencil, Clock } from "lucide-react";

interface EmailReminderProps {
  toolType: 'opt-apply' | 'opt-clock' | 'stem-apply' | 'stem-clock';
  isPremium: boolean;
  onUpgradeClick?: () => void;
}

// Map to API format (underscores)
const TOOL_API_KEYS: Record<string, string> = {
  'opt-apply': 'opt_apply',
  'opt-clock': 'opt_clock',
  'stem-apply': 'stem_apply',
  'stem-clock': 'stem_clock',
};

const TOOL_LABELS: Record<string, string> = {
  'opt-apply': 'OPT Apply Dates',
  'opt-clock': 'OPT Clock Tracker',
  'stem-apply': 'STEM Apply Dates',
  'stem-clock': 'STEM Clock Tracker',
};

const TOOL_ICONS: Record<string, string> = {
  'opt-apply': '📅',
  'opt-clock': '⏰',
  'stem-apply': '🎓',
  'stem-clock': '⏲️',
};

const TOOL_COLORS: Record<string, string> = {
  'opt-apply': 'from-blue-500 to-indigo-600',
  'opt-clock': 'from-amber-500 to-orange-600',
  'stem-apply': 'from-green-500 to-emerald-600',
  'stem-clock': 'from-purple-500 to-violet-600',
};

export function EmailReminder({ toolType, isPremium, onUpgradeClick }: EmailReminderProps) {
  const [email, setEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const gradient = TOOL_COLORS[toolType];
  const label = TOOL_LABELS[toolType];
  const icon = TOOL_ICONS[toolType];
  const apiKey = TOOL_API_KEYS[toolType];

  useEffect(() => {
    loadEmailPreference();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolType]);

  const loadEmailPreference = async () => {
    try {
      const response = await fetch('/api/user/tool-email', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.emails && data.emails[apiKey]) {
          setSavedEmail(data.emails[apiKey]);
          setEmail(data.emails[apiKey]);
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
      const response = await fetch('/api/user/tool-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: apiKey, email: email.trim() }),
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
      const response = await fetch('/api/user/tool-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: apiKey, email: '' }),
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
      <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-lg animate-pulse`}>
        <div className="h-6 bg-white/20 rounded w-1/2 mb-3"></div>
        <div className="h-12 bg-white/20 rounded"></div>
      </div>
    );
  }

  // Non-premium users see upgrade prompt
  if (!isPremium) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
            <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              Daily Reminders (9:00 AM ET)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get daily Chrome notifications and email reminders for your {label.toLowerCase()}.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-xl bg-gradient-to-br ${gradient} text-white text-center`}>
            <span className="text-2xl">{icon}</span>
            <p className="text-sm font-medium mt-1">{label}</p>
          </div>

          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Daily 9:00 AM ET notifications
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Chrome notifications + email
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Deadline & status alerts
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Never miss important dates
            </li>
          </ul>

          <button
            onClick={onUpgradeClick}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4" />
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  // Premium users - matching OptDatesSection style
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-lg text-white`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4 sm:gap-0">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h4 className="font-bold text-base">{label}</h4>
            <div className="flex items-center gap-1.5 text-sm opacity-90">
              <Clock className="w-3.5 h-3.5" />
              <span>Daily at 9:00 AM ET</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        {savedEmail ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/30 backdrop-blur-sm text-white text-xs font-semibold shadow-sm self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-500/30 backdrop-blur-sm text-white/70 text-xs font-semibold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            Inactive
          </span>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder:text-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !email.trim() || !email.includes('@')}
              className="flex-1 py-2.5 rounded-xl bg-white/25 hover:bg-white/35 text-white text-sm font-medium shadow-sm transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => { setIsEditing(false); setEmail(savedEmail || ''); }}
              className="px-4 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/15 text-sm font-medium transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Email display + Action buttons */
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-white/15 gap-4 sm:gap-0">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 opacity-80" />
            <span className="text-sm font-medium break-all sm:break-normal">
              {savedEmail || 'No email set'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {savedEmail && (
              <button
                onClick={handleRemove}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-red-100 text-sm font-medium shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellOff className="w-4 h-4" />}
                <span>{isSaving ? '...' : 'Stop'}</span>
              </button>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white/90 hover:text-white text-sm font-medium shadow-sm hover:shadow transition-all duration-200"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
