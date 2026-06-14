"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, Mail, Crown, Edit, CheckCircle2, BellOff, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";
import { JargonTooltip } from "@/components/ui/jargon-tooltip";
import { EmploymentHistoryLog } from "./EmploymentHistoryLog";

const PricingModal = dynamic(
  () => import("@/components/pricing/PricingModal").then((m) => ({ default: m.PricingModal })),
  { ssr: false }
);

interface OptDatesData {
  program_end_date?: string;
  dso_recommendation_date?: string;
  opt_start_date?: string;
  opt_ead_end_date?: string;
  stem_start_date?: string;
}

interface EmploymentSpan {
  id: string;
  employer_name: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  job_title?: string;
  location?: string;
}

// Helper function to add days to a date string (MM/DD/YYYY format)
function addDaysToDate(dateStr: string, days: number): string {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return '';

  const month = parseInt(parts[0]) - 1;
  const day = parseInt(parts[1]);
  const year = parseInt(parts[2]);

  if (isNaN(month) || isNaN(day) || isNaN(year)) return '';

  const date = new Date(year, month, day);
  date.setDate(date.getDate() + days);

  const newMonth = String(date.getMonth() + 1).padStart(2, '0');
  const newDay = String(date.getDate()).padStart(2, '0');
  const newYear = date.getFullYear();

  return `${newMonth}/${newDay}/${newYear}`;
}

interface DateInputProps {
  id: string;
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  optional?: boolean;
  error?: string | null;
}

function DateInput({ id, label, value, onChange, placeholder = "MM/DD/YYYY", description, optional = false, error }: DateInputProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateSelect = (dateStr: string) => {
    onChange(dateStr);
    setShowCalendar(false);
  };

  return (
    <div className="space-y-2 relative w-full">
      <Label htmlFor={id} className="flex items-center gap-2 text-sm font-medium">
        <CalendarIcon className="w-4 h-4" />
        {label}
        {optional && <span className="font-normal text-muted-foreground text-sm">(Optional)</span>}
      </Label>
      <div className="relative w-full">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-12 w-full"
        />
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 max-md:min-h-11 max-md:min-w-11 max-md:flex max-md:items-center max-md:justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          aria-label="Open calendar"
        >
          <CalendarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        {showCalendar && (
          <div ref={calendarRef} className="absolute top-full mt-2 z-50 right-0 max-md:left-0 max-md:right-0">
            <DatePicker value={value} onSelect={handleDateSelect} />
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 font-medium animate-in fade-in-0 slide-in-from-top-1">{error}</p>
      )}
      {description && !error && (
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      )}
    </div>
  );
}

