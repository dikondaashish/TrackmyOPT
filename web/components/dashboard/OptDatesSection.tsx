"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, Mail, Crown, Edit, CheckCircle2 } from "lucide-react";
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

export function OptDatesSection() {
  const [dates, setDates] = useState<OptDatesData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lastModifiedField, setLastModifiedField] = useState<string | null>(null);
  
  // Premium & Email states
  const [isPremium, setIsPremium] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Load existing dates and premium status on mount
  useEffect(() => {
    loadDates();
    checkPremiumStatus();
    loadNotificationEmail();
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
  
  const loadNotificationEmail = async () => {
    try {
      const response = await fetch('/api/user/notification-email', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setNotificationEmail(data.email || '');
      }
    } catch {
      // Silently fail
    }
  };
  
  const handleEmailSave = async () => {
    if (!notificationEmail || !notificationEmail.includes('@')) {
      return;
    }
    
    try {
      setEmailSaving(true);
      const response = await fetch('/api/user/notification-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: notificationEmail }),
      });
      
      if (response.ok) {
        setIsEditingEmail(false);
      }
    } catch {
      // Silently fail
    } finally {
      setEmailSaving(false);
    }
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

      {/* Email Notifications Section */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
            {isPremium ? <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" /> : <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
          </div>
          <div className="flex-1">
            {isPremium ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">OPT Date Reminders</h3>
                  {!isEditingEmail && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingEmail(true)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingEmail ? (
                  <div className="space-y-3">
                    <Input
                      type="email"
                      value={notificationEmail}
                      onChange={(e) => setNotificationEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="bg-white dark:bg-gray-900"
                      aria-label="Notification email address"
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleEmailSave} 
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700"
                        disabled={emailSaving}
                      >
                        {emailSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button onClick={() => setIsEditingEmail(false)} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {notificationEmail || 'No email set'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      📧 Get reminders for important OPT deadlines
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Premium Feature: OPT Date Reminders
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Get notified before important OPT deadlines. Never miss a filing window or expiration date!
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Email reminders before deadlines
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    OPT EAD expiration alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    STEM extension reminders
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Unemployment day warnings
                  </li>
                </ul>
                <Button
                  onClick={() => setShowPremiumModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Premium Modal */}
      <PricingModal 
        open={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)} 
      />
    </div>
  );
}

