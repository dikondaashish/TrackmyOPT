"use client";
import { DateSelector } from "./DateSelector";

export function OnboardingCard() {
  return (
    <div className="bg-card hover:bg-card/80 border border-border rounded-xl p-8 transition-colors duration-200">
      {/* 1. Welcome Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🎉</span>
          <h2 className="text-2xl font-bold tracking-tight">Welcome to TrackMyOPT!</h2>
        </div>
        <p className="text-muted-foreground">Track your OPT status and stay compliant</p>
      </div>

      {/* 2. Info Box - What We Track */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
        <p className="text-sm mb-4 font-medium">
          🎯 Your dates are displayed below. Click <strong>"Edit Dates →"</strong> to update them.
        </p>
        
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-foreground">What we track:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>OPT filing windows and deadlines</li>
            <li>Unemployment days remaining</li>
            <li>STEM extension eligibility</li>
            <li>Important date reminders</li>
          </ul>
        </div>
      </div>

      {/* 3. Date Selector Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗓️</span>
            <h3 className="text-lg font-semibold">Your Dates</h3>
          </div>
          <a
            href="/opt-dates"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Edit Dates →
          </a>
        </div>
        <DateSelector />
      </div>
    </div>
  );
}
