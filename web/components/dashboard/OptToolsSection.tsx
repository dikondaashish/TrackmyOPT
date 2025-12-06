"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Crown, Pencil, BellOff, Clock, Users, TrendingUp, Lightbulb, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PricingModal } from "@/components/pricing/PricingModal";

// Import the individual tool components
import { OptApplyTool } from "./tools/OptApplyTool";
import { OptClockTool } from "./tools/OptClockTool";
import { StemApplyTool } from "./tools/StemApplyTool";
import { StemClockTool } from "./tools/StemClockTool";

type ToolName = "opt_apply" | "opt_clock" | "stem_apply" | "stem_clock";

interface ToolEmails {
  opt_apply: string;
  opt_clock: string;
  stem_apply: string;
  stem_clock: string;
}

const TOOLS = {
  opt_apply: {
    id: "opt_apply" as ToolName,
    label: "OPT Apply Dates",
    shortLabel: "Apply Dates",
    icon: "📅",
    description: "Calculate filing window",
    gradient: "from-blue-500 to-indigo-600",
    tips: [
      { icon: "⏱️", text: "Average processing: 3-5 months" },
      { icon: "📬", text: "Use USPS Priority Mail for tracking" },
      { icon: "💡", text: "File early - don't wait until deadline" },
    ],
    stats: { label: "Avg Processing", value: "90-150 days", trend: "Based on 2024 data" },
  },
  opt_clock: {
    id: "opt_clock" as ToolName,
    label: "OPT Clock Tracker",
    shortLabel: "90-Day Clock",
    icon: "⏰",
    description: "Track unemployment limit",
    gradient: "from-amber-500 to-orange-600",
    tips: [
      { icon: "📊", text: "Volunteer work counts toward employment" },
      { icon: "🎯", text: "20+ hours/week = employed status" },
      { icon: "⚠️", text: "Self-employment needs proper E-Verify" },
    ],
    stats: { label: "Community Avg", value: "45 days used", trend: "From OPT tracker reports" },
  },
  stem_apply: {
    id: "stem_apply" as ToolName,
    label: "STEM Apply Dates",
    shortLabel: "STEM Apply",
    icon: "🎓",
    description: "STEM extension window",
    gradient: "from-green-500 to-emerald-600",
    tips: [
      { icon: "✅", text: "Employer must be E-Verify enrolled" },
      { icon: "📋", text: "I-983 training plan required" },
      { icon: "🔄", text: "Cap-gap auto-extends work auth" },
    ],
    stats: { label: "Approval Rate", value: "~95%", trend: "With complete applications" },
  },
  stem_clock: {
    id: "stem_clock" as ToolName,
    label: "STEM Clock Tracker",
    shortLabel: "150-Day Clock",
    icon: "⏲️",
    description: "Aggregate unemployment",
    gradient: "from-purple-500 to-violet-600",
    tips: [
      { icon: "📈", text: "Prior OPT days carry over" },
      { icon: "🏢", text: "Must report job changes in 10 days" },
      { icon: "📝", text: "Keep employment records updated" },
    ],
    stats: { label: "Limit", value: "150 days total", trend: "Includes prior OPT period" },
  },
};

// Community insights component
function CommunityInsights({ toolId }: { toolId: ToolName }) {
  const tool = TOOLS[toolId];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <Users className="w-4 h-4" />
        <span className="text-sm font-semibold">Community Insights</span>
      </div>
      
      {/* Stats card */}
      <div className="p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{tool.stats.label}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{tool.stats.value}</p>
          </div>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        <p className="text-xs text-gray-400 mt-1">{tool.stats.trend}</p>
      </div>

      {/* Tips */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Lightbulb className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Quick Tips</span>
        </div>
        {tool.tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2 text-sm">
            <span className="text-base">{tip.icon}</span>
            <span className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{tip.text}</span>
          </div>
        ))}
      </div>

      {/* Resources link */}
      <a href="https://www.uscis.gov/opt" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2">
        <ExternalLink className="w-3 h-3" />
        Official USCIS OPT Info
      </a>
    </div>
  );
}

