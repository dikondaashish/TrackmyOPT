"use client";

import { useState, useEffect } from "react";
import { Mail, Bell, Check, BellOff, Loader2, CheckCircle2, Pencil, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { OPT_TOOL_ICONS_BY_SLUG } from "@/lib/opt-tool-icons";
import {
  PRODUCT_CTAS,
  REMINDER_MESSAGING,
} from "@/lib/messaging/product-copy";

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

const TOOL_ALERT_EXAMPLES: Record<string, string> = {
  'opt-apply': 'I-765 filing window closes in 14 days',
  'opt-clock': '28 unemployment days left on OPT',
  'stem-apply': 'STEM extension deadline in 21 days',
  'stem-clock': 'STEM unemployment days approaching limit',
};

const TOOL_SLUGS: Record<string, keyof typeof OPT_TOOL_ICONS_BY_SLUG> = {
  'opt-apply': 'opt-apply',
  'opt-clock': 'opt-clock',
  'stem-apply': 'stem-apply',
  'stem-clock': 'stem-clock',
};

const TOOL_COLORS: Record<string, string> = {
  'opt-apply': 'from-blue-500 to-indigo-600',
  'opt-clock': 'from-amber-500 to-orange-600',
  'stem-apply': 'from-green-500 to-emerald-600',
  'stem-clock': 'from-purple-500 to-violet-600',
};

const PRO_CHECKOUT = "/premium/checkout?planId=pro&interval=year";

export function EmailReminder({ toolType, isPremium, onUpgradeClick }: EmailReminderProps) {
  const [email, setEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const gradient = TOOL_COLORS[toolType];
  const label = TOOL_LABELS[toolType];
  const alertExample = TOOL_ALERT_EXAMPLES[toolType];
  const toolSlug = TOOL_SLUGS[toolType];
  const ToolIcon = OPT_TOOL_ICONS_BY_SLUG[toolSlug];
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

  if (!isPremium) {
    return (
      <div className="overflow-hidden rounded-2xl border border-purple-200/80 dark:border-purple-800/60">
        <div className={`bg-gradient-to-br px-5 py-5 text-white ${gradient}`}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Pro</p>
              <h3 className="text-lg font-bold">{REMINDER_MESSAGING.toolUpsellHeadline}</h3>
              <p className="mt-1 text-sm text-white/90">{REMINDER_MESSAGING.toolUpsellSubhead}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 bg-gradient-to-b from-purple-50/50 to-white p-5 dark:from-purple-950/20 dark:to-gray-950">
          <div className={`rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/50`}>
            <div className="flex gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white ${gradient}`}>
                <ToolIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{alertExample}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-purple-200/80 bg-white/90 p-4 dark:border-purple-800/60 dark:bg-gray-950/80">
            <p className="text-xs font-medium text-muted-foreground">Sample · 9:00 AM ET</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
              {REMINDER_MESSAGING.sampleEmailSubject}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {REMINDER_MESSAGING.sampleEmailBody}
            </p>
          </div>

          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              Daily 9:00 AM ET email for this tracker
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              Browser + inbox alerts
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
              Customize reminders per tracker on Pro
            </li>
          </ul>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={PRO_CHECKOUT}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
            >
              {PRODUCT_CTAS.startTrial}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {onUpgradeClick && (
              <button
                type="button"
                onClick={onUpgradeClick}
                className="flex-1 rounded-xl border border-purple-200 py-3 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/40"
              >
                {PRODUCT_CTAS.comparePlans}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-lg text-white`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4 sm:gap-0">
        <div className="flex items-center gap-3">
          <ToolIcon className="w-7 h-7" />
          <div>
            <h4 className="font-bold text-base">{label}</h4>
            <div className="flex items-center gap-1.5 text-sm opacity-90">
              <Clock className="w-3.5 h-3.5" />
              <span>Daily at 9:00 AM ET</span>
            </div>
          </div>
        </div>

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-white/15 gap-4 sm:gap-0">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 opacity-80" />
            <span className="text-sm font-medium break-all sm:break-normal">
              {savedEmail || 'No email set'}
            </span>
          </div>

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