function DatePicker({ value, onSelect }: { value: string; onSelect: (date: string) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Parse the input value if it exists
  useEffect(() => {
    if (value) {
      const parts = value.split('/');
      if (parts.length === 3) {
        const month = parseInt(parts[0]) - 1;
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
          setSelectedDate(new Date(year, month, day));
          setCurrentDate(new Date(year, month, 1));
        }
      }
    }
  }, [value]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const month = String(selected.getMonth() + 1).padStart(2, '0');
    const dayStr = String(selected.getDate()).padStart(2, '0');
    const year = selected.getFullYear();
    onSelect(`${month}/${dayStr}/${year}`);
  };

  const handleToday = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    onSelect(`${month}/${day}/${year}`);
  };

  const handleClear = () => {
    onSelect('');
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear();
  };

  return (
    <Card className="p-4 w-[min(20rem,calc(100vw-2rem))] max-w-full shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          aria-label="Previous month"
        >
          ↑
        </button>
        <div className="font-semibold">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          aria-label="Next month"
        >
          ↓
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day, i) => (
          <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((blank) => (
          <div key={`blank-${blank}`} className="p-2" />
        ))}
        {days.map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => handleDateClick(day)}
            className={`p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isToday(day) ? 'bg-blue-100 dark:bg-blue-900 font-bold' : ''
              } ${isSelected(day) ? 'bg-blue-600 text-white hover:bg-blue-700' : ''
              }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Footer buttons */}
      <div className="flex justify-between mt-4 pt-3 border-t">
        <button
          type="button"
          onClick={handleClear}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleToday}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Today
        </button>
      </div>
    </Card>
  );
}

// Tool email types
interface ToolEmails {
  opt_apply: string;
  opt_clock: string;
  stem_apply: string;
  stem_clock: string;
}

type ToolName = keyof ToolEmails;

const TOOL_INFO: Record<ToolName, { label: string; icon: string; description: string; color: string }> = {
  opt_apply: {
    label: 'OPT Apply Dates',
    icon: '📅',
    description: 'Get reminders for OPT filing deadlines',
    color: 'from-blue-500 to-blue-600',
  },
  opt_clock: {
    label: 'OPT Clock Tracker',
    icon: '⏰',
    description: 'Track unemployment days and get alerts',
    color: 'from-amber-500 to-orange-500',
  },
  stem_apply: {
    label: 'STEM Apply Dates',
    icon: '🎓',
    description: 'STEM OPT extension deadline reminders',
    color: 'from-green-500 to-emerald-600',
  },
  stem_clock: {
    label: 'STEM Clock Tracker',
    icon: '⏲️',
    description: 'STEM unemployment tracking alerts',
    color: 'from-purple-500 to-violet-600',
  },
};

export function OptDatesSection() {
  const { toast } = useToast();
  const [dates, setDates] = useState<OptDatesData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastModifiedField, setLastModifiedField] = useState<string | null>(null);

  // Premium & Email states - now with 4 separate emails
  const [isPremium, setIsPremium] = useState(false);
  const [toolEmails, setToolEmails] = useState<ToolEmails>({
    opt_apply: '',
    opt_clock: '',
    stem_apply: '',
    stem_clock: '',
  });
  const [editingTool, setEditingTool] = useState<ToolName | null>(null);
  const [emailSaving, setEmailSaving] = useState<ToolName | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [employmentSpans, setEmploymentSpans] = useState<EmploymentSpan[]>([]);

  // Load all data in parallel on mount
  useEffect(() => {
    void (async () => {
      await Promise.all([loadDates(), checkPremiumStatus(), loadToolEmails(), loadEmploymentSpans()]);
    })();
     
  }, []);

  const loadEmploymentSpans = async () => {
    try {
      const response = await fetch("/api/employment-spans", {
        credentials: "include",
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.ok && Array.isArray(data.spans)) {
          setEmploymentSpans(data.spans);
        }
      }
    } catch {
      // Silently fail; section will still render with empty state.
    }
  };

  const checkPremiumStatus = async () => {
    try {
      const response = await fetch('/api/premium/status', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setIsPremium(data.isPremium || false);
      }
    } catch {
      // Silently fail
    }
  };

  const loadToolEmails = async () => {
    try {
      const response = await fetch('/api/user/tool-email', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.emails) {
          setToolEmails({
            opt_apply: data.emails.opt_apply || '',
            opt_clock: data.emails.opt_clock || '',
            stem_apply: data.emails.stem_apply || '',
            stem_clock: data.emails.stem_clock || '',
          });
        }
      }
    } catch {
      // Silently fail
    }
  };

  const handleToolEmailSave = async (tool: ToolName) => {
    const email = toolEmails[tool];
    if (!email || !email.includes('@')) {
      return;
    }

    try {
      setEmailSaving(tool);
      const response = await fetch('/api/user/tool-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, email }),
      });

      if (response.ok) {
        setEditingTool(null);
      }
    } catch {
      // Silently fail
    } finally {
      setEmailSaving(null);
    }
  };

  const handleToolEmailStop = async (tool: ToolName) => {
    if (!confirm('Stop email reminders for this tool?')) {
      return;
    }

    try {
      setEmailSaving(tool);
      const response = await fetch('/api/user/tool-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, email: '' }),
      });

      if (response.ok) {
        setToolEmails(prev => ({ ...prev, [tool]: '' }));
      }
    } catch {
      // Silently fail
    } finally {
      setEmailSaving(null);
    }
  };

  const updateToolEmail = (tool: ToolName, email: string) => {
    setToolEmails(prev => ({ ...prev, [tool]: email }));
  };

  const loadDates = async () => {
    try {
      setIsLoading(true);

      // Use same endpoint as extension for perfect sync
      const response = await fetch('/api/opt/calculator', {
        credentials: 'include',
        cache: 'no-store', // Prevent caching to ensure fresh data
      });

      if (response.ok) {
        const result = await response.json();
        if (result.ok && result.data) {
          setDates(result.data);
        } else {
        }
      } else {
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (field: keyof OptDatesData, value: string) => {
    setDates(prev => {
      const newDates = { ...prev, [field]: value };

      // Logic 1: Sync Program End Date ↔ DSO Recommendation Date
      if (field === 'program_end_date') {
        // When Program End Date is updated or cleared, sync DSO Recommendation Date
        newDates.dso_recommendation_date = value;
      } else if (field === 'dso_recommendation_date') {
        // When DSO Recommendation Date is updated or cleared, sync Program End Date
        newDates.program_end_date = value;
      }

      // Logic 2: OPT Start Date → OPT EAD End Date (+ 364 days = ~1 year)
      if (field === 'opt_start_date') {
        if (value) {
          const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
          if (dateRegex.test(value)) {
            const endDate = addDaysToDate(value, 364);
            if (endDate) {
              newDates.opt_ead_end_date = endDate;
            }
          }
        } else {
          // When OPT Start Date is cleared, also clear OPT EAD End Date
          newDates.opt_ead_end_date = '';
        }
      }

      return newDates;
    });
    setLastModifiedField(field);

    // Real-time validation
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (value && value.trim() !== '' && !dateRegex.test(value)) {
      setErrors(prev => ({ ...prev, [field]: 'Invalid date format (MM/DD/YYYY)' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    // Validate: at least one date must be filled
    const hasAtLeastOneDate = Object.values(dates).some(date => date && date.trim() !== '');

    if (!hasAtLeastOneDate) {
      toast({
        title: "Validation Error",
        description: "Please enter at least one date.",
        variant: "destructive",
      });
      return;
    }

    // Validate date format (MM/DD/YYYY) for filled fields
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    const dateFields = ['program_end_date', 'dso_recommendation_date', 'opt_start_date', 'opt_ead_end_date', 'stem_start_date'];

    let hasError = false;
    const newErrors: Record<string, string> = {};

    for (const field of dateFields) {
      const value = dates[field as keyof OptDatesData];
      if (value && value.trim() !== '' && !dateRegex.test(value)) {
        newErrors[field] = `Invalid date format`;
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      toast({
        title: "Validation Error",
        description: "Please correct the invalid date formats.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        program_end_date: dates.program_end_date?.trim() || null,
        dso_recommendation_date: dates.dso_recommendation_date?.trim() || null,
        opt_start_date: dates.opt_start_date?.trim() || null,
        opt_ead_end_date: dates.opt_ead_end_date?.trim() || null,
        stem_start_date: dates.stem_start_date?.trim() || null,
        _lastModifiedField: lastModifiedField,
      };

      const response = await fetch('/api/opt/calculator', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        toast({
          title: "Success",
          description: "Dates saved successfully!",
          className: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
        });
        await loadDates();
      } else {
        toast({
          title: "Error",
          description: result.error || 'Failed to save dates',
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-64" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">OPT Dates</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your important OPT-related dates. At least one date is required.
        </p>
      </div>

      {/* Main Form Card */}
      <Card className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-8">
          {/* Date Fields Grid - 2 Columns on Desktop, 1 on Mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Row 1 Left: Program End Date */}
            <DateInput
              id="program_end_date"
              label="Program End Date"
              value={dates.program_end_date || ''}
              onChange={(value) => handleDateChange('program_end_date', value)}
              description="The date your academic program officially ends"
            />

            {/* Row 1 Right: OPT EAD End Date */}
            <DateInput
              id="opt_ead_end_date"
              label={<span className="flex items-center gap-1"><JargonTooltip term="OPT" showIcon={false} /> <JargonTooltip term="EAD" showIcon={true} /> End Date</span>}
              value={dates.opt_ead_end_date || ''}
              onChange={(value) => handleDateChange('opt_ead_end_date', value)}
              description="Employment Authorization Document expiration date for OPT"
              optional
            />

            {/* Row 2 Left: DSO Recommendation Date */}
            <DateInput
              id="dso_recommendation_date"
              label={<span className="flex items-center gap-1"><JargonTooltip term="DSO" showIcon={true} /> Recommendation Date</span>}
              value={dates.dso_recommendation_date || ''}
              onChange={(value) => handleDateChange('dso_recommendation_date', value)}
              description="Date when your Designated School Official recommended OPT"
              optional
            />

            {/* Row 2 Right: STEM Extension Start Date */}
            <DateInput
              id="stem_start_date"
              label={<span className="flex items-center gap-1"><JargonTooltip term="STEM OPT" showIcon={true}>STEM Extension</JargonTooltip> Start Date</span>}
              value={dates.stem_start_date || ''}
              onChange={(value) => handleDateChange('stem_start_date', value)}
              description="Start date of STEM OPT extension (if applicable)"
              optional
            />

            {/* Row 3 Left: OPT Start Date */}
            <DateInput
              id="opt_start_date"
              label={<span className="flex items-center gap-1"><JargonTooltip term="OPT" showIcon={true} /> Start Date</span>}
              value={dates.opt_start_date || ''}
              onChange={(value) => handleDateChange('opt_start_date', value)}
              description="The start date of your OPT period"
              optional
            />
          </div>



          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="min-w-[140px]"
            >
              {isSaving ? 'Saving...' : 'Save Dates'}
            </Button>
            <Button
              variant="outline"
              onClick={loadDates}
              disabled={isSaving}
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Show Employment History only after OPT Start Date is entered */}
      {!!dates.opt_start_date?.trim() && (
        <EmploymentHistoryLog
          employmentSpans={employmentSpans}
          optStartDate={dates.opt_start_date}
          optEndDate={dates.opt_ead_end_date}
          maxUnemploymentDays={dates.stem_start_date ? 150 : 90}
        />
      )}

      {/* Tool Email Notifications Section - 4 Separate Emails */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
            {isPremium ? <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" /> : <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              Daily Reminders (9:00 AM ET)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isPremium
                ? "Each tool sends separate email notifications. Set different emails for each tool below."
                : "Get daily Chrome notifications and email reminders for each tool."
              }
            </p>
          </div>
        </div>

        {isPremium ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(TOOL_INFO) as ToolName[]).map((tool) => {
              const info = TOOL_INFO[tool];
              const isEditing = editingTool === tool;
              const isSaving = emailSaving === tool;
              const hasEmail = !!toolEmails[tool];

              return (
                <div
                  key={tool}
                  className={`p-5 rounded-2xl bg-gradient-to-br ${info.color} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  {/* Top row: Tool info + Status badge */}
                  <div className="flex flex-col items-start sm:flex-row sm:items-start justify-between gap-4 sm:gap-0 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{info.icon}</span>
                      <div>
                        <h4 className="font-bold text-base">{info.label}</h4>
                        <p className="text-sm opacity-90">{info.description}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {hasEmail ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/30 backdrop-blur-sm text-white text-xs font-semibold shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-500/30 backdrop-blur-sm text-white/70 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        Inactive
                      </span>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        type="email"
                        value={toolEmails[tool]}
                        onChange={(e) => updateToolEmail(tool, e.target.value)}
                        placeholder="your.email@example.com"
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/60 text-sm h-11"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleToolEmailSave(tool)}
                          size="sm"
                          className="bg-white/25 hover:bg-white/35 text-white text-sm font-medium px-4 shadow-sm transition-all duration-200"
                          disabled={isSaving}
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          onClick={() => setEditingTool(null)}
                          size="sm"
                          variant="ghost"
                          className="text-white/80 hover:text-white hover:bg-white/15 text-sm transition-all duration-200"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Bottom row: Email + Action buttons */
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 pt-3 border-t border-white/15">
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 opacity-80" />
                        <span className="text-sm font-medium">
                          {toolEmails[tool] || 'No email set'}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        {hasEmail && (
                          <button
                            onClick={() => handleToolEmailStop(tool)}
                            disabled={isSaving}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-red-100 text-sm font-medium shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50"
                          >
                            <BellOff className="w-4 h-4" />
                            <span>{isSaving ? '...' : 'Stop'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => setEditingTool(tool)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white/90 hover:text-white text-sm font-medium shadow-sm hover:shadow transition-all duration-200"
                        >
                          <Pencil className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.keys(TOOL_INFO) as ToolName[]).map((tool) => {
                const info = TOOL_INFO[tool];
                return (
                  <div
                    key={tool}
                    className={`p-3 rounded-lg bg-gradient-to-br ${info.color} text-white text-center`}
                  >
                    <span className="text-xl">{info.icon}</span>
                    <p className="text-xs font-medium mt-1">{info.label}</p>
                  </div>
                );
              })}
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Separate email for each tool
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Daily 9:00 AM ET notifications
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Chrome notifications + email
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Customize alerts per tool
              </li>
            </ul>
            <Button
              onClick={() => setShowPremiumModal(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        )}
      </Card>

      {/* Premium Modal */}
      <PricingModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
}

