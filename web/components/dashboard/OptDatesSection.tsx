"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
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
      const response = await fetch('/api/opt/calculator', {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.ok && result.data) {
          setDates(result.data);
        }
      }
    } catch (err) {
      console.error('Error loading dates:', err);
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
      
      const response = await fetch('/api/opt/dates', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dates),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to save dates');
      }
    } catch (err) {
      setError('An error occurred while saving');
      console.error('Save error:', err);
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
          <div className="space-y-2">
            <Label htmlFor="program_end_date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Program End Date
            </Label>
            <Input
              id="program_end_date"
              type="text"
              placeholder="MM/DD/YYYY"
              value={dates.program_end_date || ''}
              onChange={(e) => handleDateChange('program_end_date', e.target.value)}
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground">
              The date your academic program officially ends
            </p>
          </div>

          {/* DSO Recommendation Date */}
          <div className="space-y-2">
            <Label htmlFor="dso_recommendation_date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              DSO Recommendation Date
            </Label>
            <Input
              id="dso_recommendation_date"
              type="text"
              placeholder="MM/DD/YYYY (Optional)"
              value={dates.dso_recommendation_date || ''}
              onChange={(e) => handleDateChange('dso_recommendation_date', e.target.value)}
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground">
              Date when your Designated School Official recommended OPT
            </p>
          </div>

          {/* OPT Start Date */}
          <div className="space-y-2">
            <Label htmlFor="opt_start_date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              OPT Start Date
            </Label>
            <Input
              id="opt_start_date"
              type="text"
              placeholder="MM/DD/YYYY (Optional)"
              value={dates.opt_start_date || ''}
              onChange={(e) => handleDateChange('opt_start_date', e.target.value)}
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground">
              The start date of your OPT period
            </p>
          </div>

          {/* OPT EAD End Date */}
          <div className="space-y-2">
            <Label htmlFor="opt_ead_end_date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              OPT EAD End Date
            </Label>
            <Input
              id="opt_ead_end_date"
              type="text"
              placeholder="MM/DD/YYYY (Optional)"
              value={dates.opt_ead_end_date || ''}
              onChange={(e) => handleDateChange('opt_ead_end_date', e.target.value)}
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground">
              Employment Authorization Document expiration date for OPT
            </p>
          </div>

          {/* STEM Start Date */}
          <div className="space-y-2">
            <Label htmlFor="stem_start_date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              STEM Extension Start Date
            </Label>
            <Input
              id="stem_start_date"
              type="text"
              placeholder="MM/DD/YYYY (Optional)"
              value={dates.stem_start_date || ''}
              onChange={(e) => handleDateChange('stem_start_date', e.target.value)}
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground">
              Start date of STEM OPT extension (if applicable)
            </p>
          </div>

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

