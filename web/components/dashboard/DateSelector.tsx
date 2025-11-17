"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Calendar as CalendarIcon } from "lucide-react";

interface OptDatesData {
  program_end_date?: string | null;
  dso_recommendation_date?: string | null;
  opt_start_date?: string | null;
  opt_ead_end_date?: string | null;
  stem_start_date?: string | null;
  last_updated_field?: string | null;
}

const DATE_OPTIONS = [
  { value: 'program_end_date', label: 'Program End Date' },
  { value: 'dso_recommendation_date', label: 'DSO Recommendation Date' },
  { value: 'opt_start_date', label: 'OPT Start Date' },
  { value: 'opt_ead_end_date', label: 'Current OPT EAD End Date' },
  { value: 'stem_start_date', label: 'STEM Extension Start Date' },
];

export function DateSelector() {
  const [dates, setDates] = useState<OptDatesData>({});
  const [selectedDateType, setSelectedDateType] = useState<string>('program_end_date');
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [lastUpdatedFieldFromAPI, setLastUpdatedFieldFromAPI] = useState<string | null>(null);

  // Load dates from API
  useEffect(() => {
    loadDates();
    
    // Poll for updates every 3 seconds to stay in sync
    const interval = setInterval(loadDates, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadDates = async () => {
    try {
      const response = await fetch('/api/opt/calculator', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.ok && result.data) {
          setDates(result.data);
          
          const newLastUpdatedField = result.data.last_updated_field;
          
          // Auto-select logic:
          // 1. If we have a last_updated_field from API
          // 2. AND it's different from what we previously had
          // 3. THEN auto-select it (this means user saved a date on opt-dates page)
          if (newLastUpdatedField) {
            // If this is a NEW last_updated_field (different from before), auto-select it
            if (lastUpdatedFieldFromAPI !== newLastUpdatedField) {
              console.log('📊 Last updated field changed:', lastUpdatedFieldFromAPI, '→', newLastUpdatedField);
              setSelectedDateType(newLastUpdatedField);
              setLastUpdatedFieldFromAPI(newLastUpdatedField);
            }
          } else if (!lastUpdatedFieldFromAPI) {
            // First load and no last_updated_field, set it anyway
            setLastUpdatedFieldFromAPI(newLastUpdatedField);
          }
        }
      }
    } catch (err) {
      console.error('Error loading dates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChange = (value: string) => {
    setSelectedDateType(value);
    setIsDropdownOpen(false);
    // Don't update lastUpdatedFieldFromAPI here - we only update it from API responses
  };

  const selectedOption = DATE_OPTIONS.find(opt => opt.value === selectedDateType);
  const selectedDateValue = dates[selectedDateType as keyof OptDatesData];
  const selectedDate = selectedDateValue && selectedDateValue !== 'null' ? selectedDateValue : '—';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading dates...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      {/* Left Side - Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Choose date type
        </label>
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-left flex items-center justify-between hover:border-slate-400 dark:hover:border-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="text-slate-900 dark:text-white">
              {selectedOption?.label || 'Select a date'}
            </span>
            <ChevronDown 
              className={`w-5 h-5 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
              {DATE_OPTIONS.map((option) => {
                const isLastUpdated = lastUpdatedFieldFromAPI === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelectChange(option.value)}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between gap-2 ${
                      selectedDateType === option.value 
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-medium' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{option.label}</span>
                    {isLastUpdated && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm">
                        Latest
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Close dropdown when clicking outside */}
        {isDropdownOpen && (
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => setIsDropdownOpen(false)}
          />
        )}
      </div>

      {/* Right Side - Display Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Date value
        </label>
        <div className="relative">
          <div className="px-4 py-3 pr-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
            <p className="text-lg font-semibold text-slate-900 dark:text-white">
              {selectedDate}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {selectedOption?.label}
            </p>
          </div>
          
          {/* Calendar Icon */}
          <a
            href="/dashboard/opt-dates"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
            title="Edit this date"
          >
            <CalendarIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}

