"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, Mail, Crown, Edit, CheckCircle2, Bell, BellOff, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PricingModal } from "@/components/pricing/PricingModal";

interface OptDatesData {
  program_end_date?: string;
  dso_recommendation_date?: string;
  opt_start_date?: string;
  opt_ead_end_date?: string;
  stem_start_date?: string;
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
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  optional?: boolean;
}

function DateInput({ id, label, value, onChange, placeholder = "MM/DD/YYYY", description, optional = false }: DateInputProps) {
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
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          aria-label="Open calendar"
        >
          <CalendarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
        
        {showCalendar && (
          <div ref={calendarRef} className="absolute top-full mt-2 z-50">
            <DatePicker value={value} onSelect={handleDateSelect} />
          </div>
        )}
      </div>
      {description && (
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
    <Card className="p-4 w-80 shadow-lg">
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
            className={`p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
              isToday(day) ? 'bg-blue-100 dark:bg-blue-900 font-bold' : ''
            } ${
              isSelected(day) ? 'bg-blue-600 text-white hover:bg-blue-700' : ''
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
  const [dates, setDates] = useState<OptDatesData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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

  // Load existing dates and premium status on mount
  useEffect(() => {
    loadDates();
    checkPremiumStatus();
    loadToolEmails();
  }, []);
  
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
      if (field === 'program_end_date' && value) {
        // When Program End Date is updated, also update DSO Recommendation Date
        newDates.dso_recommendation_date = value;
      } else if (field === 'dso_recommendation_date' && value) {
        // When DSO Recommendation Date is updated, also update Program End Date
        newDates.program_end_date = value;
      }
      
      // Logic 2: OPT Start Date → OPT EAD End Date (+ 365 days = 1 year)
      // OPT period is 12 months, so end date is 365 days after start date
      if (field === 'opt_start_date' && value) {
        const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
        if (dateRegex.test(value)) {
          // Calculate OPT EAD End Date as OPT Start Date + 364 days (1 year minus 1 day)
          // Example: July 15, 2025 → July 14, 2026
          const endDate = addDaysToDate(value, 364);
          if (endDate) {
            newDates.opt_ead_end_date = endDate;
          }
        }
      }
      
      return newDates;
    });
    setLastModifiedField(field); // Track which field user just modified
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    // Validate: at least one date must be filled
    const hasAtLeastOneDate = Object.values(dates).some(date => date && date.trim() !== '');
    
    if (!hasAtLeastOneDate) {
      setError('Please enter at least one date');
      return;
    }

    // Validate date format (MM/DD/YYYY) for filled fields
    // Skip metadata fields like last_updated_field
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    const dateFields = ['program_end_date', 'dso_recommendation_date', 'opt_start_date', 'opt_ead_end_date', 'stem_start_date'];
    
    for (const field of dateFields) {
      const value = dates[field as keyof OptDatesData];
      if (value && value.trim() !== '' && !dateRegex.test(value)) {
        setError(`Invalid date format for ${field.replace(/_/g, ' ')}. Use MM/DD/YYYY`);
        return;
      }
    }

    try {
      setIsSaving(true);
      setError(null);
      
      // Clean payload: convert empty strings to null
      const payload = {
        program_end_date: dates.program_end_date?.trim() || null,
        dso_recommendation_date: dates.dso_recommendation_date?.trim() || null,
        opt_start_date: dates.opt_start_date?.trim() || null,
        opt_ead_end_date: dates.opt_ead_end_date?.trim() || null,
        stem_start_date: dates.stem_start_date?.trim() || null,
        _lastModifiedField: lastModifiedField, // Tell API which field was modified
      };

      
      // Use same endpoint as extension for perfect sync
      const response = await fetch('/api/opt/calculator', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        cache: 'no-store', // Prevent caching
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        // Reload to show updated data from database
        await loadDates();
      } else {
        setError(result.error || 'Failed to save dates');
      }
    } catch (err) {
      setError('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
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
              label="OPT EAD End Date"
              value={dates.opt_ead_end_date || ''}
              onChange={(value) => handleDateChange('opt_ead_end_date', value)}
              description="Employment Authorization Document expiration date for OPT"
              optional
            />

            {/* Row 2 Left: DSO Recommendation Date */}
            <DateInput
              id="dso_recommendation_date"
              label="DSO Recommendation Date"
              value={dates.dso_recommendation_date || ''}
              onChange={(value) => handleDateChange('dso_recommendation_date', value)}
              description="Date when your Designated School Official recommended OPT"
              optional
            />

            {/* Row 2 Right: STEM Extension Start Date */}
            <DateInput
              id="stem_start_date"
              label="STEM Extension Start Date"
              value={dates.stem_start_date || ''}
              onChange={(value) => handleDateChange('stem_start_date', value)}
              description="Start date of STEM OPT extension (if applicable)"
              optional
            />

            {/* Row 3 Left: OPT Start Date */}
            <DateInput
              id="opt_start_date"
              label="OPT Start Date"
              value={dates.opt_start_date || ''}
              onChange={(value) => handleDateChange('opt_start_date', value)}
              description="The start date of your OPT period"
              optional
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300">
              ✓ Dates saved successfully!
            </div>
          )}

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

      {/* Tool Email Notifications Section - Clean Professional Design */}
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Email Notifications
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Daily reminders at 9:00 AM ET
                </p>
              </div>
            </div>
            {!isPremium && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <Crown className="w-3 h-3" />
                Premium
              </span>
            )}
          </div>
        </div>

        {isPremium ? (
          <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
            <div className="space-y-3">
              {(Object.keys(TOOL_INFO) as ToolName[]).map((tool) => {
                const info = TOOL_INFO[tool];
                const isEditing = editingTool === tool;
                const isSaving = emailSaving === tool;
                const hasEmail = !!toolEmails[tool];
                
                return (
                  <div 
                    key={tool}
                    className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Tool Header Row */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{info.icon}</span>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{info.label}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{info.description}</p>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      {!isEditing && (
                        <div className="flex items-center gap-2">
                          {hasEmail ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                              Not set
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Email Row / Edit Form */}
                    <div className="px-4 pb-3">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Input
                            type="email"
                            value={toolEmails[tool]}
                            onChange={(e) => updateToolEmail(tool, e.target.value)}
                            placeholder="your.email@example.com"
                            className="flex-1 h-9 text-sm"
                            autoFocus
                          />
                          <Button 
                            onClick={() => handleToolEmailSave(tool)}
                            size="sm"
                            className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white"
                            disabled={isSaving}
                          >
                            {isSaving ? 'Saving...' : 'Save'}
                          </Button>
                          <Button 
                            onClick={() => setEditingTool(null)}
                            size="sm"
                            variant="outline"
                            className="h-9 px-3"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="truncate max-w-[200px]">
                              {toolEmails[tool] || 'No email configured'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {hasEmail && (
                              <Button
                                onClick={() => handleToolEmailStop(tool)}
                                size="sm"
                                variant="ghost"
                                className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                disabled={isSaving}
                              >
                                <BellOff className="w-3.5 h-3.5 mr-1" />
                                Stop
                              </Button>
                            )}
                            <Button
                              onClick={() => setEditingTool(tool)}
                              size="sm"
                              variant="ghost"
                              className="h-8 px-3 text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                            >
                              <Edit className="w-3.5 h-3.5 mr-1" />
                              {hasEmail ? 'Edit' : 'Set up'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              Each tool can have a different email address for notifications
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <BellOff className="w-6 h-6 text-gray-400" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Unlock Email Notifications
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-xs mx-auto">
                Get daily reminders for filing deadlines, sent directly to your inbox at 9:00 AM ET.
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {(Object.keys(TOOL_INFO) as ToolName[]).map((tool) => {
                  const info = TOOL_INFO[tool];
                  return (
                    <span 
                      key={tool}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400"
                    >
                      {info.icon} {info.label}
                    </span>
                  );
                })}
              </div>
              
              <Button
                onClick={() => setShowPremiumModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
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

