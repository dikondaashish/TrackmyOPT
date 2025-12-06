"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft,
  Mail, 
  Crown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  Clock,
  Target,
  Shield,
  Pencil,
  X,
  Check,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PricingModal } from "@/components/pricing/PricingModal";

// ============================================================================
// TYPES
// ============================================================================

type ToolName = 'opt_apply' | 'opt_clock' | 'stem_apply' | 'stem_clock';

interface OptDatesData {
  program_end_date?: string;
  dso_recommendation_date?: string;
  opt_start_date?: string;
  opt_ead_end_date?: string;
  stem_start_date?: string;
}

interface ToolEmails {
  opt_apply: string;
  opt_clock: string;
  stem_apply: string;
  stem_clock: string;
}

// Tool definitions
const TOOLS: Record<ToolName, {
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  gradient: string;
  bgLight: string;
  bgDark: string;
  iconBg: string;
}> = {
  opt_apply: {
    label: 'OPT Apply Dates',
    shortLabel: 'OPT Apply',
    icon: '📅',
    description: 'Calculate your OPT filing window and deadlines',
    gradient: 'from-blue-500 via-blue-600 to-indigo-600',
    bgLight: 'bg-blue-50',
    bgDark: 'dark:bg-blue-950/30',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
  },
  opt_clock: {
    label: 'OPT Clock Tracker',
    shortLabel: 'OPT Clock',
    icon: '⏰',
    description: 'Track your 90-day unemployment limit',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/30',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
  },
  stem_apply: {
    label: 'STEM Apply Dates',
    shortLabel: 'STEM Apply',
    icon: '🎓',
    description: 'Calculate your STEM OPT extension filing window',
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/30',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
  },
  stem_clock: {
    label: 'STEM Clock Tracker',
    shortLabel: 'STEM Clock',
    icon: '⏲️',
    description: 'Track your 150-day aggregate unemployment limit',
    gradient: 'from-purple-500 via-violet-500 to-fuchsia-500',
    bgLight: 'bg-purple-50',
    bgDark: 'dark:bg-purple-950/30',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
  },
};

// ============================================================================
// DATE UTILITIES
// ============================================================================

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
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const selectedDate = parseDate(value);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-lg">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-gray-400 font-medium py-2">{day}</div>
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
            className={`p-2 text-sm rounded-xl transition-all ${
              !day ? 'invisible' : 
              selectedDate && 
              selectedDate.getDate() === day && 
              selectedDate.getMonth() === currentMonth.getMonth() && 
              selectedDate.getFullYear() === currentMonth.getFullYear()
                ? 'bg-blue-600 text-white font-bold scale-110'
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
// STYLED DATE INPUT
// ============================================================================

function StyledDateInput({ 
  label, 
  value, 
  onChange, 
  description,
  gradient
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
  description?: string;
  gradient: string;
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

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
          <CalendarIcon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-lg">{label}</h4>
          {description && <p className="text-sm text-white/80">{description}</p>}
        </div>
      </div>
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="MM/DD/YYYY"
          className="bg-white/20 border-white/30 text-white placeholder:text-white/50 h-12 text-lg font-medium pr-14 focus:ring-white/50"
        />
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 hover:bg-white/20 rounded-xl transition-colors"
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
// RESULT DISPLAY COMPONENTS
// ============================================================================

function CountdownDisplay({ 
  days, 
  label, 
  sublabel,
  status 
}: { 
  days: number; 
  label: string;
  sublabel?: string;
  status: 'ok' | 'warning' | 'critical';
}) {
  const colors = {
    ok: 'from-emerald-400 to-green-500 border-green-400',
    warning: 'from-amber-400 to-orange-500 border-amber-400',
    critical: 'from-red-400 to-rose-500 border-red-400',
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${colors[status]} p-8 text-white text-center shadow-2xl`}>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl"></div>
      <div className="relative z-10">
        <p className="text-white/80 font-medium mb-2">{label}</p>
        <p className="text-7xl font-black tracking-tight mb-2">{days}</p>
        <p className="text-white/90 font-semibold text-lg">days</p>
        {sublabel && <p className="text-white/70 text-sm mt-3">{sublabel}</p>}
      </div>
      <Sparkles className="absolute top-4 right-4 w-8 h-8 text-white/30" />
    </div>
  );
}

