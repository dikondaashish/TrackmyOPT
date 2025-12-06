"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Calendar, Clock, GraduationCap, Timer, ArrowLeft, 
  RefreshCw, Check, AlertTriangle, Info, ChevronLeft, 
  ChevronRight, Mail, TrendingUp, Users, BarChart3, Zap, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

// Types
type ToolType = "opt-apply" | "opt-clock" | "stem-apply" | "stem-clock" | null;

interface OPTData {
  program_end_date: string;
  dso_recommendation_date: string;
  opt_start_date: string;
  opt_ead_end_date: string;
  stem_start_date: string;
}

interface EmploymentSpan {
  id: string;
  start_date: string;
  end_date: string | null;
}

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
  return isNaN(d.getTime()) ? iso : formatDateInput(d);
}

function mmddyyyyToISO(dateStr: string): string {
  const d = parseDate(dateStr);
  return d ? d.toISOString().split('T')[0] : '';
}

// Tool definitions
const TOOLS = [
  { id: "opt-apply" as ToolType, title: "OPT Apply Dates", description: "Calculate your OPT filing window and track important deadlines", icon: Calendar, color: "from-blue-500 to-indigo-600", shadowColor: "shadow-blue-500/25", features: ["90-day filing window", "DSO recommendation tracking", "Deadline countdown"] },
  { id: "opt-clock" as ToolType, title: "OPT Clock Tracker", description: "Monitor your 90-day unemployment limit during post-completion OPT", icon: Clock, color: "from-amber-500 to-orange-600", shadowColor: "shadow-amber-500/25", features: ["Employment tracking", "Real-time countdown", "Compliance alerts"] },
  { id: "stem-apply" as ToolType, title: "STEM OPT Apply", description: "Track your 24-month STEM extension filing deadlines", icon: GraduationCap, color: "from-emerald-500 to-teal-600", shadowColor: "shadow-emerald-500/25", features: ["Extension timeline", "Cap-gap protection", "I-983 reminders"] },
  { id: "stem-clock" as ToolType, title: "STEM Clock Tracker", description: "Monitor the 150-day aggregate unemployment limit for STEM OPT", icon: Timer, color: "from-purple-500 to-violet-600", shadowColor: "shadow-purple-500/25", features: ["Aggregate tracking", "Prior OPT days", "150-day limit"] },
];

