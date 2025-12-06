"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info, AlertTriangle, Clock,
  Plus, Trash2, ArrowLeft, Mail, TrendingUp, Timer, Sparkles, Bell, BellOff, Pencil, Crown, Users
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PricingModal } from "@/components/pricing/PricingModal";

// Types
interface OptDatesData {
  program_end_date?: string;
  dso_recommendation_date?: string;
  opt_start_date?: string;
  opt_ead_end_date?: string;
  stem_start_date?: string;
}

interface EmploymentSpan {
  id: string;
  start_date: string;
  end_date: string | null;
}

interface ToolEmails {
  opt_apply: string;
  opt_clock: string;
  stem_apply: string;
  stem_clock: string;
}

type ToolName = keyof ToolEmails;

// Approval Stats from Reddit/Trackitt Dec 2024
const APPROVAL_STATS = {
  opt_apply: { avgDays: 45, fastestDays: 14, tips: ["E-file for faster processing", "Premium processing available", "Nebraska & Texas fastest"] },
  opt_clock: { maxDays: 90, riskThreshold: 60, tips: ["Volunteering counts", "Multiple part-time OK", "Keep employment records"] },
  stem_apply: { avgDays: 60, fastestDays: 21, tips: ["File 90 days before OPT ends", "Cap-gap protects while pending", "I-983 must be complete"] },
  stem_clock: { maxDays: 150, riskThreshold: 100, tips: ["Aggregate limit (OPT + STEM)", "Report changes within 10 days", "E-Verify employer required"] }
};

// Date Utilities
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [m, d, y] = parts.map(Number);
    if (!isNaN(m) && !isNaN(d) && !isNaN(y)) return new Date(y, m - 1, d);
  }
  const iso = new Date(dateStr);
  return isNaN(iso.getTime()) ? null : iso;
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateInput(date: Date): string {
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
}

function addDays(date: Date, days: number): Date {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}

