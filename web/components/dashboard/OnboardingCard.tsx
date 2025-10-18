"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export function OnboardingCard() {
  const [stemEligible, setStemEligible] = useState(false);
  const [dates, setDates] = useState({
    programEnd: "",
    dsoRecommendation: "",
    optEadEnd: "",
    optStart: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dates submitted:", dates, "STEM Eligible:", stemEligible);
  };

  return (
    <div className="bg-card hover:bg-card/80 border border-border rounded-xl p-8 transition-colors duration-200">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🎉</span>
          <h2 className="text-2xl font-bold tracking-tight">Welcome to TrackMyOPT!</h2>
        </div>
        <p className="text-muted-foreground">Let's get started by adding your OPT dates</p>
      </div>

      <div className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
        <p className="text-sm mb-4 font-medium">
          We need a few dates to calculate your filing windows and track your OPT status.
        </p>
        
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-foreground">Required Information:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Program End Date</li>
            <li>Current OPT EAD End Date</li>
            <li>OPT Start Date</li>
          </ul>
          
          <p className="font-semibold text-foreground pt-2">Optional:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>DSO Recommendation Date (if received)</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">✏️</span>
          <h3>Your Dates</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="programEnd">Program End Date *</Label>
            <Input
              id="programEnd"
              type="date"
              value={dates.programEnd}
              onChange={(e) => setDates({ ...dates, programEnd: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dsoRecommendation">DSO Recommendation Date (Optional)</Label>
            <Input
              id="dsoRecommendation"
              type="date"
              value={dates.dsoRecommendation}
              onChange={(e) => setDates({ ...dates, dsoRecommendation: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="optEadEnd">Current OPT EAD End Date *</Label>
            <Input
              id="optEadEnd"
              type="date"
              value={dates.optEadEnd}
              onChange={(e) => setDates({ ...dates, optEadEnd: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="optStart">OPT Start Date *</Label>
            <Input
              id="optStart"
              type="date"
              value={dates.optStart}
              onChange={(e) => setDates({ ...dates, optStart: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="stemEligible"
            checked={stemEligible}
            onCheckedChange={(checked) => setStemEligible(!!checked)}
          />
          <Label htmlFor="stemEligible" className="cursor-pointer">
            I'm STEM-eligible
          </Label>
        </div>

        <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/30">
          Save Dates
        </Button>
      </form>
    </div>
  );
}

