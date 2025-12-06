"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight, Zap, Mail, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toolDefinitions, parseDate, formatDateDisplay, formatDateInput, addDays, daysBetween, isoToMMDDYYYY, mmddyyyyToISO } from "@/lib/optToolsDesign";
import { DateInputField, InfoCard, ResultCard, CountdownDisplay, ProgressBar, EmailDisplay, ToolSection } from "@/components/opt-tools/ToolComponents";
import { LiveStatsWidget } from "@/components/opt-tools/LiveStatsWidget";
import { SyncStatusBar, SyncToast, SyncStatus } from "@/components/opt-tools/SyncIndicator";

// Types
type ToolId = "opt-apply" | "opt-clock" | "stem-apply" | "stem-clock";

interface OPTData {
  program_end_date: string;
  dso_recommendation_date: string;
  opt_start_date: string;
  opt_ead_end_date: string;
  stem_start_date: string;
  stem_end_date: string;
}

interface EmploymentSpan {
  id: string;
  start_date: string;
  end_date: string | null;
}

// ============================================================================
// TOOL CARD COMPONENT
// ============================================================================

interface ToolCardProps {
  tool: typeof toolDefinitions[0];
  onClick: () => void;
}

function ToolCard({ tool, onClick }: ToolCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative w-full text-left p-6 rounded-2xl
        bg-gradient-to-br ${tool.gradient}
        text-white shadow-lg hover:shadow-2xl
        transform transition-all duration-300 ease-out
        hover:scale-[1.02] hover:-translate-y-1
        focus:outline-none focus:ring-4 focus:ring-white/30
      `}
    >
      {/* Hover overlay */}
      <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <span className="text-3xl">{tool.icon}</span>
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold mb-2">{tool.title}</h3>
        
        {/* Description */}
        <p className="text-sm text-white/80 mb-4 line-clamp-2">{tool.description}</p>
        
        {/* CTA */}
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span>Open Tool</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
      
      {/* Decorative circle */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />
    </button>
  );
}

// ============================================================================
// OPT APPLY TOOL
// ============================================================================

function OptApplyTool({ optData, onUpdate, syncing, lastSynced, userEmail, onSync }: ToolProps) {
  const [local, setLocal] = useState({
    program_end_date: isoToMMDDYYYY(optData.program_end_date),
    dso_recommendation_date: isoToMMDDYYYY(optData.dso_recommendation_date),
  });
  const [results, setResults] = useState<{
    earliest: Date;
    mustArrive: Date;
    startEarliest: Date;
    startLatest: Date;
  } | null>(null);

  useEffect(() => {
    setLocal({
      program_end_date: isoToMMDDYYYY(optData.program_end_date),
      dso_recommendation_date: isoToMMDDYYYY(optData.dso_recommendation_date),
    });
  }, [optData]);

  const calculate = () => {
    const programEnd = parseDate(local.program_end_date);
    if (!programEnd) return;

    const dsoRec = parseDate(local.dso_recommendation_date);
    let mustArrive = addDays(programEnd, 60);
    if (dsoRec) {
      const dsoDeadline = addDays(dsoRec, 30);
      if (dsoDeadline < mustArrive) mustArrive = dsoDeadline;
    }

    setResults({
      earliest: addDays(programEnd, -90),
      mustArrive,
      startEarliest: programEnd,
      startLatest: addDays(programEnd, 60),
    });

    // Sync back to OPT Dates
    onUpdate({
      program_end_date: mmddyyyyToISO(local.program_end_date),
      dso_recommendation_date: mmddyyyyToISO(local.dso_recommendation_date),
    });
  };

  const daysLeft = results ? daysBetween(new Date(), results.mustArrive) : null;
  const tool = toolDefinitions.find(t => t.id === 'opt-apply')!;

  return (
    <div className="space-y-6">
      <SyncStatusBar status={syncing ? 'syncing' : 'idle'} lastSynced={lastSynced} dataSource="OPT Dates" onSync={onSync} />

      <InfoCard
        title="Post-Completion OPT Filing Rules"
        description="You can apply 90 days before your program ends, up to 60 days after. USCIS must receive your I-765 within 30 days of your DSO's recommendation."
        variant="info"
      />

      <ToolSection title="Enter Your Dates">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <DateInputField
            label="Program End Date"
            value={local.program_end_date}
            onChange={(v) => setLocal(l => ({ ...l, program_end_date: v }))}
            description="From your I-20 document"
            required
          />
          <DateInputField
            label="DSO Recommendation Date"
            value={local.dso_recommendation_date}
            onChange={(v) => setLocal(l => ({ ...l, dso_recommendation_date: v }))}
            description="When your DSO signed your I-20 (optional)"
          />
        </div>
      </ToolSection>

      <Button
        onClick={calculate}
        size="lg"
        className={`w-full h-14 text-lg rounded-xl bg-gradient-to-r ${tool.gradient} hover:opacity-90 shadow-lg transition-all`}
      >
        <Zap className="w-5 h-5 mr-2" />
        Calculate Filing Window
      </Button>

      {results && (
        <ToolSection title="Your OPT Filing Timeline">
          {daysLeft !== null && (
            <CountdownDisplay
              days={daysLeft}
              label="Days Until Deadline"
              sublabel={`Must arrive by ${formatDateDisplay(results.mustArrive)}`}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard icon="📅" label="Earliest Filing Date" value={formatDateDisplay(results.earliest)} subtext="90 days before program end" />
            <ResultCard icon="⏰" label="Must Arrive By" value={formatDateDisplay(results.mustArrive)} subtext="USCIS receipt deadline" variant={daysLeft! <= 14 ? "danger" : daysLeft! <= 30 ? "warning" : "success"} />
            <ResultCard icon="🎯" label="OPT Can Start" value={formatDateDisplay(results.startEarliest)} subtext="Your program end date" />
            <ResultCard icon="📆" label="Latest OPT Start" value={formatDateDisplay(results.startLatest)} subtext="60 days after program end" />
          </div>
        </ToolSection>
      )}

      <EmailDisplay email={userEmail} toolColor={tool.textColor} iconBgColor={tool.iconBg} />
    </div>
  );
}

// ============================================================================
// OPT CLOCK TOOL
// ============================================================================

function OptClockTool({ optData, onUpdate, syncing, lastSynced, userEmail, onSync }: ToolProps) {
  const [local, setLocal] = useState({
    opt_start_date: isoToMMDDYYYY(optData.opt_start_date),
    opt_ead_end_date: isoToMMDDYYYY(optData.opt_ead_end_date),
  });
  const [spans, setSpans] = useState<EmploymentSpan[]>([]);
  const [results, setResults] = useState<{ used: number; remaining: number; max: number } | null>(null);

  useEffect(() => {
    setLocal({
      opt_start_date: isoToMMDDYYYY(optData.opt_start_date),
      opt_ead_end_date: isoToMMDDYYYY(optData.opt_ead_end_date),
    });
  }, [optData]);

  const calculate = () => {
    const start = parseDate(local.opt_start_date);
    const end = parseDate(local.opt_ead_end_date);
    if (!start || !end) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = today < end ? today : end;
    const total = daysBetween(start, endDate);

    let employed = 0;
    spans.forEach(s => {
      const ss = parseDate(s.start_date);
      if (!ss) return;
      const se = s.end_date ? parseDate(s.end_date) : today;
      if (!se) return;
      const es = ss < start ? start : ss;
      const ee = se > endDate ? endDate : se;
      if (es <= ee) employed += daysBetween(es, ee);
    });

    const used = Math.max(0, total - employed);
    setResults({ used, remaining: Math.max(0, 90 - used), max: 90 });

    onUpdate({
      opt_start_date: mmddyyyyToISO(local.opt_start_date),
      opt_ead_end_date: mmddyyyyToISO(local.opt_ead_end_date),
    });
  };

  const tool = toolDefinitions.find(t => t.id === 'opt-clock')!;

  return (
    <div className="space-y-6">
      <SyncStatusBar status={syncing ? 'syncing' : 'idle'} lastSynced={lastSynced} dataSource="OPT Dates" onSync={onSync} />

      <InfoCard
        title="90-Day Unemployment Limit"
        description="During post-completion OPT, you cannot accumulate more than 90 days of unemployment. Track your employment periods to stay compliant."
        variant="warning"
      />

      <ToolSection title="Your OPT Period">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <DateInputField label="OPT Start Date" value={local.opt_start_date} onChange={(v) => setLocal(l => ({ ...l, opt_start_date: v }))} description="From your EAD card" required />
          <DateInputField label="OPT End Date" value={local.opt_ead_end_date} onChange={(v) => setLocal(l => ({ ...l, opt_ead_end_date: v }))} description="From your EAD card" required />
        </div>
      </ToolSection>

      <ToolSection title="Employment Periods">
        <div className="flex justify-end mb-3">
          <Button onClick={() => setSpans([...spans, { id: Date.now().toString(), start_date: '', end_date: null }])} variant="outline" size="sm" className="rounded-lg">
            <Plus className="w-4 h-4 mr-1" /> Add Job
          </Button>
        </div>
        {spans.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700">
            <p className="text-gray-500 dark:text-gray-400">No employment periods added</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your jobs to calculate unemployment days</p>
          </div>
        ) : (
          <div className="space-y-3">
            {spans.map((s, i) => (
              <div key={s.id} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Job #{i + 1}</span>
                  <button onClick={() => setSpans(spans.filter(x => x.id !== s.id))} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Start: MM/DD/YYYY" value={s.start_date} onChange={e => setSpans(spans.map(x => x.id === s.id ? { ...x, start_date: e.target.value } : x))} className="rounded-lg h-10" />
                  <Input placeholder="End (blank = current)" value={s.end_date || ''} onChange={e => setSpans(spans.map(x => x.id === s.id ? { ...x, end_date: e.target.value || null } : x))} className="rounded-lg h-10" />
                </div>
              </div>
            ))}
          </div>
        )}
      </ToolSection>

      <Button onClick={calculate} size="lg" className={`w-full h-14 text-lg rounded-xl bg-gradient-to-r ${tool.gradient} hover:opacity-90 shadow-lg`}>
        <Zap className="w-5 h-5 mr-2" /> Calculate Unemployment Days
      </Button>

      {results && (
        <ToolSection title="Your Unemployment Status">
          <CountdownDisplay days={results.remaining} label="Days Remaining" sublabel={`of ${results.max} days allowed`} />
          <ProgressBar used={results.used} max={results.max} label="Unemployment Days Used" showPercentage />
          <div className="grid grid-cols-2 gap-4">
            <ResultCard icon="⏱️" label="Days Used" value={`${results.used} days`} variant={results.used >= 80 ? "danger" : results.used >= 60 ? "warning" : "success"} />
            <ResultCard icon="✅" label="Days Remaining" value={`${results.remaining} days`} variant={results.remaining <= 10 ? "danger" : results.remaining <= 30 ? "warning" : "success"} />
          </div>
        </ToolSection>
      )}

      <EmailDisplay email={userEmail} toolColor={tool.textColor} iconBgColor={tool.iconBg} />
    </div>
  );
}

// ============================================================================
// STEM APPLY TOOL
// ============================================================================

function StemApplyTool({ optData, onUpdate, syncing, lastSynced, userEmail, onSync }: ToolProps) {
  const [local, setLocal] = useState({ opt_ead_end_date: isoToMMDDYYYY(optData.opt_ead_end_date) });
  const [results, setResults] = useState<{ earliest: Date; deadline: Date; capGap: Date } | null>(null);

  useEffect(() => {
    setLocal({ opt_ead_end_date: isoToMMDDYYYY(optData.opt_ead_end_date) });
  }, [optData]);

  const calculate = () => {
    const end = parseDate(local.opt_ead_end_date);
    if (!end) return;
    setResults({ earliest: addDays(end, -90), deadline: end, capGap: addDays(end, 180) });
    onUpdate({ opt_ead_end_date: mmddyyyyToISO(local.opt_ead_end_date) });
  };

  const daysLeft = results ? daysBetween(new Date(), results.deadline) : null;
  const tool = toolDefinitions.find(t => t.id === 'stem-apply')!;

  return (
    <div className="space-y-6">
      <SyncStatusBar status={syncing ? 'syncing' : 'idle'} lastSynced={lastSynced} dataSource="OPT Dates" onSync={onSync} />

      <InfoCard
        title="STEM OPT Extension Rules"
        description="Apply up to 90 days before your current OPT expires. If filed timely, you receive automatic 180-day cap-gap work authorization while your application is pending."
        variant="success"
      />

      <ToolSection title="Your Current OPT">
        <DateInputField label="OPT EAD End Date" value={local.opt_ead_end_date} onChange={(v) => setLocal({ opt_ead_end_date: v })} description="From your OPT Employment Authorization Document" required />
      </ToolSection>

      <Button onClick={calculate} size="lg" className={`w-full h-14 text-lg rounded-xl bg-gradient-to-r ${tool.gradient} hover:opacity-90 shadow-lg`}>
        <Zap className="w-5 h-5 mr-2" /> Calculate Filing Window
      </Button>

      {results && (
        <ToolSection title="Your STEM Filing Timeline">
          {daysLeft !== null && <CountdownDisplay days={daysLeft} label="Days Until OPT Expires" sublabel={`File before ${formatDateDisplay(results.deadline)}`} />}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ResultCard icon="📅" label="Earliest Filing" value={formatDateDisplay(results.earliest)} subtext="90 days before OPT ends" />
            <ResultCard icon="⏰" label="Filing Deadline" value={formatDateDisplay(results.deadline)} subtext="Before OPT expires" variant={daysLeft! <= 14 ? "danger" : daysLeft! <= 30 ? "warning" : "success"} />
            <ResultCard icon="🛡️" label="Cap-Gap Protection" value={formatDateDisplay(results.capGap)} subtext="If filed timely" />
          </div>
        </ToolSection>
      )}

      <EmailDisplay email={userEmail} toolColor={tool.textColor} iconBgColor={tool.iconBg} />
    </div>
  );
}

// ============================================================================
// STEM CLOCK TOOL
// ============================================================================

function StemClockTool({ optData, onUpdate, syncing, lastSynced, userEmail, onSync }: ToolProps) {
  const [local, setLocal] = useState({ stem_start_date: isoToMMDDYYYY(optData.stem_start_date) });
  const [prior, setPrior] = useState("0");
  const [spans, setSpans] = useState<EmploymentSpan[]>([]);
  const [results, setResults] = useState<{ used: number; remaining: number; max: number; priorDays: number; stemDays: number } | null>(null);

  useEffect(() => {
    setLocal({ stem_start_date: isoToMMDDYYYY(optData.stem_start_date) });
  }, [optData]);

  const calculate = () => {
    const start = parseDate(local.stem_start_date);
    if (!start) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const stemEnd = addDays(start, 730);
    const endDate = today < stemEnd ? today : stemEnd;
    const total = daysBetween(start, endDate);
    let employed = 0;
    spans.forEach(s => {
      const ss = parseDate(s.start_date);
      if (!ss) return;
      const se = s.end_date ? parseDate(s.end_date) : today;
      if (!se) return;
      const es = ss < start ? start : ss;
      const ee = se > endDate ? endDate : se;
      if (es <= ee) employed += daysBetween(es, ee);
    });
    const stemDays = Math.max(0, total - employed);
    const priorDays = parseInt(prior) || 0;
    const used = stemDays + priorDays;
    setResults({ used, remaining: Math.max(0, 150 - used), max: 150, priorDays, stemDays });
    onUpdate({ stem_start_date: mmddyyyyToISO(local.stem_start_date) });
  };

  const tool = toolDefinitions.find(t => t.id === 'stem-clock')!;

  return (
    <div className="space-y-6">
      <SyncStatusBar status={syncing ? 'syncing' : 'idle'} lastSynced={lastSynced} dataSource="OPT Dates" onSync={onSync} />

      <InfoCard
        title="150-Day Aggregate Unemployment Limit"
        description="During STEM OPT, your total unemployment (including days accumulated during initial OPT) cannot exceed 150 days aggregate."
        variant="warning"
      />

      <ToolSection title="STEM OPT Period">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <DateInputField label="STEM OPT Start Date" value={local.stem_start_date} onChange={(v) => setLocal({ stem_start_date: v })} description="From your STEM EAD card" required />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Prior OPT Unemployment Days</label>
            <p className="text-xs text-gray-500 mb-2">Days accumulated during initial OPT</p>
            <Input type="number" value={prior} onChange={e => setPrior(e.target.value)} placeholder="0" min="0" max="90" className="h-11 rounded-lg" />
          </div>
        </div>
      </ToolSection>

      <ToolSection title="STEM Employment Periods">
        <div className="flex justify-end mb-3">
          <Button onClick={() => setSpans([...spans, { id: Date.now().toString(), start_date: '', end_date: null }])} variant="outline" size="sm" className="rounded-lg">
            <Plus className="w-4 h-4 mr-1" /> Add Job
          </Button>
        </div>
        {spans.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700">
            <p className="text-gray-500">No STEM employment periods added</p>
            <p className="text-sm text-gray-400 mt-1">Add your STEM OPT jobs to calculate</p>
          </div>
        ) : (
          <div className="space-y-3">
            {spans.map((s, i) => (
              <div key={s.id} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Job #{i + 1}</span>
                  <button onClick={() => setSpans(spans.filter(x => x.id !== s.id))} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Start: MM/DD/YYYY" value={s.start_date} onChange={e => setSpans(spans.map(x => x.id === s.id ? { ...x, start_date: e.target.value } : x))} className="rounded-lg h-10" />
                  <Input placeholder="End (blank = current)" value={s.end_date || ''} onChange={e => setSpans(spans.map(x => x.id === s.id ? { ...x, end_date: e.target.value || null } : x))} className="rounded-lg h-10" />
                </div>
              </div>
            ))}
          </div>
        )}
      </ToolSection>

      <Button onClick={calculate} size="lg" className={`w-full h-14 text-lg rounded-xl bg-gradient-to-r ${tool.gradient} hover:opacity-90 shadow-lg`}>
        <Zap className="w-5 h-5 mr-2" /> Calculate Unemployment Days
      </Button>

      {results && (
        <ToolSection title="Your STEM Unemployment Status">
          <CountdownDisplay days={results.remaining} label="Days Remaining" sublabel={`of ${results.max} days (aggregate)`} />
          <ProgressBar used={results.used} max={results.max} label="Aggregate Unemployment" showPercentage />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ResultCard icon="📊" label="Prior OPT Days" value={`${results.priorDays} days`} />
            <ResultCard icon="⏱️" label="STEM Days Used" value={`${results.stemDays} days`} />
            <ResultCard icon="✅" label="Total Remaining" value={`${results.remaining} days`} variant={results.remaining <= 15 ? "danger" : results.remaining <= 50 ? "warning" : "success"} />
          </div>
        </ToolSection>
      )}

      <EmailDisplay email={userEmail} toolColor={tool.textColor} iconBgColor={tool.iconBg} />
    </div>
  );
}

// ============================================================================
// TOOL PROPS INTERFACE
// ============================================================================

interface ToolProps {
  optData: OPTData;
  onUpdate: (data: Partial<OPTData>) => void;
  syncing: boolean;
  lastSynced: Date | null;
  userEmail: string;
  onSync: () => void;
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export function OptToolsSection() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [optData, setOptData] = useState<OPTData>({
    program_end_date: '', dso_recommendation_date: '', opt_start_date: '',
    opt_ead_end_date: '', stem_start_date: '', stem_end_date: '',
  });
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [widgetCollapsed, setWidgetCollapsed] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [datesRes, emailRes] = await Promise.all([
        fetch('/api/opt/dates', { credentials: 'include' }),
        fetch('/api/user/tool-email', { credentials: 'include' })
      ]);
      if (datesRes.ok) {
        const d = await datesRes.json();
        if (d.dates) setOptData(prev => ({ ...prev, ...d.dates }));
        setLastSynced(new Date());
      }
      if (emailRes.ok) {
        const e = await emailRes.json();
        setUserEmail(e.emails?.opt_apply || e.emails?.opt_clock || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const updateData = async (updates: Partial<OPTData>) => {
    setSyncing(true);
    try {
      const newData = { ...optData, ...updates };
      const res = await fetch('/api/opt/dates', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      if (res.ok) {
        setOptData(newData);
        setLastSynced(new Date());
        setToast({ type: 'success', message: 'Data synced successfully' });
      } else {
        throw new Error('Sync failed');
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to sync data' });
    } finally {
      setSyncing(false);
    }
  };

  const manualSync = () => loadData();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading OPT Tools...</p>
        </div>
      </div>
    );
  }

  // Homepage - Tool Cards
  if (!activeTool) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">OPT Tools</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Track your OPT deadlines, monitor unemployment days, and stay compliant with USCIS regulations.
          </p>
        </div>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {toolDefinitions.map(tool => (
            <ToolCard key={tool.id} tool={tool} onClick={() => setActiveTool(tool.id as ToolId)} />
          ))}
        </div>

        {/* Toast */}
        {toast && <SyncToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // Individual Tool Interface
  const tool = toolDefinitions.find(t => t.id === activeTool)!;
  const ToolComponent = {
    'opt-apply': OptApplyTool,
    'opt-clock': OptClockTool,
    'stem-apply': StemApplyTool,
    'stem-clock': StemClockTool,
  }[activeTool];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => setActiveTool(null)}
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Tools</span>
      </button>

      {/* Tool Header */}
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg`}>
          <span className="text-2xl">{tool.icon}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tool.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{tool.description}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tool Interface */}
        <div className="lg:col-span-2">
          <Card className="p-6 rounded-2xl border-gray-200 dark:border-slate-700">
            <ToolComponent
              optData={optData}
              onUpdate={updateData}
              syncing={syncing}
              lastSynced={lastSynced}
              userEmail={userEmail}
              onSync={manualSync}
            />
          </Card>
        </div>

        {/* Live Stats Widget - Desktop */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-6">
            <LiveStatsWidget toolType={activeTool} />
          </div>
        </div>
      </div>

      {/* Live Stats Widget - Mobile */}
      <div className="lg:hidden">
        <LiveStatsWidget
          toolType={activeTool}
          collapsed={widgetCollapsed}
          onToggle={() => setWidgetCollapsed(!widgetCollapsed)}
        />
      </div>

      {/* Toast */}
      {toast && <SyncToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
