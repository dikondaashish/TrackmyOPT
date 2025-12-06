"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertTriangle, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Date utilities
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0]) - 1;
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    if (!isNaN(month) && !isNaN(day) && !isNaN(year)) return new Date(year, month, day);
  }
  return null;
}

function formatDateInput(date: Date): string {
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
}

function daysBetween(date1: Date, date2: Date): number {
  return Math.ceil((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
}

// DatePicker component
function DatePicker({ value, onSelect }: { value: string; onSelect: (date: string) => void }) {
  const [currentMonth, setCurrentMonth] = useState(() => parseDate(value) || new Date());
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const days: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const selected = parseDate(value);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border p-4 w-72">
      <div className="flex justify-between mb-4">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
        <span className="font-semibold">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="text-gray-500 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <button key={i} disabled={!day} onClick={() => day && onSelect(formatDateInput(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)))}
            className={`p-2 text-sm rounded-lg ${!day ? 'invisible' : selected?.getDate() === day && selected?.getMonth() === currentMonth.getMonth() ? 'bg-amber-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

// DateInput component  
function DateInput({ label, value, onChange, description }: { label: string; value: string; onChange: (v: string) => void; description?: string }) {
  const [showCal, setShowCal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setShowCal(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
      <div className="relative">
        <Input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="MM/DD/YYYY" className="pr-12" />
        <button type="button" onClick={() => setShowCal(!showCal)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <CalendarIcon className="w-5 h-5 text-gray-500" />
        </button>
        {showCal && <div ref={ref} className="absolute top-full mt-2 z-50 right-0"><DatePicker value={value} onSelect={(d) => { onChange(d); setShowCal(false); }} /></div>}
      </div>
    </div>
  );
}

interface EmploymentSpan {
  id: string;
  start_date: string;
  end_date: string | null;
}

export function OptClockTool() {
  const [optStartDate, setOptStartDate] = useState("");
  const [optEndDate, setOptEndDate] = useState("");
  const [employmentSpans, setEmploymentSpans] = useState<EmploymentSpan[]>([]);
  const [results, setResults] = useState<{ used: number; remaining: number; max: number } | null>(null);

  // Load saved dates from API (syncs with OPT Dates page)
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/opt/calculator', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.data) {
            if (data.data.opt_start_date) setOptStartDate(data.data.opt_start_date);
            if (data.data.opt_ead_end_date) setOptEndDate(data.data.opt_ead_end_date);
          }
        }
      } catch {}
    };
    loadData();
  }, []);

  const addSpan = () => setEmploymentSpans([...employmentSpans, { id: Date.now().toString(), start_date: "", end_date: null }]);
  const updateSpan = (id: string, field: "start_date" | "end_date", value: string) => {
    setEmploymentSpans(spans => spans.map(s => s.id === id ? { ...s, [field]: value || null } : s));
  };
  const removeSpan = (id: string) => setEmploymentSpans(spans => spans.filter(s => s.id !== id));

  const calculate = () => {
    const optStart = parseDate(optStartDate);
    const optEnd = parseDate(optEndDate);
    if (!optStart || !optEnd) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = today < optEnd ? today : optEnd;
    const totalDays = daysBetween(optStart, endDate);
    
    let employedDays = 0;
    for (const span of employmentSpans) {
      const spanStart = parseDate(span.start_date);
      if (!spanStart) continue;
      const spanEnd = span.end_date ? parseDate(span.end_date) : today;
      if (!spanEnd) continue;
      const effectiveStart = spanStart < optStart ? optStart : spanStart;
      const effectiveEnd = spanEnd > endDate ? endDate : spanEnd;
      if (effectiveStart <= effectiveEnd) employedDays += daysBetween(effectiveStart, effectiveEnd);
    }
    
    const used = Math.max(0, totalDays - employedDays);
    const max = 90;
    setResults({ used, remaining: Math.max(0, max - used), max });
  };

  const getStatusColor = (used: number, max: number) => {
    if (used >= max * 0.89) return "red";
    if (used >= max * 0.67) return "amber";
    return "green";
  };

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-100">90-Day Unemployment Limit</p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              During post-completion OPT, you cannot be unemployed for more than 90 days total. Track your employment to stay compliant.
            </p>
          </div>
        </div>
      </div>

      {/* OPT Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DateInput label="OPT Start Date" value={optStartDate} onChange={setOptStartDate} description="From your EAD card" />
        <DateInput label="OPT End Date" value={optEndDate} onChange={setOptEndDate} description="From your EAD card" />
      </div>

      {/* Employment Spans */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 dark:text-white">Employment Periods</h4>
          <Button onClick={addSpan} variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" /> Add Job</Button>
        </div>
        
        {employmentSpans.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            No jobs added yet. Add your employment periods to calculate unemployment days.
          </p>
        ) : (
          employmentSpans.map((span, idx) => (
            <div key={span.id} className="p-4 rounded-xl border bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-sm">Job #{idx + 1}</span>
                <button onClick={() => removeSpan(span.id)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                  <Input type="text" value={span.start_date} onChange={(e) => updateSpan(span.id, "start_date", e.target.value)} placeholder="MM/DD/YYYY" className="text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">End Date (blank = current)</label>
                  <Input type="text" value={span.end_date || ""} onChange={(e) => updateSpan(span.id, "end_date", e.target.value)} placeholder="MM/DD/YYYY" className="text-sm" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Button onClick={calculate} className="w-full" size="lg">Calculate Unemployment Days</Button>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className={`p-6 rounded-xl text-center ${getStatusColor(results.used, results.max) === "red" ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500' : getStatusColor(results.used, results.max) === "amber" ? 'bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-500' : 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'}`}>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Days Remaining</p>
            <p className="text-5xl font-bold">{results.remaining}</p>
            <p className="text-sm text-gray-500 mt-2">of {results.max} days</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Used: {results.used} days</span>
              <span className="text-gray-600 dark:text-gray-400">Limit: {results.max} days</span>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full transition-all ${getStatusColor(results.used, results.max) === "red" ? "bg-red-500" : getStatusColor(results.used, results.max) === "amber" ? "bg-amber-500" : "bg-green-500"}`}
                style={{ width: `${Math.min(100, (results.used / results.max) * 100)}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
