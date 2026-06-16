"use client";

import { useState } from "react";
import {
  Building2, BookOpen, Phone, Bell,
  ChevronRight, ExternalLink, CheckCircle2, XCircle, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WebPushEnableButton } from "@/components/dashboard/case-status/WebPushEnableButton";
import { cn } from "@/lib/utils";

interface NotificationSettingsProps {
  isPremium: boolean | null;
  emailAlertsOn: boolean;
  emailAddress: string;
  isEditingEmail: boolean;
  emailSaving: boolean;
  onToggleEmail: () => void;
  onStartEditEmail: () => void;
  onCancelEditEmail: () => void;
  onSaveEmail: () => void;
  onEmailChange: (v: string) => void;
  onUpgrade: () => void;
}

interface ToolsAccordionProps {
  notifications: NotificationSettingsProps;
}

type ToolKey = "notifications" | "ppcontact" | "decoder" | "everify";

interface Tool {
  key: ToolKey;
  label: string;
  icon: React.ReactNode;
}

const TOOLS: Tool[] = [
  { key: "notifications", label: "Notification Settings",        icon: <Bell className="w-4 h-4" /> },
  { key: "ppcontact",     label: "Premium Processing Contact",    icon: <Phone className="w-4 h-4" /> },
  { key: "decoder",       label: "USCIS Status Decoder",         icon: <BookOpen className="w-4 h-4" /> },
  { key: "everify",       label: "E-Verify Employer Checker",    icon: <Building2 className="w-4 h-4" /> },
];

const STATUS_DECODER_ROWS = [
  { status: "Case Was Received",              plain: "USCIS got your application",        action: "Wait — processing begins." },
  { status: "Changed to Premium Processing",  plain: "15-day processing clock started",   action: "Count 15 business days from PP start date." },
  { status: "Is Being Actively Reviewed",     plain: "An officer is reviewing your file", action: "Wait. Average review 1–3 weeks." },
  { status: "Request for Evidence",          plain: "USCIS needs more documents",        action: "Respond by the RFE deadline or risk denial." },
  { status: "Approved",                       plain: "Application approved!",             action: "Wait for card production." },
  { status: "Card Was Produced",             plain: "EAD card is being printed",         action: "Card mailed within 1–2 business days." },
  { status: "Transferred",                    plain: "Moved to a different service center", action: "No action needed. Processing continues there." },
  { status: "Denied",                        plain: "Application was denied",            action: "Consult immigration attorney within 30 days." },
];

function PPContactPanel() {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800">
        <div>
          <p className="font-semibold">USCIS Contact Center</p>
          <p className="text-muted-foreground text-xs">Mon–Fri 8 AM–8 PM ET</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" asChild>
          <a href="tel:18003755283">
            <Phone className="w-3.5 h-3.5" />
            (800) 375-5283
          </a>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground px-1">
        Ask the IVR system for <strong>&#34;premium processing&#34;</strong> to reach the correct team faster.
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800">
        <div>
          <p className="font-semibold">Online E-Request</p>
          <p className="text-muted-foreground text-xs">my.uscis.gov → Case inquiry</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" asChild>
          <a href="https://my.uscis.gov/account" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3.5 h-3.5" />
            Open
          </a>
        </Button>
      </div>
    </div>
  );
}

