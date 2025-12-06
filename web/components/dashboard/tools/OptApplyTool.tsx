"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info } from "lucide-react";
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
    if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  return null;
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateInput(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}/${date.getFullYear()}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
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
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold">{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="text-gray-500 py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <button key={i} disabled={!day} onClick={() => day && onSelect(formatDateInput(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)))}
            className={`p-2 text-sm rounded-lg ${!day ? 'invisible' : selected?.getDate() === day && selected?.getMonth() === currentMonth.getMonth() && selected?.getFullYear() === currentMonth.getFullYear() ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
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

export function OptApplyTool() {
  const [programEndDate, setProgramEndDate] = useState("");
  const [dsoRecommendationDate, setDsoRecommendationDate] = useState("");
  const [results, setResults] = useState<{ earliestFile: Date; mustArriveBy: Date; optStartEarliest: Date; optStartLatest: Date } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved dates from API (syncs with OPT Dates page)
  useEffect(() => {
    const loadDates = async () => {
      try {
        const res = await fetch('/api/opt/calculator', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.data) {
            if (data.data.program_end_date) setProgramEndDate(data.data.program_end_date);
            if (data.data.dso_recommendation_date) setDsoRecommendationDate(data.data.dso_recommendation_date);
          }
        }
      } catch {}
    };
    loadDates();
  }, []);

  // Save dates to API (syncs with OPT Dates page)
  const saveDates = async () => {
    try {
      setIsSaving(true);
      await fetch('/api/opt/calculator', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program_end_date: programEndDate || null,
          dso_recommendation_date: dsoRecommendationDate || null,
        }),
      });
    } catch {} finally {
      setIsSaving(false);
    }
  };

  const calculate = () => {
    const programEnd = parseDate(programEndDate);
    if (!programEnd) return;
    const dsoRec = parseDate(dsoRecommendationDate);
    
    const earliestFile = addDays(programEnd, -90);
    let mustArriveBy = addDays(programEnd, 60);
    if (dsoRec) {
      const dsoDeadline = addDays(dsoRec, 30);
      if (dsoDeadline < mustArriveBy) mustArriveBy = dsoDeadline;
    }
    const optStartEarliest = programEnd;
    const optStartLatest = addDays(programEnd, 60);

    setResults({ earliestFile, mustArriveBy, optStartEarliest, optStartLatest });
    saveDates(); // Auto-save when calculating
  };

  const today = new Date();
  const daysLeft = results ? daysBetween(today, results.mustArriveBy) : null;

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-100">Post-Completion OPT Filing Rules</p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              You can apply 90 days before your program ends, up to 60 days after. USCIS must receive your I-765 within 30 days of your DSO's recommendation.
            </p>
          </div>
        </div>
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DateInput label="Program End Date" value={programEndDate} onChange={setProgramEndDate} description="From your I-20" />
        <DateInput label="DSO Recommendation Date" value={dsoRecommendationDate} onChange={setDsoRecommendationDate} description="Optional - When DSO signed your I-20" />
      </div>

      <Button onClick={calculate} className="w-full" size="lg">Calculate Filing Window</Button>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          {/* Countdown */}
          <div className={`p-6 rounded-xl text-center ${daysLeft && daysLeft <= 7 ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500' : daysLeft && daysLeft <= 30 ? 'bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-500' : 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'}`}>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Days Until Deadline</p>
            <p className="text-5xl font-bold">{daysLeft}</p>
            <p className="text-sm text-gray-500 mt-2">Must arrive by {formatDateDisplay(results.mustArriveBy)}</p>
          </div>

          {/* Result cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border">
              <p className="text-sm text-gray-500 mb-1">📅 Earliest File Date</p>
              <p className="font-bold">{formatDateDisplay(results.earliestFile)}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border">
              <p className="text-sm text-gray-500 mb-1">⏰ Must Arrive By</p>
              <p className="font-bold">{formatDateDisplay(results.mustArriveBy)}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border">
              <p className="text-sm text-gray-500 mb-1">🎯 OPT Can Start</p>
              <p className="font-bold">{formatDateDisplay(results.optStartEarliest)}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border">
              <p className="text-sm text-gray-500 mb-1">📆 Latest OPT Start</p>
              <p className="font-bold">{formatDateDisplay(results.optStartLatest)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
