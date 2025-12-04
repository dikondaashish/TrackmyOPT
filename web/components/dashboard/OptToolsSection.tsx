"use client";

import { useState, useEffect } from "react";
import { Mail, Crown, BellOff, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PricingModal } from "@/components/pricing/PricingModal";

interface ToolEmails {
  opt_apply: string;
  opt_clock: string;
  stem_apply: string;
  stem_clock: string;
}

type ToolName = keyof ToolEmails;

const TOOL_INFO: Record<ToolName, { label: string; icon: string; description: string; color: string; features: string[] }> = {
  opt_apply: {
    label: 'OPT Apply Dates',
    icon: '📅',
    description: 'Track your OPT application deadlines',
    color: 'from-blue-500 to-blue-600',
    features: [
      'OPT filing deadline reminders',
      '90-day application window tracking',
      'DSO recommendation date alerts',
      'Program end date countdown',
    ],
  },
  opt_clock: {
    label: 'OPT Clock Tracker',
    icon: '⏰',
    description: 'Monitor your unemployment days',
    color: 'from-amber-500 to-orange-500',
    features: [
      'Track 90-day unemployment limit',
      'Daily countdown notifications',
      'Employment gap detection',
      'Urgent alerts when running low',
    ],
  },
  stem_apply: {
    label: 'STEM Apply Dates',
    icon: '🎓',
    description: 'STEM OPT extension deadlines',
    color: 'from-green-500 to-emerald-600',
    features: [
      'STEM extension filing reminders',
      'I-983 training plan deadlines',
      'Cap-gap protection tracking',
      'Extension eligibility alerts',
    ],
  },
  stem_clock: {
    label: 'STEM Clock Tracker',
    icon: '⏲️',
    description: 'STEM unemployment tracking',
    color: 'from-purple-500 to-violet-600',
    features: [
      'Track 150-day unemployment limit',
      'Aggregate unemployment tracking',
      'STEM-specific deadline alerts',
      'Employment verification reminders',
    ],
  },
};

export function OptToolsSection() {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toolEmails, setToolEmails] = useState<ToolEmails>({
    opt_apply: '',
    opt_clock: '',
    stem_apply: '',
    stem_clock: '',
  });
  const [editingTool, setEditingTool] = useState<ToolName | null>(null);
  const [emailSaving, setEmailSaving] = useState<ToolName | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    checkPremiumStatus();
    loadToolEmails();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const response = await fetch('/api/premium/status', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setIsPremium(data.isPremium || false);
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  };

  const loadToolEmails = async () => {
    try {
      const response = await fetch('/api/user/tool-email', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
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

  const handleToolEmailSave = async (tool: ToolName) => {
    const email = toolEmails[tool];
    if (!email || !email.includes('@')) {
      return;
    }

    try {
      setEmailSaving(tool);
      const response = await fetch('/api/user/tool-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, email }),
      });

      if (response.ok) {
        setEditingTool(null);
      }
    } catch {
      // Silently fail
    } finally {
      setEmailSaving(null);
    }
  };

  const handleToolEmailStop = async (tool: ToolName) => {
    if (!confirm('Stop email reminders for this tool?')) {
      return;
    }

    try {
      setEmailSaving(tool);
      const response = await fetch('/api/user/tool-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, email: '' }),
      });

      if (response.ok) {
        setToolEmails(prev => ({ ...prev, [tool]: '' }));
      }
    } catch {
      // Silently fail
    } finally {
      setEmailSaving(null);
    }
  };

  const updateToolEmail = (tool: ToolName, email: string) => {
    setToolEmails(prev => ({ ...prev, [tool]: email }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">OPT Tools</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          All your OPT tracking tools in one place. Set up email reminders for each tool.
        </p>
      </div>

      {/* Premium Banner for Non-Premium Users */}
      {!isPremium && (
        <Card className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Unlock Email Reminders</h3>
                <p className="text-white/80 text-sm">
                  Get daily email notifications at 9:00 AM ET for all your OPT deadlines
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowPremiumModal(true)}
              className="bg-white text-purple-600 hover:bg-white/90 font-semibold"
            >
              Upgrade to Pro
            </Button>
          </div>
        </Card>
      )}

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.keys(TOOL_INFO) as ToolName[]).map((tool) => {
          const info = TOOL_INFO[tool];
          const isEditing = editingTool === tool;
          const isSaving = emailSaving === tool;
          const hasEmail = !!toolEmails[tool];

          return (
            <Card
              key={tool}
              className={`overflow-hidden bg-gradient-to-br ${info.color} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{info.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold">{info.label}</h3>
                      <p className="text-white/80 text-sm">{info.description}</p>
                    </div>
                  </div>
                  {isPremium && (
                    hasEmail ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/30 backdrop-blur-sm text-white text-xs font-semibold shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-500/30 backdrop-blur-sm text-white/70 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        Inactive
                      </span>
                    )
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-2 mb-6">
                  {info.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-white/90">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Email Section */}
                {isPremium ? (
                  <div className="pt-4 border-t border-white/20">
                    {isEditing ? (
                      <div className="space-y-3">
                        <Input
                          type="email"
                          value={toolEmails[tool]}
                          onChange={(e) => updateToolEmail(tool, e.target.value)}
                          placeholder="your.email@example.com"
                          className="bg-white/20 border-white/30 text-white placeholder:text-white/60 text-sm h-11"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleToolEmailSave(tool)}
                            size="sm"
                            className="bg-white/25 hover:bg-white/35 text-white text-sm font-medium px-4 shadow-sm transition-all duration-200"
                            disabled={isSaving}
                          >
                            {isSaving ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            onClick={() => setEditingTool(null)}
                            size="sm"
                            variant="ghost"
                            className="text-white/80 hover:text-white hover:bg-white/15 text-sm transition-all duration-200"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="w-5 h-5 opacity-80" />
                          <span className="text-sm font-medium">
                            {toolEmails[tool] || 'No email set'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasEmail && (
                            <button
                              onClick={() => handleToolEmailStop(tool)}
                              disabled={isSaving}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-red-100 text-sm font-medium shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50"
                            >
                              <BellOff className="w-4 h-4" />
                              <span>{isSaving ? '...' : 'Stop'}</span>
                            </button>
                          )}
                          <button
                            onClick={() => setEditingTool(tool)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium shadow-sm hover:shadow transition-all duration-200"
                          >
                            <Pencil className="w-4 h-4" />
                            <span>{hasEmail ? 'Edit' : 'Set Email'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pt-4 border-t border-white/20">
                    <button
                      onClick={() => setShowPremiumModal(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-all duration-200"
                    >
                      <Crown className="w-4 h-4" />
                      <span>Upgrade to Enable Email Reminders</span>
                    </button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info Section */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              How Email Reminders Work
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Each tool sends separate daily email reminders at 9:00 AM Eastern Time. You can set different email addresses for each tool, 
              or use the same email for all. Reminders include countdown information and important deadline alerts specific to each tool.
            </p>
          </div>
        </div>
      </Card>

      {/* Pricing Modal */}
      <PricingModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        isPremium={isPremium}
      />
    </div>
  );
}
