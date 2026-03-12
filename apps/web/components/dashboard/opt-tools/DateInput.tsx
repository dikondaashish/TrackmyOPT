"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";

interface DateInputProps {
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  error?: string;
  required?: boolean;
}

function DatePicker({ value, onSelect }: { value: string; onSelect: (date: string) => void }) {
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts.map(Number);
      if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
        return new Date(year, month - 1, day);
      }
    }
    return null;
  };

  const formatDate = (date: Date): string => {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}/${date.getFullYear()}`;
  };

  const [currentMonth, setCurrentMonth] = useState(() => parseDate(value) || new Date());
  const selectedDate = parseDate(value);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-72">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold text-gray-900 dark:text-white">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
        {days.map((day, i) => {
          const isSelected = selectedDate && day === selectedDate.getDate() && 
            currentMonth.getMonth() === selectedDate.getMonth() &&
            currentMonth.getFullYear() === selectedDate.getFullYear();
          return (
            <button
              key={i}
              type="button"
              disabled={!day}
              onClick={() => {
                if (day) {
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  onSelect(formatDate(date));
                }
              }}
              className={`
                p-2 text-sm rounded-lg transition-colors
                ${!day ? 'invisible' : ''}
                ${isSelected 
                  ? 'bg-blue-600 text-white font-medium' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateInput({ label, value, onChange, description, error, required }: DateInputProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showCalendar && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const calendarWidth = 288; // w-72 = 18rem = 288px
      const calendarHeight = 320; // approximate height
      
      let left = rect.right - calendarWidth;
      let top = rect.bottom + 8;
      
      // Adjust if calendar would go off screen
      if (left < 8) left = 8;
      if (left + calendarWidth > window.innerWidth - 8) {
        left = window.innerWidth - calendarWidth - 8;
      }
      if (top + calendarHeight > window.innerHeight - 8) {
        top = rect.top - calendarHeight - 8;
      }
      
      setCalendarPosition({ top, left });
    }
  }, [showCalendar]);

  return (
    <div ref={containerRef} className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="MM/DD/YYYY"
          className={`
            w-full px-4 py-3 pr-12 rounded-xl border text-sm
            bg-white dark:bg-gray-800 
            ${error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'}
            focus:outline-none focus:ring-2
            transition-colors
          `}
        />
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Calendar className="w-5 h-5 text-gray-500" />
        </button>
        {showCalendar && mounted && createPortal(
          <div 
            ref={calendarRef}
            className="fixed z-[9999]"
            style={{ top: calendarPosition.top, left: calendarPosition.left }}
          >
            <DatePicker 
              value={value} 
              onSelect={(date) => {
                onChange(date);
                setShowCalendar(false);
              }} 
            />
          </div>,
          document.body
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