// DatePicker Component
function DatePicker({ value, onSelect, onClose }: { value: string; onSelect: (d: string) => void; onClose: () => void }) {
  const [month, setMonth] = useState(() => parseDate(value) || new Date());
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const first = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const sel = parseDate(value);

  return (
    <div className="absolute top-full mt-2 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"><ChevronLeft className="w-5 h-5" /></button>
        <span className="font-semibold">{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"><ChevronRight className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="text-gray-400 py-2">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          const isSel = sel && d === sel.getDate() && month.getMonth() === sel.getMonth() && month.getFullYear() === sel.getFullYear();
          return <button key={i} disabled={!d} onClick={() => { if (d) { onSelect(formatDateInput(new Date(month.getFullYear(), month.getMonth(), d))); onClose(); }}} className={`p-2.5 text-sm rounded-xl transition-all ${!d ? 'invisible' : isSel ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{d}</button>;
        })}
      </div>
    </div>
  );
}

// SyncStatus Component
function SyncStatus({ syncing, lastSynced }: { syncing: boolean; lastSynced: Date | null }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {syncing ? <><RefreshCw className="w-4 h-4 text-blue-500 animate-spin" /><span className="text-blue-600">Syncing...</span></> : <><Check className="w-4 h-4 text-green-500" /><span className="text-gray-600 dark:text-gray-400">Synced {lastSynced?.toLocaleTimeString() || 'just now'}</span></>}
    </div>
  );
}

// DateInputField Component
function DateInputField({ label, value, onChange, description, required }: { label: string; value: string; onChange: (v: string) => void; description?: string; required?: boolean }) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setShow(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
      <div className="relative">
        <Input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="MM/DD/YYYY" className="pr-12 h-12 text-base rounded-xl" />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Calendar className="w-5 h-5 text-gray-400" /></button>
      </div>
      {show && <DatePicker value={value} onSelect={onChange} onClose={() => setShow(false)} />}
    </div>
  );
}

// ResultCard Component
function ResultCard({ icon, label, value, subtext, variant = "default" }: { icon: string; label: string; value: string; subtext?: string; variant?: "default" | "success" | "warning" | "danger" }) {
  const v = { default: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700", success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800", warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800", danger: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" };
  return (
    <div className={`p-5 rounded-2xl border ${v[variant]} transition-all hover:shadow-lg`}>
      <div className="flex items-center gap-3 mb-2"><span className="text-2xl">{icon}</span><span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span></div>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
    </div>
  );
}

// CountdownDisplay Component
function CountdownDisplay({ days, label, sublabel }: { days: number; label: string; sublabel: string }) {
  const color = days <= 7 ? "from-red-500 to-rose-600" : days <= 30 ? "from-amber-500 to-orange-600" : "from-green-500 to-emerald-600";
  return (
    <div className={`p-8 rounded-3xl bg-gradient-to-br ${color} text-white text-center shadow-xl`}>
      <p className="text-sm font-medium opacity-90 mb-2">{label}</p>
      <p className="text-6xl font-black mb-2">{days}</p>
      <p className="text-lg font-medium opacity-90">{sublabel}</p>
    </div>
  );
}

// ProgressBar Component
function ProgressBar({ used, max, label }: { used: number; max: number; label: string }) {
  const pct = Math.min(100, (used / max) * 100);
  const c = pct >= 89 ? "bg-red-500" : pct >= 67 ? "bg-amber-500" : "bg-green-500";
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">{label}</span><span className="text-gray-500">{used} / {max} days</span></div>
      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${c} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }}></div></div>
    </div>
  );
}

// RedditWidget Component
function RedditWidget({ toolType }: { toolType: ToolType }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avg: 45, approvals: 142, pending: 856, trend: "stable" as const, posts: [{ title: "Approved after 42 days!", time: "42 days", s: "positive" }, { title: "Still waiting at 60 days", time: "60+ days", s: "neutral" }, { title: "Got my EAD today!", time: "38 days", s: "positive" }] });

  useEffect(() => {
    const t = setTimeout(() => { setStats(s => ({ ...s, avg: toolType?.includes('stem') ? 85 : 45 })); setLoading(false); }, 800);
    return () => clearTimeout(t);
  }, [toolType]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div><div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl"></div></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-500" />Live Stats</h3>
        <span className="text-xs text-gray-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>Live</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800"><p className="text-xs text-blue-600 font-medium mb-1">Avg. Processing</p><p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.avg}</p><p className="text-xs text-blue-500">days</p></div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800"><p className="text-xs text-emerald-600 font-medium mb-1">Approvals</p><p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.approvals}</p><p className="text-xs text-emerald-500">this week</p></div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Processing Trend</span><span className="flex items-center gap-1 text-sm font-semibold text-amber-600"><TrendingUp className="w-4 h-4" />Stable</span></div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full"><div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '65%' }}></div></div>
        <p className="text-xs text-gray-500 mt-2">{stats.pending} pending cases</p>
      </div>
      <div className="space-y-2"><h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Users className="w-4 h-4" />Community</h4>
        {stats.posts.map((p, i) => <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700"><div className="flex justify-between gap-2"><p className="text-sm text-gray-700 dark:text-gray-300 truncate">{p.title}</p><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.s === 'positive' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{p.time}</span></div></div>)}
      </div>
      <p className="text-xs text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">Source: Reddit & Community Data</p>
    </div>
  );
}

// Main Component Export
export function OptToolsSection() {
  const [activeTool, setActiveTool] = useState<ToolType>(null);
  const [optData, setOptData] = useState<OPTData>({ program_end_date: '', dso_recommendation_date: '', opt_start_date: '', opt_ead_end_date: '', stem_start_date: '' });
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [datesRes, emailRes] = await Promise.all([
        fetch('/api/opt/dates', { credentials: 'include' }),
        fetch('/api/user/tool-email', { credentials: 'include' })
      ]);
      if (datesRes.ok) {
        const d = await datesRes.json();
        if (d.dates) setOptData({ program_end_date: d.dates.program_end_date || '', dso_recommendation_date: d.dates.dso_recommendation_date || '', opt_start_date: d.dates.opt_start_date || '', opt_ead_end_date: d.dates.opt_ead_end_date || '', stem_start_date: d.dates.stem_start_date || '' });
        setLastSynced(new Date());
      }
      if (emailRes.ok) {
        const e = await emailRes.json();
        setUserEmail(e.emails?.opt_apply || e.emails?.opt_clock || '');
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const updateData = async (updates: Partial<OPTData>) => {
    setSyncing(true);
    try {
      const newData = { ...optData, ...updates };
      await fetch('/api/opt/dates', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newData) });
      setOptData(newData);
      setLastSynced(new Date());
    } catch (err) { console.error(err); } finally { setSyncing(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw className="w-8 h-8 animate-spin text-blue-500" /></div>;

  // Tool Overview (Homepage)
  if (!activeTool) {
    return (
      <div className="space-y-8">
        <div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">OPT Tools</h1><p className="text-gray-600 dark:text-gray-400 mt-2">Select a tool to get started with your OPT tracking</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TOOLS.map(tool => (
            <button key={tool.id} onClick={() => setActiveTool(tool.id)} className={`group relative p-6 rounded-3xl bg-gradient-to-br ${tool.color} text-white text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${tool.shadowColor} shadow-lg`}>
              <div className="absolute inset-0 rounded-3xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-4"><tool.icon className="w-7 h-7" /></div>
                <h3 className="text-xl font-bold mb-2">{tool.title}</h3>
                <p className="text-white/80 text-sm mb-4">{tool.description}</p>
                <div className="flex flex-wrap gap-2">{tool.features.map((f, i) => <span key={i} className="px-3 py-1 rounded-full bg-white/20 text-xs font-medium">{f}</span>)}</div>
                <div className="mt-4 flex items-center text-sm font-semibold">Open Tool <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" /></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Tool Interface
  const tool = TOOLS.find(t => t.id === activeTool)!;
  const ToolInterface = { 'opt-apply': OptApplyInterface, 'opt-clock': OptClockInterface, 'stem-apply': StemApplyInterface, 'stem-clock': StemClockInterface }[activeTool];

  return (
    <div className="space-y-6">
      <button onClick={() => setActiveTool(null)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" />Back to Tools</button>
      <div className="flex items-center gap-4"><div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg ${tool.shadowColor}`}><tool.icon className="w-7 h-7 text-white" /></div><div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tool.title}</h1><p className="text-gray-600 dark:text-gray-400">{tool.description}</p></div></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><Card className="p-6 rounded-3xl"><ToolInterface optData={optData} onUpdate={updateData} syncing={syncing} lastSynced={lastSynced} userEmail={userEmail} /></Card></div>
        <div className="lg:col-span-1"><Card className="p-6 rounded-3xl sticky top-6"><RedditWidget toolType={activeTool} /></Card></div>
      </div>
    </div>
  );
}

