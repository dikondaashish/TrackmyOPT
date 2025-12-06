"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Mail, Crown, Pencil, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
    icon: "📅",
    description: "Calculate your OPT application filing window",
    gradient: "from-blue-500 to-indigo-600",
  },
  opt_clock: {
    id: "opt_clock" as ToolName,
    label: "OPT Clock Tracker", 
    icon: "⏰",
    description: "Track your 90-day unemployment limit",
    gradient: "from-amber-500 to-orange-600",
  },
  stem_apply: {
    id: "stem_apply" as ToolName,
    label: "STEM Apply Dates",
    icon: "🎓", 
    description: "Calculate STEM OPT extension filing window",
    gradient: "from-green-500 to-emerald-600",
  },
  stem_clock: {
    id: "stem_clock" as ToolName,
    label: "STEM Clock Tracker",
    icon: "⏲️",
    description: "Track 150-day aggregate unemployment",
    gradient: "from-purple-500 to-violet-600",
  },
};

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

  // Render active tool
  if (activeTool) {
    const tool = TOOLS[activeTool];
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTool(null)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{tool.icon}</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{tool.label}</h1>
              <p className="text-sm text-gray-500">{tool.description}</p>
            </div>
          </div>
        </div>

        {/* Tool content */}
        <Card className="p-6">
          {activeTool === "opt_apply" && <OptApplyTool />}
          {activeTool === "opt_clock" && <OptClockTool />}
          {activeTool === "stem_apply" && <StemApplyTool />}
          {activeTool === "stem_clock" && <StemClockTool />}
        </Card>

        {/* Email notifications section */}
        <Card className={`p-5 bg-gradient-to-r ${tool.gradient} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" />
              <div>
                <p className="font-semibold">Daily Email Reminders</p>
                <p className="text-sm opacity-80">
                  {toolEmails[activeTool] ? `Sending to: ${toolEmails[activeTool]}` : 'Not configured'}
                </p>
              </div>
            </div>
            {isPremium ? (
              <div className="flex gap-2">
                {toolEmails[activeTool] && (
                  <Button size="sm" variant="ghost" onClick={() => stopEmail(activeTool)} 
                    className="text-white hover:bg-white/20">
                    <BellOff className="w-4 h-4 mr-1" /> Stop
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setEditingEmail(activeTool)}
                  className="text-white hover:bg-white/20">
                  <Pencil className="w-4 h-4 mr-1" /> {toolEmails[activeTool] ? 'Edit' : 'Set Email'}
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => setShowPremiumModal(true)} 
                className="bg-white text-gray-900 hover:bg-gray-100">
                <Crown className="w-4 h-4 mr-1" /> Upgrade
              </Button>
            )}
          </div>
          
          {editingEmail === activeTool && (
            <div className="mt-4 flex gap-2">
              <Input
                type="email"
                value={toolEmails[activeTool]}
                onChange={(e) => setToolEmails(prev => ({ ...prev, [activeTool]: e.target.value }))}
                placeholder="your.email@example.com"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
              />
              <Button onClick={() => saveEmail(activeTool, toolEmails[activeTool])} disabled={emailSaving}
                className="bg-white/20 hover:bg-white/30 text-white">
                {emailSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="ghost" onClick={() => setEditingEmail(null)} className="text-white hover:bg-white/20">
                Cancel
              </Button>
            </div>
          )}
        </Card>

        <PricingModal open={showPremiumModal} onClose={() => setShowPremiumModal(false)} isPremium={isPremium} />
      </div>
    );
  }

  // Render tool selection grid
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">OPT Tools</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Select a tool to calculate deadlines and track your OPT status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.values(TOOLS).map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`p-6 rounded-2xl bg-gradient-to-br ${tool.gradient} text-white text-left 
              shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200`}
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{tool.icon}</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{tool.label}</h3>
                <p className="text-sm opacity-90 mb-4">{tool.description}</p>
                
                {/* Email status */}
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 opacity-70" />
                  {toolEmails[tool.id] ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                      Active
                    </span>
                  ) : (
                    <span className="opacity-70">No reminders</span>
                  )}
                </div>
              </div>
              <div className="text-2xl opacity-50">→</div>
            </div>
          </button>
        ))}
      </div>

      <PricingModal open={showPremiumModal} onClose={() => setShowPremiumModal(false)} isPremium={isPremium} />
    </div>
  );
}
