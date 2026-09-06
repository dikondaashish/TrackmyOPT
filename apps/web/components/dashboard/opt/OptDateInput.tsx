"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

/** Add days to an MM/DD/YYYY date string; returns '' on invalid input. */
export function addDaysToDate(dateStr: string, days: number): string {
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

export function DateInput({ id, label, value, onChange, placeholder = "MM/DD/YYYY", description, optional = false, error }: DateInputProps) {
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
          className="min-h-11 min-w-11 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="font-semibold">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button
          type="button"
          onClick={handleNextMonth}
          className="min-h-11 min-w-11 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
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
            className={`p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors max-md:min-h-10 max-md:min-w-10 max-md:flex max-md:items-center max-md:justify-center ${isToday(day) ? 'bg-blue-100 dark:bg-blue-900 font-bold' : ''
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