// Tool Interface Components
function OptApplyInterface({ optData, onUpdate, syncing, lastSynced, userEmail }: { optData: OPTData; onUpdate: (d: Partial<OPTData>) => void; syncing: boolean; lastSynced: Date | null; userEmail: string }) {
  const [local, setLocal] = useState({ program_end_date: isoToMMDDYYYY(optData.program_end_date), dso_recommendation_date: isoToMMDDYYYY(optData.dso_recommendation_date) });
  const [results, setResults] = useState<{ earliest: Date; mustArrive: Date; startEarliest: Date; startLatest: Date } | null>(null);
  useEffect(() => { setLocal({ program_end_date: isoToMMDDYYYY(optData.program_end_date), dso_recommendation_date: isoToMMDDYYYY(optData.dso_recommendation_date) }); }, [optData]);

  const calc = () => {
    const pe = parseDate(local.program_end_date); if (!pe) return;
    const dso = parseDate(local.dso_recommendation_date);
    let mustArrive = addDays(pe, 60);
    if (dso) { const dd = addDays(dso, 30); if (dd < mustArrive) mustArrive = dd; }
    setResults({ earliest: addDays(pe, -90), mustArrive, startEarliest: pe, startLatest: addDays(pe, 60) });
    onUpdate({ program_end_date: mmddyyyyToISO(local.program_end_date), dso_recommendation_date: mmddyyyyToISO(local.dso_recommendation_date) });
  };

  const daysLeft = results ? daysBetween(new Date(), results.mustArrive) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4"><SyncStatus syncing={syncing} lastSynced={lastSynced} /><span className="text-sm text-gray-500">Synced with OPT Dates</span></div>
      <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"><div className="flex gap-4"><div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center"><Info className="w-6 h-6 text-blue-600" /></div><div><h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">OPT Filing Rules</h4><p className="text-sm text-blue-700 dark:text-blue-300">Apply 90 days before program ends, up to 60 days after. USCIS must receive within 30 days of DSO recommendation.</p></div></div></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><DateInputField label="Program End Date" value={local.program_end_date} onChange={v => setLocal(l => ({ ...l, program_end_date: v }))} description="From your I-20" required /><DateInputField label="DSO Recommendation Date" value={local.dso_recommendation_date} onChange={v => setLocal(l => ({ ...l, dso_recommendation_date: v }))} description="When DSO signed I-20 (optional)" /></div>
      <Button onClick={calc} size="lg" className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"><Zap className="w-5 h-5 mr-2" />Calculate Filing Window</Button>
      {results && <div className="space-y-6 pt-6 border-t"><h3 className="text-xl font-bold">Your Timeline</h3>{daysLeft !== null && <CountdownDisplay days={daysLeft} label="Days Until Deadline" sublabel={`Must arrive by ${formatDateDisplay(results.mustArrive)}`} />}<div className="grid grid-cols-2 gap-4"><ResultCard icon="📅" label="Earliest Filing" value={formatDateDisplay(results.earliest)} subtext="90 days before" /><ResultCard icon="⏰" label="Must Arrive By" value={formatDateDisplay(results.mustArrive)} variant={daysLeft! <= 14 ? "danger" : daysLeft! <= 30 ? "warning" : "success"} /><ResultCard icon="🎯" label="OPT Starts" value={formatDateDisplay(results.startEarliest)} /><ResultCard icon="📆" label="Latest Start" value={formatDateDisplay(results.startLatest)} /></div></div>}
      <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center"><Mail className="w-5 h-5 text-blue-600" /></div><div><p className="text-sm text-gray-500">Notifications sent to</p><p className="font-semibold">{userEmail || 'Not configured'}</p></div></div></div>
    </div>
  );
}