function ResultCard({ 
  icon: Icon, 
  emoji,
  label, 
  value, 
  subtext 
}: { 
  icon?: React.ComponentType<{ className?: string }>;
  emoji?: string;
  label: string; 
  value: string;
  subtext?: string;
}) {
  return (
    <div className="p-5 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all">
      <div className="flex items-center gap-3 mb-3">
        {emoji ? (
          <span className="text-3xl">{emoji}</span>
        ) : Icon ? (
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
        ) : null}
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      {subtext && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>}
    </div>
  );
}

// ============================================================================
// EMAIL SETTINGS COMPONENT
// ============================================================================

function EmailSettings({ 
  tool, 
  email, 
  isPremium,
  onSave,
  onStop,
  onUpgrade
}: { 
  tool: ToolName;
  email: string;
  isPremium: boolean;
  onSave: (email: string) => Promise<void>;
  onStop: () => Promise<void>;
  onUpgrade: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editEmail, setEditEmail] = useState(email);
  const [isSaving, setIsSaving] = useState(false);
  const toolInfo = TOOLS[tool];

  const handleSave = async () => {
    if (!editEmail || !editEmail.includes('@')) return;
    setIsSaving(true);
    await onSave(editEmail);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleStop = async () => {
    if (!confirm('Stop email reminders for this tool?')) return;
    setIsSaving(true);
    await onStop();
    setIsSaving(false);
  };

  if (!isPremium) {
    return (
      <div className={`p-5 rounded-2xl ${toolInfo.bgLight} ${toolInfo.bgDark} border border-gray-200 dark:border-gray-700`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${toolInfo.iconBg} flex items-center justify-center`}>
              <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Email Reminders</p>
              <p className="text-sm text-gray-500">Get daily notifications at 9 AM ET</p>
            </div>
          </div>
          <Button onClick={onUpgrade} variant="outline" size="sm" className="gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            Upgrade
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-2xl ${toolInfo.bgLight} ${toolInfo.bgDark} border border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${toolInfo.iconBg} flex items-center justify-center`}>
            <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Email Reminders</p>
            {email ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-sm text-gray-600 dark:text-gray-400">{email}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No email set</p>
            )}
          </div>
        </div>
        
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-48 h-9"
            />
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {email && (
              <Button size="sm" variant="ghost" onClick={handleStop} disabled={isSaving} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                Stop
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => { setEditEmail(email); setIsEditing(true); }}>
              <Pencil className="w-4 h-4 mr-1" />
              {email ? 'Edit' : 'Set Email'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// OPT APPLY DATES TOOL
// ============================================================================

function OptApplyTool({ 
  dates, 
  onDatesChange,
  onSave,
  isSaving,
  email,
  isPremium,
  onEmailSave,
  onEmailStop,
  onUpgrade
}: {
  dates: OptDatesData;
  onDatesChange: (field: keyof OptDatesData, value: string) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  email: string;
  isPremium: boolean;
  onEmailSave: (email: string) => Promise<void>;
  onEmailStop: () => Promise<void>;
  onUpgrade: () => void;
}) {
  const programEnd = parseDate(dates.program_end_date || '');
  const dsoRec = parseDate(dates.dso_recommendation_date || '');

  let results = null;
  if (programEnd) {
    const earliestFile = addDays(programEnd, -90);
    let mustArriveBy = addDays(programEnd, 60);
    if (dsoRec) {
      const dsoDeadline = addDays(dsoRec, 30);
      if (dsoDeadline < mustArriveBy) mustArriveBy = dsoDeadline;
    }
    const optStartEarliest = programEnd;
    const optStartLatest = addDays(programEnd, 60);
    const today = new Date();
    const daysUntilDeadline = daysBetween(today, mustArriveBy);

    results = { earliestFile, mustArriveBy, optStartEarliest, optStartLatest, daysUntilDeadline };
  }

  const getStatus = (days: number): 'ok' | 'warning' | 'critical' => {
    if (days <= 7) return 'critical';
    if (days <= 30) return 'warning';
    return 'ok';
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">Post-Completion OPT Filing Rules</h3>
            <p className="text-white/90 text-sm leading-relaxed">
              You can apply 90 days before your program ends, up to 60 days after. USCIS must receive your I-765 within 30 days of your DSO's recommendation.
            </p>
          </div>
        </div>
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StyledDateInput
          label="Program End Date"
          value={dates.program_end_date || ''}
          onChange={(v) => onDatesChange('program_end_date', v)}
          description="From your I-20"
          gradient="from-blue-500 to-blue-600"
        />
        <StyledDateInput
          label="DSO Recommendation Date"
          value={dates.dso_recommendation_date || ''}
          onChange={(v) => onDatesChange('dso_recommendation_date', v)}
          description="When DSO signed your I-20 (optional)"
          gradient="from-indigo-500 to-purple-600"
        />
      </div>

      {/* Save Button */}
      <Button onClick={onSave} disabled={isSaving} className="w-full h-12 text-lg font-semibold" size="lg">
        {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
        {isSaving ? 'Saving...' : 'Save & Calculate'}
      </Button>

      {/* Results */}
      {results && (
        <div className="space-y-6 pt-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-500" />
            Your OPT Filing Timeline
          </h3>

          <CountdownDisplay
            days={results.daysUntilDeadline}
            label="Days Until Deadline"
            sublabel={`Must arrive by ${formatDateDisplay(results.mustArriveBy)}`}
            status={getStatus(results.daysUntilDeadline)}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResultCard emoji="📅" label="Earliest File" value={formatDateDisplay(results.earliestFile)} subtext="90 days before" />
            <ResultCard emoji="⏰" label="Must Arrive By" value={formatDateDisplay(results.mustArriveBy)} subtext="USCIS deadline" />
            <ResultCard emoji="🎯" label="OPT Can Start" value={formatDateDisplay(results.optStartEarliest)} subtext="Program end" />
            <ResultCard emoji="📆" label="Latest Start" value={formatDateDisplay(results.optStartLatest)} subtext="60 days after" />
          </div>
        </div>
      )}

      {/* Email Settings */}
      <EmailSettings
        tool="opt_apply"
        email={email}
        isPremium={isPremium}
        onSave={onEmailSave}
        onStop={onEmailStop}
        onUpgrade={onUpgrade}
      />
    </div>
  );
}

// ============================================================================
// OPT CLOCK TOOL
// ============================================================================

function OptClockTool({ 
  dates, 
  onDatesChange,
  onSave,
  isSaving,
  email,
  isPremium,
  onEmailSave,
  onEmailStop,
  onUpgrade
}: {
  dates: OptDatesData;
  onDatesChange: (field: keyof OptDatesData, value: string) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  email: string;
  isPremium: boolean;
  onEmailSave: (email: string) => Promise<void>;
  onEmailStop: () => Promise<void>;
  onUpgrade: () => void;
}) {
  const optStart = parseDate(dates.opt_start_date || '');
  const optEnd = parseDate(dates.opt_ead_end_date || '');

  // For simplicity, assume 0 employment for now (user would need to add employment spans)
  // In production, this would load from employment API
  let results = null;
  if (optStart && optEnd) {
    const today = new Date();
    const endDate = today < optEnd ? today : optEnd;
    const totalDays = Math.max(0, daysBetween(optStart, endDate));
    const max = 90;
    const remaining = Math.max(0, max - totalDays);
    results = { used: totalDays, remaining, max };
  }

  const getStatus = (remaining: number): 'ok' | 'warning' | 'critical' => {
    if (remaining <= 10) return 'critical';
    if (remaining <= 30) return 'warning';
    return 'ok';
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">90-Day Unemployment Limit</h3>
            <p className="text-white/90 text-sm leading-relaxed">
              During post-completion OPT, you cannot be unemployed for more than 90 days total. Track your employment to stay compliant.
            </p>
          </div>
        </div>
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StyledDateInput
          label="OPT Start Date"
          value={dates.opt_start_date || ''}
          onChange={(v) => onDatesChange('opt_start_date', v)}
          description="From your EAD card"
          gradient="from-amber-500 to-orange-500"
        />
        <StyledDateInput
          label="OPT End Date"
          value={dates.opt_ead_end_date || ''}
          onChange={(v) => onDatesChange('opt_ead_end_date', v)}
          description="From your EAD card"
          gradient="from-orange-500 to-red-500"
        />
      </div>

      {/* Save Button */}
      <Button onClick={onSave} disabled={isSaving} className="w-full h-12 text-lg font-semibold" size="lg">
        {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
        {isSaving ? 'Saving...' : 'Save & Calculate'}
      </Button>

      {/* Results */}
      {results && (
        <div className="space-y-6 pt-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-500" />
            Your Unemployment Status
          </h3>

          <CountdownDisplay
            days={results.remaining}
            label="Days Remaining"
            sublabel={`${results.used} of ${results.max} days used`}
            status={getStatus(results.remaining)}
          />

          {/* Progress Bar */}
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between text-sm mb-3">
              <span className="font-medium text-gray-700 dark:text-gray-300">Used: {results.used} days</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">Limit: {results.max} days</span>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all rounded-full ${
                  getStatus(results.remaining) === 'critical' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                  getStatus(results.remaining) === 'warning' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                  'bg-gradient-to-r from-emerald-500 to-green-500'
                }`}
                style={{ width: `${Math.min(100, (results.used / results.max) * 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ResultCard icon={Clock} label="Days Used" value={`${results.used} days`} />
            <ResultCard icon={CheckCircle2} label="Days Remaining" value={`${results.remaining} days`} />
          </div>
        </div>
      )}

      {/* Email Settings */}
      <EmailSettings
        tool="opt_clock"
        email={email}
        isPremium={isPremium}
        onSave={onEmailSave}
        onStop={onEmailStop}
        onUpgrade={onUpgrade}
      />
    </div>
  );
}

// ============================================================================
// STEM APPLY TOOL
// ============================================================================

function StemApplyTool({ 
  dates, 
  onDatesChange,
  onSave,
  isSaving,
  email,
  isPremium,
  onEmailSave,
  onEmailStop,
  onUpgrade
}: {
  dates: OptDatesData;
  onDatesChange: (field: keyof OptDatesData, value: string) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  email: string;
  isPremium: boolean;
  onEmailSave: (email: string) => Promise<void>;
  onEmailStop: () => Promise<void>;
  onUpgrade: () => void;
}) {
  const optEnd = parseDate(dates.opt_ead_end_date || '');

  let results = null;
  if (optEnd) {
    const earliestFile = addDays(optEnd, -90);
    const deadline = optEnd;
    const capGapEnd = addDays(optEnd, 180);
    const today = new Date();
    const daysUntilDeadline = daysBetween(today, deadline);

    results = { earliestFile, deadline, capGapEnd, daysUntilDeadline };
  }

  const getStatus = (days: number): 'ok' | 'warning' | 'critical' => {
    if (days <= 7) return 'critical';
    if (days <= 30) return 'warning';
    return 'ok';
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">STEM OPT Extension Rules</h3>
            <p className="text-white/90 text-sm leading-relaxed">
              Apply up to 90 days before your current OPT expires. If filed timely, you get automatic 180-day cap-gap work authorization while pending.
            </p>
          </div>
        </div>
      </div>

      {/* Date Input */}
      <StyledDateInput
        label="Current OPT EAD End Date"
        value={dates.opt_ead_end_date || ''}
        onChange={(v) => onDatesChange('opt_ead_end_date', v)}
        description="From your OPT Employment Authorization Document"
        gradient="from-emerald-500 to-green-600"
      />

      {/* Save Button */}
      <Button onClick={onSave} disabled={isSaving} className="w-full h-12 text-lg font-semibold" size="lg">
        {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
        {isSaving ? 'Saving...' : 'Save & Calculate'}
      </Button>

      {/* Results */}
      {results && (
        <div className="space-y-6 pt-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-emerald-500" />
            Your STEM OPT Filing Timeline
          </h3>

          <CountdownDisplay
            days={results.daysUntilDeadline}
            label="Days Until OPT Expires"
            sublabel={`Must file before ${formatDateDisplay(results.deadline)}`}
            status={getStatus(results.daysUntilDeadline)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResultCard emoji="📅" label="Earliest File" value={formatDateDisplay(results.earliestFile)} subtext="90 days before" />
            <ResultCard emoji="⏰" label="Filing Deadline" value={formatDateDisplay(results.deadline)} subtext="Before OPT expires" />
            <ResultCard emoji="🛡️" label="Cap-Gap Until" value={formatDateDisplay(results.capGapEnd)} subtext="If filed timely" />
          </div>
        </div>
      )}

      {/* Email Settings */}
      <EmailSettings
        tool="stem_apply"
        email={email}
        isPremium={isPremium}
        onSave={onEmailSave}
        onStop={onEmailStop}
        onUpgrade={onUpgrade}
      />
    </div>
  );
}

// ============================================================================
// STEM CLOCK TOOL
// ============================================================================

function StemClockTool({ 
  dates, 
  onDatesChange,
  onSave,
  isSaving,
  email,
  isPremium,
  onEmailSave,
  onEmailStop,
  onUpgrade
}: {
  dates: OptDatesData;
  onDatesChange: (field: keyof OptDatesData, value: string) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  email: string;
  isPremium: boolean;
  onEmailSave: (email: string) => Promise<void>;
  onEmailStop: () => Promise<void>;
  onUpgrade: () => void;
}) {
  const stemStart = parseDate(dates.stem_start_date || '');
  const optEnd = parseDate(dates.opt_ead_end_date || '');

  // Assume STEM end is 24 months after STEM start
  const stemEnd = stemStart ? addDays(stemStart, 730) : null;

  let results = null;
  if (stemStart && stemEnd) {
    const today = new Date();
    const endDate = today < stemEnd ? today : stemEnd;
    const totalDays = Math.max(0, daysBetween(stemStart, endDate));
    const max = 150; // STEM aggregate limit
    const remaining = Math.max(0, max - totalDays);
    results = { used: totalDays, remaining, max };
  }

  const getStatus = (remaining: number): 'ok' | 'warning' | 'critical' => {
    if (remaining <= 15) return 'critical';
    if (remaining <= 50) return 'warning';
    return 'ok';
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">150-Day Aggregate Limit</h3>
            <p className="text-white/90 text-sm leading-relaxed">
              During STEM OPT, your total unemployment (including prior OPT unemployment) cannot exceed 150 days aggregate.
            </p>
          </div>
        </div>
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StyledDateInput
          label="STEM OPT Start Date"
          value={dates.stem_start_date || ''}
          onChange={(v) => onDatesChange('stem_start_date', v)}
          description="From your STEM EAD card"
          gradient="from-purple-500 to-violet-600"
        />
        <StyledDateInput
          label="Current OPT End Date"
          value={dates.opt_ead_end_date || ''}
          onChange={(v) => onDatesChange('opt_ead_end_date', v)}
          description="Initial OPT expiration"
          gradient="from-violet-500 to-fuchsia-600"
        />
      </div>

      {/* Save Button */}
      <Button onClick={onSave} disabled={isSaving} className="w-full h-12 text-lg font-semibold" size="lg">
        {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
        {isSaving ? 'Saving...' : 'Save & Calculate'}
      </Button>

      {/* Results */}
      {results && (
        <div className="space-y-6 pt-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-500" />
            Your STEM Unemployment Status
          </h3>

          <CountdownDisplay
            days={results.remaining}
            label="Days Remaining"
            sublabel={`${results.used} of ${results.max} days used (aggregate)`}
            status={getStatus(results.remaining)}
          />

          {/* Progress Bar */}
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between text-sm mb-3">
              <span className="font-medium text-gray-700 dark:text-gray-300">Used: {results.used} days</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">Limit: {results.max} days</span>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all rounded-full ${
                  getStatus(results.remaining) === 'critical' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                  getStatus(results.remaining) === 'warning' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                  'bg-gradient-to-r from-purple-500 to-fuchsia-500'
                }`}
                style={{ width: `${Math.min(100, (results.used / results.max) * 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ResultCard icon={Clock} label="Days Used" value={`${results.used} days`} />
            <ResultCard icon={CheckCircle2} label="Days Remaining" value={`${results.remaining} days`} />
          </div>
        </div>
      )}

      {/* Email Settings */}
      <EmailSettings
        tool="stem_clock"
        email={email}
        isPremium={isPremium}
        onSave={onEmailSave}
        onStop={onEmailStop}
        onUpgrade={onUpgrade}
      />
    </div>
  );
}

// ============================================================================
// TOOL CARD COMPONENT
// ============================================================================

function ToolCard({ 
  tool, 
  onClick,
  email,
  isPremium
}: { 
  tool: ToolName; 
  onClick: () => void;
  email: string;
  isPremium: boolean;
}) {
  const info = TOOLS[tool];
  
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${info.gradient} p-6 text-white text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>
      
      <div className="relative z-10">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <span className="text-4xl">{info.icon}</span>
        </div>
        
        {/* Content */}
        <h3 className="text-2xl font-bold mb-2">{info.label}</h3>
        <p className="text-white/80 text-sm mb-4">{info.description}</p>
        
        {/* Email Status */}
        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-4 h-4" />
          {isPremium && email ? (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Active
            </span>
          ) : isPremium ? (
            <span className="text-white/60">No email set</span>
          ) : (
            <span className="flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-300" />
              <span className="text-white/60">PRO</span>
            </span>
          )}
        </div>
      </div>
      
      {/* Arrow */}
      <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
        <ChevronRight className="w-5 h-5" />
      </div>
    </button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function OptToolsSection() {
  const [activeTool, setActiveTool] = useState<ToolName | null>(null);
  const [dates, setDates] = useState<OptDatesData>({});
  const [toolEmails, setToolEmails] = useState<ToolEmails>({
    opt_apply: '',
    opt_clock: '',
    stem_apply: '',
    stem_clock: '',
  });
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load dates, emails, and premium status in parallel
      const [datesRes, emailsRes, premiumRes] = await Promise.all([
        fetch('/api/opt/calculator', { credentials: 'include' }),
        fetch('/api/user/tool-email', { credentials: 'include' }),
        fetch('/api/premium/status', { credentials: 'include' }),
      ]);

      if (datesRes.ok) {
        const result = await datesRes.json();
        if (result.ok && result.data) {
          setDates(result.data);
        }
      }

      if (emailsRes.ok) {
        const result = await emailsRes.json();
        if (result.emails) {
          setToolEmails({
            opt_apply: result.emails.opt_apply || '',
            opt_clock: result.emails.opt_clock || '',
            stem_apply: result.emails.stem_apply || '',
            stem_clock: result.emails.stem_clock || '',
          });
        }
      }

      if (premiumRes.ok) {
        const result = await premiumRes.json();
        setIsPremium(result.isPremium || false);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDatesChange = (field: keyof OptDatesData, value: string) => {
    setDates(prev => {
      const newDates = { ...prev, [field]: value };
      
      // Auto-sync logic
      if (field === 'program_end_date' && value) {
        newDates.dso_recommendation_date = value;
      } else if (field === 'dso_recommendation_date' && value) {
        newDates.program_end_date = value;
      }
      
      // OPT Start → OPT End (+364 days)
      if (field === 'opt_start_date' && value) {
        const parsed = parseDate(value);
        if (parsed) {
          newDates.opt_ead_end_date = formatDateInput(addDays(parsed, 364));
        }
      }
      
      return newDates;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        program_end_date: dates.program_end_date?.trim() || null,
        dso_recommendation_date: dates.dso_recommendation_date?.trim() || null,
        opt_start_date: dates.opt_start_date?.trim() || null,
        opt_ead_end_date: dates.opt_ead_end_date?.trim() || null,
        stem_start_date: dates.stem_start_date?.trim() || null,
      };

      const response = await fetch('/api/opt/calculator', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await loadData(); // Reload to sync
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmailSave = async (tool: ToolName, email: string) => {
    try {
      const response = await fetch('/api/user/tool-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, email }),
      });

      if (response.ok) {
        setToolEmails(prev => ({ ...prev, [tool]: email }));
      }
    } catch (error) {
      console.error('Error saving email:', error);
    }
  };

  const handleEmailStop = async (tool: ToolName) => {
    try {
      const response = await fetch('/api/user/tool-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, email: '' }),
      });

      if (response.ok) {
        setToolEmails(prev => ({ ...prev, [tool]: '' }));
      }
    } catch (error) {
      console.error('Error stopping email:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          <p className="text-gray-500">Loading your OPT data...</p>
        </div>
      </div>
    );
  }

  // If a tool is active, show that tool's interface
  if (activeTool) {
    const toolInfo = TOOLS[activeTool];
    
    const toolProps = {
      dates,
      onDatesChange: handleDatesChange,
      onSave: handleSave,
      isSaving,
      email: toolEmails[activeTool],
      isPremium,
      onEmailSave: (email: string) => handleEmailSave(activeTool, email),
      onEmailStop: () => handleEmailStop(activeTool),
      onUpgrade: () => setShowPricingModal(true),
    };

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button & Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTool(null)}
            className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{toolInfo.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{toolInfo.label}</h1>
              <p className="text-gray-500 dark:text-gray-400">{toolInfo.description}</p>
            </div>
          </div>
        </div>

        {/* Tool Content */}
        <Card className="p-6">
          {activeTool === 'opt_apply' && <OptApplyTool {...toolProps} />}
          {activeTool === 'opt_clock' && <OptClockTool {...toolProps} />}
          {activeTool === 'stem_apply' && <StemApplyTool {...toolProps} />}
          {activeTool === 'stem_clock' && <StemClockTool {...toolProps} />}
        </Card>

        <PricingModal
          open={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          isPremium={isPremium}
        />
      </div>
    );
  }

  // Main view - Tool cards
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          OPT Tools
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Track your OPT deadlines and stay compliant. Select a tool to get started.
        </p>
      </div>

      {/* Tool Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(Object.keys(TOOLS) as ToolName[]).map((tool) => (
          <ToolCard
            key={tool}
            tool={tool}
            onClick={() => setActiveTool(tool)}
            email={toolEmails[tool]}
            isPremium={isPremium}
          />
        ))}
      </div>

      {/* Sync Notice */}
      <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Synced Across All Platforms
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your dates are automatically synced with the OPT Dates page and Chrome extension. 
              Update in one place, and it reflects everywhere.
            </p>
          </div>
        </div>
      </div>

      <PricingModal
        open={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        isPremium={isPremium}
      />
    </div>
  );
}
