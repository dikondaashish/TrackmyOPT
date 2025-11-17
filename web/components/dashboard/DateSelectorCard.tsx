"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DateOption {
  key: string;
  label: string;
  value: string | null;
  optional: boolean;
}

interface DateSelectorCardProps {
  programEndDate?: string;
  dsoRecommendationDate?: string;
  optStartDate?: string;
  optEadEndDate?: string;
  stemStartDate?: string;
}

export function DateSelectorCard({
  programEndDate,
  dsoRecommendationDate,
  optStartDate,
  optEadEndDate,
  stemStartDate,
}: DateSelectorCardProps) {
  const [selectedDateKey, setSelectedDateKey] = useState<string>("program_end_date");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mostRecentDate, setMostRecentDate] = useState<string>("program_end_date");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dateOptions: DateOption[] = [
    {
      key: "program_end_date",
      label: "Program End Date",
      value: programEndDate || null,
      optional: false,
    },
    {
      key: "dso_recommendation_date",
      label: "DSO Recommendation Date",
      value: dsoRecommendationDate || null,
      optional: true,
    },
    {
      key: "opt_start_date",
      label: "OPT Start Date",
      value: optStartDate || null,
      optional: true,
    },
    {
      key: "opt_ead_end_date",
      label: "OPT EAD End Date",
      value: optEadEndDate || null,
      optional: true,
    },
    {
      key: "stem_start_date",
      label: "STEM Extension Start Date",
      value: stemStartDate || null,
      optional: true,
    },
  ];

  // Fetch the most recently updated date from the API
  useEffect(() => {
    const fetchMostRecentDate = async () => {
      try {
        const response = await fetch('/api/opt/calculator', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (response.ok) {
          const result = await response.json();
          if (result.ok && result.mostRecentField) {
            setMostRecentDate(result.mostRecentField);
            setSelectedDateKey(result.mostRecentField);
          }
        }
      } catch (error) {
        console.error('Error fetching most recent date:', error);
      }
    };

    fetchMostRecentDate();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const selectedOption = dateOptions.find(opt => opt.key === selectedDateKey);

  return (
    <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl">✏️</span>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Your Dates</h3>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Date List */}
        <div className="flex-1">
          <Card className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">Date Fields</h4>
            </div>
            
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {dateOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSelectedDateKey(option.key)}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    selectedDateKey === option.key
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{option.label}</span>
                    {option.key === mostRecentDate && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                        Recently Updated
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Dropdown Selector */}
          <div className="mt-4 relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-between text-slate-700 dark:text-slate-300 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
            >
              <span className="text-sm">
                {selectedOption ? selectedOption.label : 'Select a date'}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isDropdownOpen && (
              <Card className="absolute top-full left-0 right-0 mt-2 z-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg max-h-60 overflow-y-auto">
                {dateOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => {
                      setSelectedDateKey(option.key);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                  >
                    {option.label}
                    {option.optional && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">(Optional)</span>
                    )}
                  </button>
                ))}
              </Card>
            )}
          </div>
        </div>

        {/* Right Side: Selected Date Value */}
        <div className="flex-1">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 h-full">
            <div className="flex flex-col justify-center h-full">
              <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                {selectedOption?.label}
                {selectedOption?.optional && (
                  <span className="text-xs ml-2">(Optional)</span>
                )}
              </h4>
              
              {selectedOption?.value ? (
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {selectedOption.value}
                </div>
              ) : (
                <div className="text-lg text-slate-400 dark:text-slate-500 italic">
                  No date set
                </div>
              )}

              <button
                onClick={() => window.location.href = '/dashboard/opt-dates'}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Edit Dates
              </button>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  );
}