export function OptToolsSection() {
  const [activeTool, setActiveTool] = useState<ToolName | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [toolEmails, setToolEmails] = useState<ToolEmails>({
    opt_apply: '', opt_clock: '', stem_apply: '', stem_clock: '',
  });
  const [editingEmail, setEditingEmail] = useState<ToolName | null>(null);
  const [emailSaving, setEmailSaving] = useState(false);

  useEffect(() => {
    checkPremiumStatus();
    loadToolEmails();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const res = await fetch('/api/premium/status', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setIsPremium(data.isPremium || false);
      }
    } catch {}
  };

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
    } catch {}
  };

  const saveEmail = async (tool: ToolName, email: string) => {
    try {
      setEmailSaving(true);
      await fetch('/api/user/tool-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, email }),
      });
      setToolEmails(prev => ({ ...prev, [tool]: email }));
      setEditingEmail(null);
    } catch {} finally {
      setEmailSaving(false);
    }
  };

  const stopEmail = async (tool: ToolName) => {
    if (confirm('Stop email reminders for this tool?')) {
      await saveEmail(tool, '');
    }
  };

  // Render active tool with sidebar layout
  if (activeTool) {
    const tool = TOOLS[activeTool];
    return (
      <div className="space-y-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTool(null)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-2xl">{tool.icon}</span>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">{tool.label}</h1>
              <p className="text-xs text-gray-500">{tool.description}</p>
            </div>
          </div>
          
          {/* Premium Email Badge or Upgrade */}
          {isPremium ? (
            toolEmails[activeTool] ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Reminders Active
              </div>
            ) : (
              <button onClick={() => setEditingEmail(activeTool)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                <Mail className="w-3.5 h-3.5" />
                Set Reminders
              </button>
            )
          ) : (
            <button onClick={() => setShowPremiumModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium hover:shadow-md transition-all">
              <Crown className="w-3.5 h-3.5" />
              Upgrade for Reminders
            </button>
          )}
        </div>

        {/* Main content with sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tool content - takes 2 columns */}
          <div className="lg:col-span-2 p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
            {activeTool === "opt_apply" && <OptApplyTool />}
            {activeTool === "opt_clock" && <OptClockTool />}
            {activeTool === "stem_apply" && <StemApplyTool />}
            {activeTool === "stem_clock" && <StemClockTool />}
          </div>

          {/* Sidebar - insights & email */}
          <div className="space-y-4">
            {/* Community insights */}
            <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
              <CommunityInsights toolId={activeTool} />
            </div>

            {/* Email reminders section - Premium only */}
            <div className={`p-4 rounded-xl border ${isPremium ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50' : 'border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Reminders</span>
                {!isPremium && <Crown className="w-3.5 h-3.5 text-amber-500" />}
              </div>

              {isPremium ? (
                <>
                  {editingEmail === activeTool ? (
                    <div className="space-y-2">
                      <Input type="email" value={toolEmails[activeTool]}
                        onChange={(e) => setToolEmails(prev => ({ ...prev, [activeTool]: e.target.value }))}
                        placeholder="your@email.com" className="text-sm h-9" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEmail(activeTool, toolEmails[activeTool])} disabled={emailSaving} className="flex-1 h-8 text-xs">
                          {emailSaving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingEmail(null)} className="h-8 text-xs">Cancel</Button>
                      </div>
                    </div>
                  ) : toolEmails[activeTool] ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Sending daily updates to:</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{toolEmails[activeTool]}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingEmail(activeTool)} className="flex-1 h-8 text-xs">
                          <Pencil className="w-3 h-3 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => stopEmail(activeTool)} className="h-8 text-xs text-red-600 hover:text-red-700">
                          <BellOff className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Get daily deadline reminders</p>
                      <Button size="sm" onClick={() => setEditingEmail(activeTool)} className="w-full h-8 text-xs">
                        <Mail className="w-3 h-3 mr-1" /> Enable Reminders
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Get daily deadline reminders and never miss important dates.
                  </p>
                  <Button size="sm" onClick={() => setShowPremiumModal(true)} className="w-full h-9 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Upgrade to Premium
                  </Button>
                  <p className="text-[10px] text-gray-400 text-center">Includes all premium features</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <PricingModal open={showPremiumModal} onClose={() => setShowPremiumModal(false)} isPremium={isPremium} />
      </div>
    );
  }

  // Tool selection - compact grid
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">OPT Tools</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Calculate deadlines & track status</p>
        </div>
        {!isPremium && (
          <button onClick={() => setShowPremiumModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium hover:shadow-md transition-all">
            <Crown className="w-3.5 h-3.5" />
            Upgrade
          </button>
        )}
      </div>

      {/* Tools Grid - 2x2 compact */}
      <div className="grid grid-cols-2 gap-3">
        {Object.values(TOOLS).map((tool) => (
          <button key={tool.id} onClick={() => setActiveTool(tool.id)}
            className={`p-4 rounded-xl bg-gradient-to-br ${tool.gradient} text-white text-left shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{tool.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate">{tool.shortLabel}</h3>
                <p className="text-xs opacity-80 truncate">{tool.description}</p>
              </div>
            </div>
            {/* Email status indicator */}
            <div className="mt-3 flex items-center gap-1.5 text-xs opacity-80">
              <Mail className="w-3 h-3" />
              {toolEmails[tool.id] ? (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>
                  Active
                </span>
              ) : (
                <span>No reminders</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-4 gap-2">
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-center">
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">90d</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">OPT Limit</p>
        </div>
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 text-center">
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">150d</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">STEM Limit</p>
        </div>
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 text-center">
          <p className="text-lg font-bold text-green-600 dark:text-green-400">24mo</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">STEM Period</p>
        </div>
        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 text-center">
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">12mo</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">OPT Period</p>
        </div>
      </div>

      {/* Resources banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
              <Lightbulb className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">OPT Resources</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Official guides, processing times & tips</p>
            </div>
          </div>
          <a href="https://www.uscis.gov/opt" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline">
            Learn more <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <PricingModal open={showPremiumModal} onClose={() => setShowPremiumModal(false)} isPremium={isPremium} />
    </div>
  );
}