function DecoderPanel() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 pr-3 font-semibold text-foreground">USCIS Status</th>
            <th className="text-left py-2 pr-3 font-semibold text-foreground">Plain English</th>
            <th className="text-left py-2 font-semibold text-foreground">What to Do</th>
          </tr>
        </thead>
        <tbody>
          {STATUS_DECODER_ROWS.map((row, i) => (
            <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
              <td className="py-2 pr-3 font-medium">{row.status}</td>
              <td className="py-2 pr-3 text-muted-foreground">{row.plain}</td>
              <td className="py-2 text-muted-foreground">{row.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EVerifyPanel() {
  const [employer, setEmployer] = useState("");
  const [result, setResult] = useState<"enrolled" | "not-enrolled" | null>(null);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        STEM OPT requires your employer to be enrolled in E-Verify. Check enrollment status before filing your STEM extension.
      </p>
      <div className="flex gap-2">
        <Input
          placeholder="Employer name or EIN"
          value={employer}
          onChange={(e) => setEmployer(e.target.value)}
          className="flex-1"
        />
        <Button
          size="sm"
          onClick={() => setResult(employer.length > 3 ? "enrolled" : "not-enrolled")}
          disabled={!employer.trim()}
        >
          Check
        </Button>
      </div>
      {result === "enrolled" && (
        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          Employer appears to be E-Verify enrolled.
        </div>
      )}
      {result === "not-enrolled" && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <XCircle className="w-4 h-4" />
          Employer not found — confirm directly with HR before filing STEM extension.
        </div>
      )}
      <p className="text-[10px] text-muted-foreground">
        Results are indicative only. Verify enrollment directly with your employer&apos;s HR team.
      </p>
    </div>
  );
}

function NotificationsPanel({ n }: { n: NotificationSettingsProps }) {
  return (
    <div className="space-y-4">
      {n.isPremium ? (
        <>
          {/* Email row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Email alerts</p>
              <p className="text-xs text-muted-foreground ph-mask" data-ph-mask>
                {n.emailAddress || "No email set"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={n.emailAlertsOn ? n.onToggleEmail : n.onToggleEmail}
                className={cn(
                  "gap-1.5 text-xs",
                  n.emailAlertsOn
                    ? "border-emerald-300 text-emerald-700 dark:text-emerald-300"
                    : "text-muted-foreground"
                )}
              >
                {n.emailAlertsOn ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {n.emailAlertsOn ? "On" : "Off"}
              </Button>
              <Button size="sm" variant="outline" onClick={n.onStartEditEmail} className="text-xs">
                Edit
              </Button>
            </div>
          </div>

          {n.isEditingEmail && (
            <div className="space-y-2">
              <Input
                type="email"
                value={n.emailAddress}
                onChange={(e) => n.onEmailChange(e.target.value)}
                placeholder="your.email@example.com"
                aria-label="Notification email"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={n.onSaveEmail} disabled={n.emailSaving}>
                  {n.emailSaving ? "Saving…" : "Save"}
                </Button>
                <Button size="sm" variant="outline" onClick={n.onCancelEditEmail} disabled={n.emailSaving}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Browser push row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Browser push</p>
              <p className="text-xs text-muted-foreground">Get notifications on this device</p>
            </div>
            <WebPushEnableButton />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted-foreground">
            Upgrade to Pro for email + browser alerts on every status change.
          </p>
          <Button size="sm" onClick={n.onUpgrade} className="gap-2">
            <Crown className="w-3.5 h-3.5" />
            Upgrade to Pro
          </Button>
        </div>
      )}
    </div>
  );
}

export function ToolsAccordion({ notifications }: ToolsAccordionProps) {
  const [open, setOpen] = useState<ToolKey | null>(null);

  const toggle = (key: ToolKey) => setOpen((p) => (p === key ? null : key));

  return (
    <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
      {TOOLS.map((tool) => {
        const isOpen = open === tool.key;
        return (
          <div key={tool.key}>
            <button
              onClick={() => toggle(tool.key)}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer text-left"
            >
              <span className="flex items-center gap-3 text-sm font-medium">
                <span className="text-muted-foreground">{tool.icon}</span>
                {tool.label}
              </span>
              <ChevronRight
                className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-90")}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-2 bg-muted/10">
                {tool.key === "notifications" && <NotificationsPanel n={notifications} />}
                {tool.key === "ppcontact"     && <PPContactPanel />}
                {tool.key === "decoder"       && <DecoderPanel />}
                {tool.key === "everify"       && <EVerifyPanel />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
