"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar, GraduationCap, Clock, CheckCircle } from "lucide-react";

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
    <div className="bg-card border border-border rounded-xl p-8 hover:shadow-md transition-all duration-200">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">Welcome to TrackMyOPT!</h2>
            <p className="text-muted-foreground text-sm">Let's get started by adding your OPT dates</p>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-card-foreground mb-2">
              We need a few dates to calculate your filing windows and track your OPT status.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground font-medium mb-2">Required Information:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                Program End Date
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                Current OPT EAD End Date
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                OPT Start Date
              </li>
            </ul>
          </div>
          
          <div>
            <p className="text-muted-foreground font-medium mb-2">Optional:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground"></div>
                DSO Recommendation Date
              </li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground">Your Dates</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="programEnd" className="text-sm font-medium">Program End Date *</Label>
            <Input
              id="programEnd"
              type="date"
              value={dates.programEnd}
              onChange={(e) => setDates({ ...dates, programEnd: e.target.value })}
              required
              className="bg-background border-border focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dsoRecommendation" className="text-sm font-medium">DSO Recommendation Date (Optional)</Label>
            <Input
              id="dsoRecommendation"
              type="date"
              value={dates.dsoRecommendation}
              onChange={(e) => setDates({ ...dates, dsoRecommendation: e.target.value })}
              className="bg-background border-border focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="optEadEnd" className="text-sm font-medium">Current OPT EAD End Date *</Label>
            <Input
              id="optEadEnd"
              type="date"
              value={dates.optEadEnd}
              onChange={(e) => setDates({ ...dates, optEadEnd: e.target.value })}
              required
              className="bg-background border-border focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="optStart" className="text-sm font-medium">OPT Start Date *</Label>
            <Input
              id="optStart"
              type="date"
              value={dates.optStart}
              onChange={(e) => setDates({ ...dates, optStart: e.target.value })}
              required
              className="bg-background border-border focus:border-primary"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
          <Checkbox
            id="stemEligible"
            checked={stemEligible}
            onCheckedChange={(checked) => setStemEligible(!!checked)}
          />
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            <Label htmlFor="stemEligible" className="cursor-pointer text-sm font-medium">
              I'm STEM-eligible
            </Label>
          </div>
        </div>

        <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
          Save Dates
        </Button>
      </form>
    </div>
  );
}