function daysBetween(d1: Date, d2: Date): number {
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function isoToMMDDYYYY(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : formatDateInput(d);
}

// Date Picker Component
function DatePicker({ value, onSelect }: { value: string; onSelect: (d: string) => void }) {
  const [month, setMonth] = useState(() => parseDate(value) || new Date());
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const selected = parseDate(value);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-72">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"><ChevronLeft className="w-4 h-4" /></button>
        <span className="font-semibold">{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="text-gray-500 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <button key={i} disabled={!day} onClick={() => day && onSelect(formatDateInput(new Date(month.getFullYear(), month.getMonth(), day)))}
            className={`p-2 text-sm rounded-xl ${!day ? 'invisible' : selected?.getDate() === day && selected?.getMonth() === month.getMonth() ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

// Date Input Field
function DateInputField({ label, value, onChange, description, icon }: { label: string; value: string; onChange: (v: string) => void; description?: string; icon?: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setShow(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">{icon || <CalendarIcon className="w-4 h-4" />}{label}</label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      <div className="relative">
        <Input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="MM/DD/YYYY" className="pr-12" />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><CalendarIcon className="w-4 h-4 text-gray-500" /></button>
        {show && <div ref={ref} className="absolute top-full mt-2 z-50 right-0"><DatePicker value={value} onSelect={(d) => { onChange(d); setShow(false); }} /></div>}
      </div>
    </div>
  );
}

// Stats Widget
function StatsWidget({ tool }: { tool: ToolName }) {
  const stats = APPROVAL_STATS[tool];
  const isApply = tool.includes('apply');
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isApply ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
          {isApply ? <TrendingUp className="w-4 h-4 text-blue-600" /> : <Timer className="w-4 h-4 text-amber-600" />}
        </div>
        <h4 className="font-semibold text-sm">{isApply ? 'Processing Times' : 'Unemployment Limits'}</h4>
      </div>
      {isApply ? (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{(stats as any).avgDays}</p><p className="text-xs text-gray-500">Avg Days</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{(stats as any).fastestDays}</p><p className="text-xs text-gray-500">Fastest</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{(stats as any).maxDays}</p><p className="text-xs text-gray-500">Max Days</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{(stats as any).riskThreshold}</p><p className="text-xs text-gray-500">Risk Zone</p>
          </div>
        </div>
      )}
      <div className="space-y-1">
        <p className="text-xs font-medium flex items-center gap-1"><Sparkles className="w-3 h-3" /> Pro Tips</p>
        {stats.tips.map((t, i) => <p key={i} className="text-xs text-gray-500 pl-4">• {t}</p>)}
      </div>
    </div>
  );
}

// Tool Cards
const TOOLS = [
  { id: 'opt_apply' as ToolName, name: 'OPT Apply Dates', icon: '📅', desc: 'Calculate filing window', gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' },
  { id: 'opt_clock' as ToolName, name: 'OPT Clock Tracker', icon: '⏰', desc: 'Track 90-day limit', gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' },
  { id: 'stem_apply' as ToolName, name: 'STEM Apply Dates', icon: '🎓', desc: 'STEM extension filing', gradient: 'from-green-500 to-emerald-600', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
  { id: 'stem_clock' as ToolName, name: 'STEM Clock Tracker', icon: '⏲️', desc: 'Track 150-day limit', gradient: 'from-purple-500 to-violet-600', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' }
];

// Main Export
export function OptToolsSection() {
  const [activeTool, setActiveTool] = useState<ToolName | null>(null);
  const [dates, setDates] = useState<OptDatesData>({});
  const [isPremium, setIsPremium] = useState(false);
  const [toolEmails, setToolEmails] = useState<ToolEmails>({ opt_apply: '', opt_clock: '', stem_apply: '', stem_clock: '' });
  const [emailSaving, setEmailSaving] = useState<ToolName | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadDates(), checkPremium(), loadEmails()]).finally(() => setIsLoading(false));
  }, []);

  const loadDates = async () => {
    try {
      const res = await fetch('/api/opt-status', { credentials: 'include' });
      if (res.ok) { const data = await res.json(); setDates(data); }
    } catch {}
  };

  const checkPremium = async () => {
    try {
      const res = await fetch('/api/premium/status', { credentials: 'include' });
      if (res.ok) { const data = await res.json(); setIsPremium(data.isPremium || false); }
    } catch {}
  };

  const loadEmails = async () => {
    try {
      const res = await fetch('/api/user/tool-email', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.emails) setToolEmails({ opt_apply: data.emails.opt_apply || '', opt_clock: data.emails.opt_clock || '', stem_apply: data.emails.stem_apply || '', stem_clock: data.emails.stem_clock || '' });
      }
    } catch {}
  };

  const saveEmail = async (tool: ToolName) => {
    const email = toolEmails[tool];
    if (!email?.includes('@')) return;
    setEmailSaving(tool);
    try {
      await fetch('/api/user/tool-email', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tool, email }) });
    } catch {} finally { setEmailSaving(null); }
  };

  const stopEmail = async (tool: ToolName) => {
    if (!confirm('Stop email reminders?')) return;
    setEmailSaving(tool);
    try {
      const res = await fetch('/api/user/tool-email', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tool, email: '' }) });
      if (res.ok) setToolEmails(prev => ({ ...prev, [tool]: '' }));
    } catch {} finally { setEmailSaving(null); }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  // Tool Selection View
  if (!activeTool) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">OPT Tools</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Calculate deadlines and track your unemployment days</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TOOLS.map(tool => (
            <button key={tool.id} onClick={() => setActiveTool(tool.id)} className={`group relative overflow-hidden rounded-3xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-2xl ${tool.bg} border ${tool.border}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-5xl">{tool.icon}</span>
                  {toolEmails[tool.id] && <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-xs font-medium flex items-center gap-1"><Bell className="w-3 h-3" />Active</span>}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{tool.desc}</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${tool.gradient} text-white text-sm font-medium shadow-lg`}>Open Tool<ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Active Tool View
  const tool = TOOLS.find(t => t.id === activeTool)!;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => setActiveTool(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{tool.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tool.name}</h1>
            <p className="text-sm text-gray-500">Synced with OPT Dates</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Tool Interface */}
        <div className="lg:col-span-2 space-y-6">
          {activeTool === 'opt_apply' && <OptApplyInterface dates={dates} />}
          {activeTool === 'opt_clock' && <OptClockInterface dates={dates} />}
          {activeTool === 'stem_apply' && <StemApplyInterface dates={dates} />}
          {activeTool === 'stem_clock' && <StemClockInterface dates={dates} />}
          
          {/* Email Section */}
          <EmailSection tool={activeTool} email={toolEmails[activeTool]} onEmailChange={(e) => setToolEmails(prev => ({ ...prev, [activeTool]: e }))} onSave={() => saveEmail(activeTool)} onStop={() => stopEmail(activeTool)} isPremium={isPremium} isSaving={emailSaving === activeTool} onUpgradeClick={() => setShowPricingModal(true)} />
        </div>
        
        {/* Stats Widget */}
        <div className="space-y-6">
          <StatsWidget tool={activeTool} />
        </div>
      </div>
      <PricingModal open={showPricingModal} onClose={() => setShowPricingModal(false)} isPremium={isPremium} />
    </div>
  );
}

// Email Section Component
function EmailSection({ tool, email, onEmailChange, onSave, onStop, isPremium, isSaving, onUpgradeClick }: { tool: ToolName; email: string; onEmailChange: (e: string) => void; onSave: () => void; onStop: () => void; isPremium: boolean; isSaving: boolean; onUpgradeClick: () => void }) {
  const [editing, setEditing] = useState(false);
  if (!isPremium) return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><Crown className="w-5 h-5 text-purple-600" /></div><div><p className="font-medium">Email Reminders</p><p className="text-sm text-gray-500">Daily at 9:00 AM ET</p></div></div>
      <Button onClick={onUpgradeClick} size="sm" className="bg-purple-600 hover:bg-purple-700">Upgrade</Button>
    </div>
  );
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-4 border border-green-200 dark:border-green-800">
      <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><Bell className="w-5 h-5 text-green-600" /></div><div className="flex-1"><div className="flex items-center gap-2"><p className="font-medium">Email Reminders</p>{email && <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 text-xs font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />Active</span>}</div><p className="text-sm text-gray-500">Daily at 9:00 AM ET • Synced with OPT Dates</p></div></div>
      {editing ? (<div className="space-y-3"><Input type="email" value={email} onChange={(e) => onEmailChange(e.target.value)} placeholder="your.email@example.com" /><div className="flex gap-2"><Button onClick={() => { onSave(); setEditing(false); }} size="sm" disabled={isSaving} className="bg-green-600 hover:bg-green-700">{isSaving ? 'Saving...' : 'Save'}</Button><Button onClick={() => setEditing(false)} size="sm" variant="outline">Cancel</Button></div></div>) : (
        <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-gray-400" /><span>{email || 'No email set'}</span></div><div className="flex gap-2">{email && <Button onClick={onStop} size="sm" variant="ghost" className="text-red-600 hover:bg-red-50"><BellOff className="w-4 h-4 mr-1" />Stop</Button>}<Button onClick={() => setEditing(true)} size="sm" variant="outline"><Pencil className="w-4 h-4 mr-1" />{email ? 'Edit' : 'Set Email'}</Button></div></div>
      )}
    </div>
  );
}

// Tool Interfaces (simplified)
function OptApplyInterface({ dates }: { dates: OptDatesData }) {
  const [programEnd, setProgramEnd] = useState(isoToMMDDYYYY(dates.program_end_date || ''));
  const [dsoDate, setDsoDate] = useState(isoToMMDDYYYY(dates.dso_recommendation_date || ''));
  const [results, setResults] = useState<any>(null);

  const calculate = () => {
    const pe = parseDate(programEnd);
    if (!pe) return;
    const dso = parseDate(dsoDate);
    const today = new Date(); today.setHours(0,0,0,0);
    const earliest = addDays(pe, -90);
    let mustArrive = addDays(pe, 60);
    if (dso) { const d = addDays(dso, 30); if (d < mustArrive) mustArrive = d; }
    setResults({ earliest, mustArrive, optStart: pe, optLatest: addDays(pe, 60), daysLeft: daysBetween(today, mustArrive) });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
        <div className="flex gap-4"><div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><Info className="w-6 h-6" /></div><div><h3 className="font-bold text-lg mb-1">Post-Completion OPT Filing Rules</h3><p className="text-blue-100 text-sm">Apply 90 days before program ends, up to 60 days after. USCIS must receive I-765 within 30 days of DSO recommendation.</p></div></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5"><DateInputField label="Program End Date" value={programEnd} onChange={setProgramEnd} description="From your I-20" icon={<CalendarIcon className="w-4 h-4 text-blue-600" />} /></Card>
        <Card className="p-5"><DateInputField label="DSO Recommendation Date" value={dsoDate} onChange={setDsoDate} description="Optional" icon={<CalendarIcon className="w-4 h-4 text-green-600" />} /></Card>
      </div>
      <Button onClick={calculate} className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl" size="lg"><Sparkles className="w-5 h-5 mr-2" />Calculate Filing Window</Button>
      {results && (
        <div className="space-y-6">
          <div className={`rounded-3xl p-8 text-center text-white shadow-2xl ${results.daysLeft <= 14 ? 'bg-gradient-to-br from-red-500 to-red-600' : results.daysLeft <= 30 ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-green-500 to-emerald-600'}`}>
            <p className="text-white/80 text-sm mb-2">Days Until Deadline</p><p className="text-7xl font-black mb-2">{results.daysLeft}</p><p className="text-white/80">Must arrive by {formatDateDisplay(results.mustArrive)}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 text-center bg-blue-50 dark:bg-blue-900/20 border-blue-200"><p className="text-2xl mb-1">📅</p><p className="text-xs text-gray-500">Earliest File</p><p className="font-bold text-sm">{formatDateDisplay(results.earliest)}</p></Card>
            <Card className="p-4 text-center bg-red-50 dark:bg-red-900/20 border-red-200"><p className="text-2xl mb-1">⏰</p><p className="text-xs text-gray-500">Must Arrive</p><p className="font-bold text-sm">{formatDateDisplay(results.mustArrive)}</p></Card>
            <Card className="p-4 text-center bg-green-50 dark:bg-green-900/20 border-green-200"><p className="text-2xl mb-1">🎯</p><p className="text-xs text-gray-500">OPT Start</p><p className="font-bold text-sm">{formatDateDisplay(results.optStart)}</p></Card>
            <Card className="p-4 text-center bg-purple-50 dark:bg-purple-900/20 border-purple-200"><p className="text-2xl mb-1">📆</p><p className="text-xs text-gray-500">Latest Start</p><p className="font-bold text-sm">{formatDateDisplay(results.optLatest)}</p></Card>
          </div>
        </div>
      )}
    </div>
  );
}

function OptClockInterface({ dates }: { dates: OptDatesData }) {
  const [optStart, setOptStart] = useState(isoToMMDDYYYY(dates.opt_start_date || ''));
  const [optEnd, setOptEnd] = useState(isoToMMDDYYYY(dates.opt_ead_end_date || ''));
  const [jobs, setJobs] = useState<EmploymentSpan[]>([]);
  const [results, setResults] = useState<any>(null);

  const calculate = () => {
    const start = parseDate(optStart), end = parseDate(optEnd);
    if (!start || !end) return;
    const today = new Date(); today.setHours(0,0,0,0);
    const endDate = today < end ? today : end;
    const total = Math.max(0, daysBetween(start, endDate));
    let employed = 0;
    for (const j of jobs) {
      const js = parseDate(j.start_date); if (!js) continue;
      const je = j.end_date ? parseDate(j.end_date) : today; if (!je) continue;
      const es = js < start ? start : js, ee = je > endDate ? endDate : je;
      if (es <= ee) employed += daysBetween(es, ee);
    }
    const used = Math.max(0, total - employed);
    setResults({ used, remaining: Math.max(0, 90 - used), max: 90 });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-5 text-white">
        <div className="flex gap-4"><div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><AlertTriangle className="w-6 h-6" /></div><div><h3 className="font-bold text-lg mb-1">90-Day Unemployment Limit</h3><p className="text-amber-100 text-sm">Cannot exceed 90 days total unemployment during post-completion OPT.</p></div></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5"><DateInputField label="OPT Start Date" value={optStart} onChange={setOptStart} description="From EAD" /></Card>
        <Card className="p-5"><DateInputField label="OPT End Date" value={optEnd} onChange={setOptEnd} description="From EAD" /></Card>
      </div>
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4"><div><h3 className="font-semibold">Employment Periods</h3><p className="text-sm text-gray-500">Add jobs to calculate</p></div><Button onClick={() => setJobs([...jobs, { id: Date.now().toString(), start_date: '', end_date: null }])} variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" />Add Job</Button></div>
        {jobs.length === 0 ? <div className="text-center py-8 text-gray-500"><Users className="w-10 h-10 mx-auto mb-2 opacity-30" /><p className="text-sm">No jobs added</p></div> : jobs.map((j, i) => (
          <div key={j.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 mb-3">
            <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">Job #{i+1}</span><button onClick={() => setJobs(jobs.filter(x => x.id !== j.id))} className="p-1 text-red-600 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4" /></button></div>
            <div className="grid grid-cols-2 gap-3"><Input placeholder="Start MM/DD/YYYY" value={j.start_date} onChange={(e) => setJobs(jobs.map(x => x.id === j.id ? {...x, start_date: e.target.value} : x))} /><Input placeholder="End (blank=now)" value={j.end_date || ''} onChange={(e) => setJobs(jobs.map(x => x.id === j.id ? {...x, end_date: e.target.value || null} : x))} /></div>
          </div>
        ))}
      </Card>
      <Button onClick={calculate} className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl" size="lg"><Clock className="w-5 h-5 mr-2" />Calculate Unemployment</Button>
      {results && (
        <div className="space-y-6">
          <div className={`rounded-3xl p-8 text-center text-white shadow-2xl ${results.remaining <= 10 ? 'bg-gradient-to-br from-red-500 to-red-600' : results.remaining <= 30 ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-green-500 to-emerald-600'}`}>
            <p className="text-white/80 text-sm mb-2">Days Remaining</p><p className="text-7xl font-black mb-2">{results.remaining}</p><p className="text-white/80">of {results.max} days</p>
          </div>
          <Card className="p-5"><div className="flex justify-between text-sm mb-2"><span>Used: {results.used}</span><span>Limit: {results.max}</span></div><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${results.remaining <= 10 ? 'bg-red-500' : results.remaining <= 30 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${(results.used / results.max) * 100}%` }} /></div></Card>
        </div>
      )}
    </div>
  );
}

function StemApplyInterface({ dates }: { dates: OptDatesData }) {
  const [optEnd, setOptEnd] = useState(isoToMMDDYYYY(dates.opt_ead_end_date || ''));
  const [results, setResults] = useState<any>(null);

  const calculate = () => {
    const end = parseDate(optEnd);
    if (!end) return;
    const today = new Date(); today.setHours(0,0,0,0);
    setResults({ earliest: addDays(end, -90), deadline: end, capGap: addDays(end, 180), daysLeft: daysBetween(today, end) });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
        <div className="flex gap-4"><div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><Info className="w-6 h-6" /></div><div><h3 className="font-bold text-lg mb-1">STEM OPT Extension Rules</h3><p className="text-green-100 text-sm">Apply up to 90 days before OPT expires. Get 180-day cap-gap if filed timely.</p></div></div>
      </div>
      <Card className="p-5"><DateInputField label="Current OPT End Date" value={optEnd} onChange={setOptEnd} description="From EAD" icon={<CalendarIcon className="w-4 h-4 text-green-600" />} /></Card>
      <Button onClick={calculate} className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl" size="lg"><Sparkles className="w-5 h-5 mr-2" />Calculate STEM Window</Button>
      {results && (
        <div className="space-y-6">
          <div className={`rounded-3xl p-8 text-center text-white shadow-2xl ${results.daysLeft <= 14 ? 'bg-gradient-to-br from-red-500 to-red-600' : results.daysLeft <= 30 ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-green-500 to-emerald-600'}`}>
            <p className="text-white/80 text-sm mb-2">Days Until OPT Expires</p><p className="text-7xl font-black mb-2">{results.daysLeft}</p><p className="text-white/80">Must file before {formatDateDisplay(results.deadline)}</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center bg-blue-50 dark:bg-blue-900/20 border-blue-200"><p className="text-2xl mb-1">📅</p><p className="text-xs text-gray-500">Earliest File</p><p className="font-bold text-sm">{formatDateDisplay(results.earliest)}</p></Card>
            <Card className="p-4 text-center bg-red-50 dark:bg-red-900/20 border-red-200"><p className="text-2xl mb-1">⏰</p><p className="text-xs text-gray-500">Deadline</p><p className="font-bold text-sm">{formatDateDisplay(results.deadline)}</p></Card>
            <Card className="p-4 text-center bg-green-50 dark:bg-green-900/20 border-green-200"><p className="text-2xl mb-1">🛡️</p><p className="text-xs text-gray-500">Cap-Gap</p><p className="font-bold text-sm">{formatDateDisplay(results.capGap)}</p></Card>
          </div>
        </div>
      )}
    </div>
  );
}

function StemClockInterface({ dates }: { dates: OptDatesData }) {
  const [stemStart, setStemStart] = useState(isoToMMDDYYYY(dates.stem_start_date || ''));
  const [stemEnd, setStemEnd] = useState('');
  const [prior, setPrior] = useState('0');
  const [jobs, setJobs] = useState<EmploymentSpan[]>([]);
  const [results, setResults] = useState<any>(null);

  const calculate = () => {
    const start = parseDate(stemStart), end = parseDate(stemEnd);
    if (!start || !end) return;
    const today = new Date(); today.setHours(0,0,0,0);
    const endDate = today < end ? today : end;
    const total = Math.max(0, daysBetween(start, endDate));
    let employed = 0;
    for (const j of jobs) {
      const js = parseDate(j.start_date); if (!js) continue;
      const je = j.end_date ? parseDate(j.end_date) : today; if (!je) continue;
      const es = js < start ? start : js, ee = je > endDate ? endDate : je;
      if (es <= ee) employed += daysBetween(es, ee);
    }
    const stemDays = Math.max(0, total - employed);
    const priorDays = parseInt(prior) || 0;
    const used = stemDays + priorDays;
    setResults({ used, remaining: Math.max(0, 150 - used), max: 150, stemDays, priorDays });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl p-5 text-white">
        <div className="flex gap-4"><div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><AlertTriangle className="w-6 h-6" /></div><div><h3 className="font-bold text-lg mb-1">150-Day Aggregate Limit</h3><p className="text-purple-100 text-sm">Total unemployment (OPT + STEM) cannot exceed 150 days.</p></div></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5"><DateInputField label="STEM Start Date" value={stemStart} onChange={setStemStart} description="From STEM EAD" /></Card>
        <Card className="p-5"><DateInputField label="STEM End Date" value={stemEnd} onChange={setStemEnd} description="From STEM EAD" /></Card>
      </div>
      <Card className="p-5"><label className="font-semibold block mb-2">Prior OPT Unemployment Days</label><p className="text-sm text-gray-500 mb-3">From initial OPT period</p><Input type="number" value={prior} onChange={(e) => setPrior(e.target.value)} min="0" max="90" className="text-lg font-semibold" /></Card>
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4"><div><h3 className="font-semibold">STEM Employment</h3></div><Button onClick={() => setJobs([...jobs, { id: Date.now().toString(), start_date: '', end_date: null }])} variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" />Add</Button></div>
        {jobs.length === 0 ? <div className="text-center py-6 text-gray-500"><Users className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No jobs</p></div> : jobs.map((j, i) => (
          <div key={j.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 mb-3">
            <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">Job #{i+1}</span><button onClick={() => setJobs(jobs.filter(x => x.id !== j.id))} className="p-1 text-red-600 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4" /></button></div>
            <div className="grid grid-cols-2 gap-3"><Input placeholder="Start" value={j.start_date} onChange={(e) => setJobs(jobs.map(x => x.id === j.id ? {...x, start_date: e.target.value} : x))} /><Input placeholder="End" value={j.end_date || ''} onChange={(e) => setJobs(jobs.map(x => x.id === j.id ? {...x, end_date: e.target.value || null} : x))} /></div>
          </div>
        ))}
      </Card>
      <Button onClick={calculate} className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl" size="lg"><Clock className="w-5 h-5 mr-2" />Calculate STEM Unemployment</Button>
      {results && (
        <div className="space-y-6">
          <div className={`rounded-3xl p-8 text-center text-white shadow-2xl ${results.remaining <= 20 ? 'bg-gradient-to-br from-red-500 to-red-600' : results.remaining <= 50 ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-purple-500 to-violet-600'}`}>
            <p className="text-white/80 text-sm mb-2">Days Remaining</p><p className="text-7xl font-black mb-2">{results.remaining}</p><p className="text-white/80">of {results.max} aggregate</p>
          </div>
          <Card className="p-5"><div className="flex justify-between text-sm mb-2"><span>Used: {results.used} (Prior: {results.priorDays} + STEM: {results.stemDays})</span><span>Limit: {results.max}</span></div><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${results.remaining <= 20 ? 'bg-red-500' : results.remaining <= 50 ? 'bg-amber-500' : 'bg-purple-500'}`} style={{ width: `${(results.used / results.max) * 100}%` }} /></div></Card>
        </div>
      )}
    </div>
  );
}