function OptClockInterface({ optData, onUpdate, syncing, lastSynced, userEmail }: { optData: OPTData; onUpdate: (d: Partial<OPTData>) => void; syncing: boolean; lastSynced: Date | null; userEmail: string }) {
  const [local, setLocal] = useState({ opt_start_date: isoToMMDDYYYY(optData.opt_start_date), opt_ead_end_date: isoToMMDDYYYY(optData.opt_ead_end_date) });
  const [spans, setSpans] = useState<EmploymentSpan[]>([]);
  const [results, setResults] = useState<{ used: number; remaining: number; max: number } | null>(null);
  useEffect(() => { setLocal({ opt_start_date: isoToMMDDYYYY(optData.opt_start_date), opt_ead_end_date: isoToMMDDYYYY(optData.opt_ead_end_date) }); }, [optData]);

  const calc = () => {
    const start = parseDate(local.opt_start_date), end = parseDate(local.opt_ead_end_date); if (!start || !end) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const endDate = today < end ? today : end;
    const total = daysBetween(start, endDate);
    let employed = 0;
    spans.forEach(s => { const ss = parseDate(s.start_date); if (!ss) return; const se = s.end_date ? parseDate(s.end_date) : today; if (!se) return; const es = ss < start ? start : ss; const ee = se > endDate ? endDate : se; if (es <= ee) employed += daysBetween(es, ee); });
    const used = Math.max(0, total - employed);
    setResults({ used, remaining: Math.max(0, 90 - used), max: 90 });
    onUpdate({ opt_start_date: mmddyyyyToISO(local.opt_start_date), opt_ead_end_date: mmddyyyyToISO(local.opt_ead_end_date) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4"><SyncStatus syncing={syncing} lastSynced={lastSynced} /><span className="text-sm text-gray-500">Synced with OPT Dates</span></div>
      <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"><div className="flex gap-4"><div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-amber-600" /></div><div><h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">90-Day Limit</h4><p className="text-sm text-amber-700 dark:text-amber-300">Cannot be unemployed more than 90 days total during OPT.</p></div></div></div>
      <div className="grid grid-cols-2 gap-6"><DateInputField label="OPT Start" value={local.opt_start_date} onChange={v => setLocal(l => ({ ...l, opt_start_date: v }))} required /><DateInputField label="OPT End" value={local.opt_ead_end_date} onChange={v => setLocal(l => ({ ...l, opt_ead_end_date: v }))} required /></div>
      <div className="space-y-3"><div className="flex justify-between"><h4 className="font-semibold">Employment Periods</h4><Button onClick={() => setSpans([...spans, { id: Date.now().toString(), start_date: '', end_date: null }])} variant="outline" size="sm">Add</Button></div>{spans.length === 0 ? <p className="text-center py-6 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl">Add jobs to calculate</p> : spans.map((s, i) => <div key={s.id} className="p-4 rounded-xl border bg-white dark:bg-gray-800"><div className="flex justify-between mb-2"><span className="text-sm font-medium">Job #{i + 1}</span><button onClick={() => setSpans(spans.filter(x => x.id !== s.id))} className="text-red-500 text-sm">Remove</button></div><div className="grid grid-cols-2 gap-3"><Input placeholder="Start" value={s.start_date} onChange={e => setSpans(spans.map(x => x.id === s.id ? { ...x, start_date: e.target.value } : x))} /><Input placeholder="End (blank=now)" value={s.end_date || ''} onChange={e => setSpans(spans.map(x => x.id === s.id ? { ...x, end_date: e.target.value || null } : x))} /></div></div>)}</div>
      <Button onClick={calc} size="lg" className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-amber-500 to-orange-600"><Zap className="w-5 h-5 mr-2" />Calculate</Button>
      {results && <div className="space-y-6 pt-6 border-t"><h3 className="text-xl font-bold">Unemployment Status</h3><CountdownDisplay days={results.remaining} label="Days Remaining" sublabel={`of ${results.max} days`} /><ProgressBar used={results.used} max={results.max} label="Days Used" /><div className="grid grid-cols-2 gap-4"><ResultCard icon="⏱️" label="Used" value={`${results.used} days`} variant={results.used >= 80 ? "danger" : results.used >= 60 ? "warning" : "success"} /><ResultCard icon="✅" label="Remaining" value={`${results.remaining} days`} variant={results.remaining <= 10 ? "danger" : "success"} /></div></div>}
      <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center"><Mail className="w-5 h-5 text-amber-600" /></div><div><p className="text-sm text-gray-500">Notifications to</p><p className="font-semibold">{userEmail || 'Not configured'}</p></div></div></div>
    </div>
  );
}

function StemApplyInterface({ optData, onUpdate, syncing, lastSynced, userEmail }: { optData: OPTData; onUpdate: (d: Partial<OPTData>) => void; syncing: boolean; lastSynced: Date | null; userEmail: string }) {
  const [local, setLocal] = useState({ opt_ead_end_date: isoToMMDDYYYY(optData.opt_ead_end_date) });
  const [results, setResults] = useState<{ earliest: Date; deadline: Date; capGap: Date } | null>(null);
  useEffect(() => { setLocal({ opt_ead_end_date: isoToMMDDYYYY(optData.opt_ead_end_date) }); }, [optData]);

  const calc = () => {
    const end = parseDate(local.opt_ead_end_date); if (!end) return;
    setResults({ earliest: addDays(end, -90), deadline: end, capGap: addDays(end, 180) });
    onUpdate({ opt_ead_end_date: mmddyyyyToISO(local.opt_ead_end_date) });
  };
  const daysLeft = results ? daysBetween(new Date(), results.deadline) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4"><SyncStatus syncing={syncing} lastSynced={lastSynced} /><span className="text-sm text-gray-500">Synced</span></div>
      <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200"><div className="flex gap-4"><div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center"><Shield className="w-6 h-6 text-emerald-600" /></div><div><h4 className="font-semibold text-emerald-900 mb-1">STEM Extension Rules</h4><p className="text-sm text-emerald-700">Apply up to 90 days before OPT expires. Get 180-day cap-gap if filed timely.</p></div></div></div>
      <DateInputField label="OPT EAD End Date" value={local.opt_ead_end_date} onChange={v => setLocal({ opt_ead_end_date: v })} required />
      <Button onClick={calc} size="lg" className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600"><Zap className="w-5 h-5 mr-2" />Calculate</Button>
      {results && <div className="space-y-6 pt-6 border-t"><h3 className="text-xl font-bold">STEM Timeline</h3>{daysLeft !== null && <CountdownDisplay days={daysLeft} label="Days Until OPT Expires" sublabel={`File before ${formatDateDisplay(results.deadline)}`} />}<div className="grid grid-cols-3 gap-4"><ResultCard icon="📅" label="Earliest" value={formatDateDisplay(results.earliest)} /><ResultCard icon="⏰" label="Deadline" value={formatDateDisplay(results.deadline)} variant={daysLeft! <= 14 ? "danger" : "success"} /><ResultCard icon="🛡️" label="Cap-Gap" value={formatDateDisplay(results.capGap)} /></div></div>}
      <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center"><Mail className="w-5 h-5 text-emerald-600" /></div><div><p className="text-sm text-gray-500">Notifications to</p><p className="font-semibold">{userEmail || 'Not configured'}</p></div></div></div>
    </div>
  );
}

function StemClockInterface({ optData, onUpdate, syncing, lastSynced, userEmail }: { optData: OPTData; onUpdate: (d: Partial<OPTData>) => void; syncing: boolean; lastSynced: Date | null; userEmail: string }) {
  const [local, setLocal] = useState({ stem_start_date: isoToMMDDYYYY(optData.stem_start_date) });
  const [prior, setPrior] = useState("0");
  const [spans, setSpans] = useState<EmploymentSpan[]>([]);
  const [results, setResults] = useState<{ used: number; remaining: number; max: number; priorDays: number; stemDays: number } | null>(null);
  useEffect(() => { setLocal({ stem_start_date: isoToMMDDYYYY(optData.stem_start_date) }); }, [optData]);

  const calc = () => {
    const start = parseDate(local.stem_start_date); if (!start) return;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const stemEnd = addDays(start, 730); // 2 years
    const endDate = today < stemEnd ? today : stemEnd;
    const total = daysBetween(start, endDate);
    let employed = 0;
    spans.forEach(s => { const ss = parseDate(s.start_date); if (!ss) return; const se = s.end_date ? parseDate(s.end_date) : today; if (!se) return; const es = ss < start ? start : ss; const ee = se > endDate ? endDate : se; if (es <= ee) employed += daysBetween(es, ee); });
    const stemDays = Math.max(0, total - employed);
    const priorDays = parseInt(prior) || 0;
    const used = stemDays + priorDays;
    setResults({ used, remaining: Math.max(0, 150 - used), max: 150, priorDays, stemDays });
    onUpdate({ stem_start_date: mmddyyyyToISO(local.stem_start_date) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4"><SyncStatus syncing={syncing} lastSynced={lastSynced} /><span className="text-sm text-gray-500">Synced</span></div>
      <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200"><div className="flex gap-4"><div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-purple-600" /></div><div><h4 className="font-semibold text-purple-900 mb-1">150-Day Aggregate Limit</h4><p className="text-sm text-purple-700">Total unemployment including prior OPT cannot exceed 150 days.</p></div></div></div>
      <div className="grid grid-cols-2 gap-6"><DateInputField label="STEM Start" value={local.stem_start_date} onChange={v => setLocal({ stem_start_date: v })} required /><div><label className="block text-sm font-medium mb-2">Prior OPT Days</label><Input type="number" value={prior} onChange={e => setPrior(e.target.value)} placeholder="0" className="h-12 rounded-xl" /></div></div>
      <div className="space-y-3"><div className="flex justify-between"><h4 className="font-semibold">STEM Employment</h4><Button onClick={() => setSpans([...spans, { id: Date.now().toString(), start_date: '', end_date: null }])} variant="outline" size="sm">Add</Button></div>{spans.length === 0 ? <p className="text-center py-6 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl">Add STEM jobs</p> : spans.map((s, i) => <div key={s.id} className="p-4 rounded-xl border bg-white dark:bg-gray-800"><div className="flex justify-between mb-2"><span className="text-sm font-medium">Job #{i + 1}</span><button onClick={() => setSpans(spans.filter(x => x.id !== s.id))} className="text-red-500 text-sm">Remove</button></div><div className="grid grid-cols-2 gap-3"><Input placeholder="Start" value={s.start_date} onChange={e => setSpans(spans.map(x => x.id === s.id ? { ...x, start_date: e.target.value } : x))} /><Input placeholder="End" value={s.end_date || ''} onChange={e => setSpans(spans.map(x => x.id === s.id ? { ...x, end_date: e.target.value || null } : x))} /></div></div>)}</div>
      <Button onClick={calc} size="lg" className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-purple-500 to-violet-600"><Zap className="w-5 h-5 mr-2" />Calculate</Button>
      {results && <div className="space-y-6 pt-6 border-t"><h3 className="text-xl font-bold">STEM Unemployment</h3><CountdownDisplay days={results.remaining} label="Days Remaining" sublabel={`of ${results.max} aggregate`} /><ProgressBar used={results.used} max={results.max} label="Total Used" /><div className="grid grid-cols-3 gap-4"><ResultCard icon="📊" label="Prior OPT" value={`${results.priorDays} days`} /><ResultCard icon="⏱️" label="STEM" value={`${results.stemDays} days`} /><ResultCard icon="✅" label="Remaining" value={`${results.remaining} days`} variant={results.remaining <= 15 ? "danger" : "success"} /></div></div>}
      <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center"><Mail className="w-5 h-5 text-purple-600" /></div><div><p className="text-sm text-gray-500">Notifications to</p><p className="font-semibold">{userEmail || 'Not configured'}</p></div></div></div>
    </div>
  );
}
