"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface OptDatesData {
  program_end_date?: string;
  dso_recommendation_date?: string;
  opt_start_date?: string;
  opt_ead_end_date?: string;
  stem_start_date?: string;
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
    <div className="space-y-2 relative">
      <Label htmlFor={id} className="flex items-center gap-2">
        <CalendarIcon className="w-4 h-4" />
        {label}
        {optional && <span className="font-normal text-muted-foreground">(Optional)</span>}
      </Label>
      <div className="relative max-w-md">
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
        <p className="text-xs text-muted-foreground">{description}</p>
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

export function OptDatesSection() {
  const [dates, setDates] = useState<OptDatesData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load existing dates on mount
  useEffect(() => {
    loadDates();
  }, []);

  const loadDates = async () => {
    try {
      setIsLoading(true);
      console.log('📖 Dashboard loading dates...');
      
      // Use same endpoint as extension for perfect sync
      const response = await fetch('/api/opt/calculator', {
        credentials: 'include',
        cache: 'no-store', // Prevent caching to ensure fresh data
      });

      if (response.ok) {
        const result = await response.json();
        if (result.ok && result.data) {
          console.log('✅ Dashboard loaded dates:', result.data);
          setDates(result.data);
        } else {
          console.log('📭 No dates found');
        }
      } else {
        console.error('❌ Failed to load dates:', response.status);
      }
    } catch (err) {
      console.error('❌ Error loading dates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (field: keyof OptDatesData, value: string) => {
    setDates(prev => ({
      ...prev,
      [field]: value
    }));
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
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    for (const [field, value] of Object.entries(dates)) {
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
      };

      console.log('💾 Dashboard saving dates:', payload);
      
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
        console.log('✅ Dashboard saved dates successfully');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        // Reload to show updated data from database
        await loadDates();
      } else {
        console.error('❌ Dashboard failed to save:', result.error);
        setError(result.error || 'Failed to save dates');
      }
    } catch (err) {
      setError('An error occurred while saving');
      console.error('❌ Dashboard save error:', err);
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">OPT Dates</h1>
        <p className="text-muted-foreground">
          Manage your important OPT-related dates. At least one date is required.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Program End Date */}
          <DateInput
            id="program_end_date"
            label="Program End Date"
            value={dates.program_end_date || ''}
            onChange={(value) => handleDateChange('program_end_date', value)}
            description="The date your academic program officially ends"
          />

          {/* DSO Recommendation Date */}
          <DateInput
            id="dso_recommendation_date"
            label="DSO Recommendation Date"
            value={dates.dso_recommendation_date || ''}
            onChange={(value) => handleDateChange('dso_recommendation_date', value)}
            description="Date when your Designated School Official recommended OPT"
            optional
          />

          {/* OPT Start Date */}
          <DateInput
            id="opt_start_date"
            label="OPT Start Date"
            value={dates.opt_start_date || ''}
            onChange={(value) => handleDateChange('opt_start_date', value)}
            description="The start date of your OPT period"
            optional
          />

          {/* OPT EAD End Date */}
          <DateInput
            id="opt_ead_end_date"
            label="OPT EAD End Date"
            value={dates.opt_ead_end_date || ''}
            onChange={(value) => handleDateChange('opt_ead_end_date', value)}
            description="Employment Authorization Document expiration date for OPT"
            optional
          />

          {/* STEM Start Date */}
          <DateInput
            id="stem_start_date"
            label="STEM Extension Start Date"
            value={dates.stem_start_date || ''}
            onChange={(value) => handleDateChange('stem_start_date', value)}
            description="Start date of STEM OPT extension (if applicable)"
            optional
          />

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
              Dates saved successfully!
            </div>
          )}

          {/* Save Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="min-w-[120px]"
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

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <span className="text-blue-600 dark:text-blue-400">ℹ️</span>
          Important Information
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• All dates must be in MM/DD/YYYY format</li>
          <li>• At least one date is required to save</li>
          <li>• You can update these dates at any time</li>
          <li>• These dates sync automatically with your browser extension</li>
        </ul>
      </Card>
    </div>
  );
}

