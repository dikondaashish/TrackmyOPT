"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { Calendar, ChevronLeft, ChevronRight, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { parseDate, formatDateInput, formatDateDisplay } from "@/lib/optToolsDesign";

// ============================================================================
// DATE PICKER
// ============================================================================

interface DatePickerProps {
  value: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

export function DatePicker({ value, onSelect, onClose }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => parseDate(value) || new Date());
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  const selectedDate = parseDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isSelected = (day: number) => {
    return selectedDate && 
      day === selectedDate.getDate() && 
      currentMonth.getMonth() === selectedDate.getMonth() && 
      currentMonth.getFullYear() === selectedDate.getFullYear();
  };

  const isToday = (day: number) => {
    return day === today.getDate() && 
      currentMonth.getMonth() === today.getMonth() && 
      currentMonth.getFullYear() === today.getFullYear();
  };

  return (
    <div className="absolute top-full mt-2 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 p-4 w-80 animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <span className="font-semibold text-gray-900 dark:text-white">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-gray-400 font-medium py-2">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => (
          <button
            key={i}
            disabled={!day}
            onClick={() => {
              if (day) {
                onSelect(formatDateInput(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)));
                onClose();
              }
            }}
            className={`
              p-2.5 text-sm rounded-lg transition-all
              ${!day ? 'invisible' : ''}
              ${isSelected(day!) ? 'bg-blue-600 text-white font-semibold shadow-md' : ''}
              ${!isSelected(day!) && isToday(day!) ? 'ring-2 ring-blue-500 ring-inset' : ''}
              ${!isSelected(day!) ? 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300' : ''}
            `}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Today Button */}
      <button
        onClick={() => {
          onSelect(formatDateInput(new Date()));
          onClose();
        }}
        className="w-full mt-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium"
      >
        Today
      </button>
    </div>
  );
}

// ============================================================================
// DATE INPUT FIELD
// ============================================================================

interface DateInputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export function DateInputField({ 
  label, 
  value, 
  onChange, 
  description, 
  required = false,
  error,
  disabled = false
}: DateInputFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{description}</p>
      )}
      <div className="relative">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="MM/DD/YYYY"
          disabled={disabled}
          className={`
            pr-12 h-11 text-base rounded-lg
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-slate-600'}
            ${disabled ? 'bg-gray-50 dark:bg-slate-800 cursor-not-allowed' : ''}
          `}
        />
        <button
          type="button"
          onClick={() => !disabled && setShowPicker(!showPicker)}
          disabled={disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <Calendar className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {showPicker && (
        <DatePicker value={value} onSelect={onChange} onClose={() => setShowPicker(false)} />
      )}
    </div>
  );
}

// ============================================================================
// INFO CARD
// ============================================================================

interface InfoCardProps {
  title: string;
  description: string;
  variant?: 'info' | 'warning' | 'success';
  className?: string;
}

export function InfoCard({ title, description, variant = 'info', className = '' }: InfoCardProps) {
  const variants = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400',
      titleColor: 'text-blue-900 dark:text-blue-100',
      textColor: 'text-blue-700 dark:text-blue-300',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      iconBg: 'bg-amber-100 dark:bg-amber-900/50',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 dark:text-amber-400',
      titleColor: 'text-amber-900 dark:text-amber-100',
      textColor: 'text-amber-700 dark:text-amber-300',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      iconBg: 'bg-green-100 dark:bg-green-900/50',
      icon: CheckCircle,
      iconColor: 'text-green-600 dark:text-green-400',
      titleColor: 'text-green-900 dark:text-green-100',
      textColor: 'text-green-700 dark:text-green-300',
    },
  };

  const v = variants[variant];
  const Icon = v.icon;

  return (
    <div className={`p-4 rounded-xl ${v.bg} border ${v.border} ${className}`}>
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-lg ${v.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${v.iconColor}`} />
        </div>
        <div>
          <h4 className={`font-semibold ${v.titleColor} mb-1`}>{title}</h4>
          <p className={`text-sm ${v.textColor}`}>{description}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// RESULT CARD
// ============================================================================

interface ResultCardProps {
  icon: string;
  label: string;
  value: string;
  subtext?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function ResultCard({ icon, label, value, subtext, variant = 'default' }: ResultCardProps) {
  const variants = {
    default: 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700',
    success: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800',
    warning: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800',
    danger: 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800',
  };

  return (
    <div className={`p-5 rounded-xl border ${variants[variant]} transition-all hover:shadow-md`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      {subtext && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>}
    </div>
  );
}

// ============================================================================
// COUNTDOWN DISPLAY
// ============================================================================

interface CountdownDisplayProps {
  days: number;
  label: string;
  sublabel: string;
  size?: 'default' | 'large';
}

export function CountdownDisplay({ days, label, sublabel, size = 'default' }: CountdownDisplayProps) {
  const getGradient = () => {
    if (days <= 7) return 'from-red-500 to-rose-600';
    if (days <= 30) return 'from-amber-500 to-orange-600';
    return 'from-green-500 to-emerald-600';
  };

  const sizeClasses = size === 'large' 
    ? 'p-10 rounded-3xl' 
    : 'p-6 rounded-2xl';
  
  const numberSize = size === 'large' ? 'text-7xl' : 'text-5xl';

  return (
    <div className={`bg-gradient-to-br ${getGradient()} text-white text-center shadow-xl ${sizeClasses}`}>
      <p className="text-sm font-medium opacity-90 mb-2">{label}</p>
      <p className={`${numberSize} font-black mb-2 tracking-tight`}>{days}</p>
      <p className="text-base font-medium opacity-90">{sublabel}</p>
    </div>
  );
}

// ============================================================================
// PROGRESS BAR
// ============================================================================

interface ProgressBarProps {
  used: number;
  max: number;
  label: string;
  showPercentage?: boolean;
}

export function ProgressBar({ used, max, label, showPercentage = false }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (used / max) * 100));
  
  const getColor = () => {
    if (percentage >= 89) return 'bg-red-500';
    if (percentage >= 67) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {used} / {max} days {showPercentage && `(${Math.round(percentage)}%)`}
        </span>
      </div>
      <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

// ============================================================================
// EMAIL DISPLAY SECTION
// ============================================================================

interface EmailDisplayProps {
  email: string;
  toolColor: string;
  iconBgColor: string;
}

export function EmailDisplay({ email, toolColor, iconBgColor }: EmailDisplayProps) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${iconBgColor} flex items-center justify-center`}>
          <span className={`text-lg ${toolColor}`}>📧</span>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email notifications</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{email || 'Not configured'}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TOOL SECTION WRAPPER
// ============================================================================

interface ToolSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function ToolSection({ title, children, className = '' }: ToolSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      )}
      {children}
    </div>
  );
}
