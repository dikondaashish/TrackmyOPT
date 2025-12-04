"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info, AlertTriangle, CheckCircle2, Clock, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ============================================================================
// TYPES
// ============================================================================

interface EmploymentSpan {
  id: string;
  start_date: string;
  end_date: string | null;
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Handle MM/DD/YYYY format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0]) - 1;
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  
  // Handle YYYY-MM-DD format
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }
  
  return null;
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

function formatDateInput(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function daysBetween(date1: Date, date2: Date): number {
  const diffTime = date2.getTime() - date1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// ============================================================================
// DATE PICKER COMPONENT
// ============================================================================

function DatePicker({ value, onSelect }: { value: string; onSelect: (date: string) => void }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const parsed = parseDate(value);
    return parsed || new Date();
  });

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const selectedDate = parseDate(value);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-72">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-gray-500 font-medium py-1">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <button
            key={i}
            disabled={!day}
            onClick={() => {
              if (day) {
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                onSelect(formatDateInput(date));
              }
            }}
            className={`p-2 text-sm rounded-lg transition-colors ${
              !day ? 'invisible' : 
              selectedDate && 
              selectedDate.getDate() === day && 
              selectedDate.getMonth() === currentMonth.getMonth() && 
              selectedDate.getFullYear() === currentMonth.getFullYear()
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// DATE INPUT COMPONENT
// ============================================================================

function DateInput({ 
  label, 
  value, 
  onChange, 
  placeholder = "MM/DD/YYYY",
  description,
  color = "blue"
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  color?: "blue" | "green" | "amber" | "purple";
}) {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-emerald-600",
    amber: "from-amber-500 to-orange-500",
    purple: "from-purple-500 to-violet-600"
  };

  return (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white`}>
      <div className="flex items-center gap-2 mb-2">
        <CalendarIcon className="w-5 h-5" />
        <span className="font-semibold">{label}</span>
      </div>
      {description && (
        <p className="text-sm opacity-80 mb-3">{description}</p>
      )}
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-white/20 border-white/30 text-white placeholder:text-white/60 pr-12"
        />
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <CalendarIcon className="w-5 h-5" />
        </button>
        {showCalendar && (
          <div ref={calendarRef} className="absolute top-full mt-2 z-50 right-0">
            <DatePicker 
              value={value} 
              onSelect={(date) => {
                onChange(date);
                setShowCalendar(false);
              }} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// RESULT CARD COMPONENT
// ============================================================================

function ResultCard({ 
  icon, 
  label, 
  value, 
  subtext,
  status
}: { 
  icon: string; 
  label: string; 
  value: string;
  subtext?: string;
  status?: "ok" | "warning" | "critical";
}) {
  const statusColors = {
    ok: "border-green-500 bg-green-50 dark:bg-green-900/20",
    warning: "border-amber-500 bg-amber-50 dark:bg-amber-900/20",
    critical: "border-red-500 bg-red-50 dark:bg-red-900/20"
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${status ? statusColors[status] : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      {subtext && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>}
    </div>
  );
}

// ============================================================================
// OPT APPLY DATES TOOL
// ============================================================================

function OptApplyTool() {
  const [programEndDate, setProgramEndDate] = useState("");
  const [dsoRecommendationDate, setDsoRecommendationDate] = useState("");
  const [results, setResults] = useState<{
    earliestFile: Date;
    mustArriveBy: Date;
    optStartEarliest: Date;
    optStartLatest: Date;
  } | null>(null);

  const calculate = () => {
    const programEnd = parseDate(programEndDate);
    if (!programEnd) return;

    const dsoRec = parseDate(dsoRecommendationDate);
    
    // Earliest file date: 90 days before program end
    const earliestFile = addDays(programEnd, -90);
    
    // Must arrive by: min(program_end + 60 days, dso_rec + 30 days)
    let mustArriveBy = addDays(programEnd, 60);
    if (dsoRec) {
      const dsoDeadline = addDays(dsoRec, 30);
      if (dsoDeadline < mustArriveBy) {
        mustArriveBy = dsoDeadline;
      }
    }
    
    // OPT start window
    const optStartEarliest = programEnd;
    const optStartLatest = addDays(programEnd, 60);

    setResults({ earliestFile, mustArriveBy, optStartEarliest, optStartLatest });
  };

  const today = new Date();
  const daysUntilDeadline = results ? daysBetween(today, results.mustArriveBy) : null;

  return (
    <div className="space-y-4">
      {/* Info Card */}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput
          label="Program End Date"
          value={programEndDate}
          onChange={setProgramEndDate}
          description="From your I-20"
          color="blue"
        />
        <DateInput
          label="DSO Recommendation Date"
          value={dsoRecommendationDate}
          onChange={setDsoRecommendationDate}
          description="Optional - When DSO signed your I-20"
          color="green"
        />
      </div>

      {/* Calculate Button */}
      <Button onClick={calculate} className="w-full" size="lg">
        Calculate Filing Window
      </Button>

      {/* Results */}
      {results && (
        <div className="space-y-4 mt-6">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Your OPT Filing Timeline</h3>
          
          {/* Countdown */}
          {daysUntilDeadline !== null && (
            <div className={`p-6 rounded-xl text-center ${
              daysUntilDeadline <= 7 ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500' :
              daysUntilDeadline <= 30 ? 'bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-500' :
              'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
            }`}>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Days Until Deadline</p>
              <p className="text-5xl font-bold">{daysUntilDeadline}</p>
              <p className="text-sm text-gray-500 mt-2">Must arrive by {formatDateDisplay(results.mustArriveBy)}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard
              icon="📅"
              label="Earliest You Can File"
              value={formatDateDisplay(results.earliestFile)}
              subtext="90 days before program end"
            />
            <ResultCard
              icon="⏰"
              label="Must Arrive By"
              value={formatDateDisplay(results.mustArriveBy)}
              subtext="USCIS receipt deadline"
              status={daysUntilDeadline && daysUntilDeadline <= 14 ? "critical" : daysUntilDeadline && daysUntilDeadline <= 30 ? "warning" : "ok"}
            />
            <ResultCard
              icon="🎯"
              label="OPT Can Start"
              value={formatDateDisplay(results.optStartEarliest)}
              subtext="Your program end date"
            />
            <ResultCard
              icon="📆"
              label="Latest OPT Start"
              value={formatDateDisplay(results.optStartLatest)}
              subtext="60 days after program end"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// OPT CLOCK TRACKER TOOL
// ============================================================================

function OptClockTool() {
  const [optStartDate, setOptStartDate] = useState("");
  const [optEndDate, setOptEndDate] = useState("");
  const [employmentSpans, setEmploymentSpans] = useState<EmploymentSpan[]>([]);
  const [results, setResults] = useState<{
    used: number;
    remaining: number;
    max: number;
  } | null>(null);

  const addEmploymentSpan = () => {
    setEmploymentSpans([...employmentSpans, {
      id: Date.now().toString(),
      start_date: "",
      end_date: null
    }]);
  };

  const updateSpan = (id: string, field: "start_date" | "end_date", value: string) => {
    setEmploymentSpans(spans => spans.map(span => 
      span.id === id ? { ...span, [field]: value || null } : span
    ));
  };

  const removeSpan = (id: string) => {
    setEmploymentSpans(spans => spans.filter(span => span.id !== id));
  };

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
      
      if (effectiveStart <= effectiveEnd) {
        employedDays += daysBetween(effectiveStart, effectiveEnd);
      }
    }
    
    const used = Math.max(0, totalDays - employedDays);
    const max = 90;
    const remaining = Math.max(0, max - used);

    setResults({ used, remaining, max });
  };

  const getStatus = (used: number, max: number): "ok" | "warning" | "critical" => {
    if (used >= max * 0.89) return "critical";
    if (used >= max * 0.67) return "warning";
    return "ok";
  };

  return (
    <div className="space-y-4">
      {/* Info Card */}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput
          label="OPT Start Date"
          value={optStartDate}
          onChange={setOptStartDate}
          description="From your EAD card"
          color="amber"
        />
        <DateInput
          label="OPT End Date"
          value={optEndDate}
          onChange={setOptEndDate}
          description="From your EAD card"
          color="amber"
        />
      </div>

      {/* Employment Spans */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 dark:text-white">Employment Periods</h4>
          <Button onClick={addEmploymentSpan} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add Period
          </Button>
        </div>
        
        {employmentSpans.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No employment periods added. Add your jobs to calculate unemployment days.
          </p>
        ) : (
          employmentSpans.map((span, index) => (
            <div key={span.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-sm">Job #{index + 1}</span>
                <button
                  onClick={() => removeSpan(span.id)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                  <Input
                    type="text"
                    value={span.start_date}
                    onChange={(e) => updateSpan(span.id, "start_date", e.target.value)}
                    placeholder="MM/DD/YYYY"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">End Date (blank = current)</label>
                  <Input
                    type="text"
                    value={span.end_date || ""}
                    onChange={(e) => updateSpan(span.id, "end_date", e.target.value)}
                    placeholder="MM/DD/YYYY"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Calculate Button */}
      <Button onClick={calculate} className="w-full" size="lg">
        Calculate Unemployment Days
      </Button>

      {/* Results */}
      {results && (
        <div className="space-y-4 mt-6">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Your Unemployment Status</h3>
          
          {/* Main Counter */}
          <div className={`p-6 rounded-xl text-center ${
            results.remaining <= 10 ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500' :
            results.remaining <= 30 ? 'bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-500' :
            'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
          }`}>
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
              <div 
                className={`h-full transition-all ${
                  getStatus(results.used, results.max) === "critical" ? "bg-red-500" :
                  getStatus(results.used, results.max) === "warning" ? "bg-amber-500" :
                  "bg-green-500"
                }`}
                style={{ width: `${Math.min(100, (results.used / results.max) * 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ResultCard
              icon="⏱️"
              label="Days Used"
              value={`${results.used} days`}
              status={getStatus(results.used, results.max)}
            />
            <ResultCard
              icon="✅"
              label="Days Remaining"
              value={`${results.remaining} days`}
              status={results.remaining <= 10 ? "critical" : results.remaining <= 30 ? "warning" : "ok"}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STEM APPLY DATES TOOL
// ============================================================================

function StemApplyTool() {
  const [optEndDate, setOptEndDate] = useState("");
  const [results, setResults] = useState<{
    earliestFile: Date;
    deadline: Date;
    capGapEnd: Date;
  } | null>(null);

  const calculate = () => {
    const optEnd = parseDate(optEndDate);
    if (!optEnd) return;

    // Earliest file: 90 days before OPT ends
    const earliestFile = addDays(optEnd, -90);
    
    // Deadline: OPT end date (must file before it expires)
    const deadline = optEnd;
    
    // Cap-gap protection: 180 days after OPT end if timely filed
    const capGapEnd = addDays(optEnd, 180);

    setResults({ earliestFile, deadline, capGapEnd });
  };

  const today = new Date();
  const daysUntilDeadline = results ? daysBetween(today, results.deadline) : null;

  return (
    <div className="space-y-4">
      {/* Info Card */}
      <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900 dark:text-green-100">STEM OPT Extension Rules</p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Apply up to 90 days before your current OPT expires. If filed timely, you get automatic 180-day cap-gap work authorization while your application is pending.
            </p>
          </div>
        </div>
      </div>

      {/* Date Input */}
      <DateInput
        label="Current OPT EAD End Date"
        value={optEndDate}
        onChange={setOptEndDate}
        description="From your OPT Employment Authorization Document"
        color="green"
      />

      {/* Calculate Button */}
      <Button onClick={calculate} className="w-full" size="lg">
        Calculate Filing Window
      </Button>

      {/* Results */}
      {results && (
        <div className="space-y-4 mt-6">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Your STEM OPT Filing Timeline</h3>
          
          {/* Countdown */}
          {daysUntilDeadline !== null && (
            <div className={`p-6 rounded-xl text-center ${
              daysUntilDeadline <= 7 ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500' :
              daysUntilDeadline <= 30 ? 'bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-500' :
              'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
            }`}>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Days Until OPT Expires</p>
              <p className="text-5xl font-bold">{daysUntilDeadline}</p>
              <p className="text-sm text-gray-500 mt-2">Must file before {formatDateDisplay(results.deadline)}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResultCard
              icon="📅"
              label="Earliest You Can File"
              value={formatDateDisplay(results.earliestFile)}
              subtext="90 days before OPT ends"
            />
            <ResultCard
              icon="⏰"
              label="Filing Deadline"
              value={formatDateDisplay(results.deadline)}
              subtext="Before OPT expires"
              status={daysUntilDeadline && daysUntilDeadline <= 14 ? "critical" : daysUntilDeadline && daysUntilDeadline <= 30 ? "warning" : "ok"}
            />
            <ResultCard
              icon="🛡️"
              label="Cap-Gap Protection Until"
              value={formatDateDisplay(results.capGapEnd)}
              subtext="If filed timely"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STEM CLOCK TRACKER TOOL
// ============================================================================

function StemClockTool() {
  const [stemStartDate, setStemStartDate] = useState("");
  const [stemEndDate, setStemEndDate] = useState("");
  const [priorUnemployment, setPriorUnemployment] = useState("");
  const [employmentSpans, setEmploymentSpans] = useState<EmploymentSpan[]>([]);
  const [results, setResults] = useState<{
    used: number;
    remaining: number;
    max: number;
    priorDays: number;
    stemDays: number;
  } | null>(null);

  const addEmploymentSpan = () => {
    setEmploymentSpans([...employmentSpans, {
      id: Date.now().toString(),
      start_date: "",
      end_date: null
    }]);
  };

  const updateSpan = (id: string, field: "start_date" | "end_date", value: string) => {
    setEmploymentSpans(spans => spans.map(span => 
      span.id === id ? { ...span, [field]: value || null } : span
    ));
  };

  const removeSpan = (id: string) => {
    setEmploymentSpans(spans => spans.filter(span => span.id !== id));
  };

  const calculate = () => {
    const stemStart = parseDate(stemStartDate);
    const stemEnd = parseDate(stemEndDate);
    if (!stemStart || !stemEnd) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endDate = today < stemEnd ? today : stemEnd;
    const totalDays = daysBetween(stemStart, endDate);
    
    let employedDays = 0;
    for (const span of employmentSpans) {
      const spanStart = parseDate(span.start_date);
      if (!spanStart) continue;
      
      const spanEnd = span.end_date ? parseDate(span.end_date) : today;
      if (!spanEnd) continue;
      
      const effectiveStart = spanStart < stemStart ? stemStart : spanStart;
      const effectiveEnd = spanEnd > endDate ? endDate : spanEnd;
      
      if (effectiveStart <= effectiveEnd) {
        employedDays += daysBetween(effectiveStart, effectiveEnd);
      }
    }
    
    const stemUnemployed = Math.max(0, totalDays - employedDays);
    const priorDays = parseInt(priorUnemployment) || 0;
    const used = stemUnemployed + priorDays;
    const max = 150; // STEM OPT aggregate limit
    const remaining = Math.max(0, max - used);

    setResults({ used, remaining, max, priorDays, stemDays: stemUnemployed });
  };

  const getStatus = (used: number, max: number): "ok" | "warning" | "critical" => {
    if (used >= max * 0.89) return "critical";
    if (used >= max * 0.67) return "warning";
    return "ok";
  };

  return (
    <div className="space-y-4">
      {/* Info Card */}
      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-purple-900 dark:text-purple-100">150-Day Aggregate Limit</p>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
              During STEM OPT, your total unemployment (including prior OPT unemployment) cannot exceed 150 days aggregate.
            </p>
          </div>
        </div>
      </div>

      {/* STEM Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateInput
          label="STEM OPT Start Date"
          value={stemStartDate}
          onChange={setStemStartDate}
          description="From your STEM EAD card"
          color="purple"
        />
        <DateInput
          label="STEM OPT End Date"
          value={stemEndDate}
          onChange={setStemEndDate}
          description="From your STEM EAD card"
          color="purple"
        />
      </div>

      {/* Prior Unemployment */}
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <label className="font-semibold text-gray-900 dark:text-white block mb-2">
          Prior OPT Unemployment Days
        </label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Enter the number of unemployment days you accumulated during your initial OPT period
        </p>
        <Input
          type="number"
          value={priorUnemployment}
          onChange={(e) => setPriorUnemployment(e.target.value)}
          placeholder="0"
          min="0"
          max="90"
        />
      </div>

      {/* Employment Spans */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900 dark:text-white">STEM Employment Periods</h4>
          <Button onClick={addEmploymentSpan} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add Period
          </Button>
        </div>
        
        {employmentSpans.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No employment periods added. Add your STEM OPT jobs to calculate unemployment days.
          </p>
        ) : (
          employmentSpans.map((span, index) => (
            <div key={span.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-sm">Job #{index + 1}</span>
                <button
                  onClick={() => removeSpan(span.id)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
                  <Input
                    type="text"
                    value={span.start_date}
                    onChange={(e) => updateSpan(span.id, "start_date", e.target.value)}
                    placeholder="MM/DD/YYYY"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">End Date (blank = current)</label>
                  <Input
                    type="text"
                    value={span.end_date || ""}
                    onChange={(e) => updateSpan(span.id, "end_date", e.target.value)}
                    placeholder="MM/DD/YYYY"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Calculate Button */}
      <Button onClick={calculate} className="w-full" size="lg">
        Calculate Unemployment Days
      </Button>

      {/* Results */}
      {results && (
        <div className="space-y-4 mt-6">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Your STEM Unemployment Status</h3>
          
          {/* Main Counter */}
          <div className={`p-6 rounded-xl text-center ${
            results.remaining <= 15 ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500' :
            results.remaining <= 50 ? 'bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-500' :
            'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
          }`}>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Days Remaining</p>
            <p className="text-5xl font-bold">{results.remaining}</p>
            <p className="text-sm text-gray-500 mt-2">of {results.max} days (aggregate)</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Used: {results.used} days</span>
              <span className="text-gray-600 dark:text-gray-400">Limit: {results.max} days</span>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  getStatus(results.used, results.max) === "critical" ? "bg-red-500" :
                  getStatus(results.used, results.max) === "warning" ? "bg-amber-500" :
                  "bg-green-500"
                }`}
                style={{ width: `${Math.min(100, (results.used / results.max) * 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResultCard
              icon="📊"
              label="Prior OPT Days"
              value={`${results.priorDays} days`}
            />
            <ResultCard
              icon="⏱️"
              label="STEM Days Used"
              value={`${results.stemDays} days`}
            />
            <ResultCard
              icon="✅"
              label="Total Remaining"
              value={`${results.remaining} days`}
              status={results.remaining <= 15 ? "critical" : results.remaining <= 50 ? "warning" : "ok"}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function OptToolsSection() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">OPT Tools</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Calculate your OPT deadlines and track unemployment days
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="opt-apply" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="opt-apply" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">📅 </span>OPT Apply
          </TabsTrigger>
          <TabsTrigger value="opt-clock" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">⏰ </span>OPT Clock
          </TabsTrigger>
          <TabsTrigger value="stem-apply" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">🎓 </span>STEM Apply
          </TabsTrigger>
          <TabsTrigger value="stem-clock" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">⏲️ </span>STEM Clock
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opt-apply">
          <Card className="p-6">
            <OptApplyTool />
          </Card>
        </TabsContent>

        <TabsContent value="opt-clock">
          <Card className="p-6">
            <OptClockTool />
          </Card>
        </TabsContent>

        <TabsContent value="stem-apply">
          <Card className="p-6">
            <StemApplyTool />
          </Card>
        </TabsContent>

        <TabsContent value="stem-clock">
          <Card className="p-6">
            <StemClockTool />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
