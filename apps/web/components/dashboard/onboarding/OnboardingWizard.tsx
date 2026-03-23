"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, Calendar, ChevronRight, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DateInput } from "../opt-tools/DateInput";
import { JargonTooltip } from "@/components/ui/jargon-tooltip";

type WizardStep = 'welcome' | 'course' | 'status' | 'dates' | 'finishing';

const STEM_KEYWORDS = [
  'computer', 'software', 'engineering', 'math', 'science', 'technology', 
  'cyber', 'data', 'information', 'analytics', 'statistics', 'physics', 
  'chemistry', 'biology', 'robotics', 'artificial intelligence', 'ai', 
  'quantitative', 'quant', 'actuarial', 'biomedical', 'bioengineering', 
  'mechatronics', 'automation', 'econometrics', 'informatics'
];

const COMMON_MAJORS = [
  "Computer Science", "Software Engineering", "Computer Engineering", 
  "Information Technology", "Information Systems", "Data Science", 
  "Data Analytics", "Business Analytics", "Cybersecurity", 
  "Artificial Intelligence", "Machine Learning", "Electrical Engineering", 
  "Mechanical Engineering", "Civil Engineering", "Industrial Engineering", 
  "Biomedical Engineering", "Aerospace Engineering", "Chemical Engineering", 
  "Mathematics", "Applied Mathematics", "Statistics", "Physics", 
  "Chemistry", "Biology", "Biotechnology", "Business Administration", 
  "Finance", "Accounting", "Marketing", "Economics", "Psychology", 
  "Nursing", "Communications", "Graphic Design", "Architecture"
];

type JourneyStatus = 'applying_opt' | 'on_opt' | 'stem_opt' | null;

interface OnboardingWizardProps {
  isOpen: boolean;
  /** Called after dates are saved successfully (may reload dashboard). */
  onComplete: () => void;
  /** Called when user skips without saving — must not full-reload or wizard reopens with no opt_status. */
  onSkip?: () => void;
}

export function OnboardingWizard({ isOpen, onComplete, onSkip }: OnboardingWizardProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [step, setStep] = useState<WizardStep>('welcome');
  const [status, setStatus] = useState<JourneyStatus>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Education state
  const [degreeLevel, setDegreeLevel] = useState<string>("Master's");
  const [majorName, setMajorName] = useState<string>("");
  const [isStemEligible, setIsStemEligible] = useState<boolean>(false);

  // Date states
  const [programEndDate, setProgramEndDate] = useState("");
  const [optStartDate, setOptStartDate] = useState("");
  const [optEndDate, setOptEndDate] = useState("");
  const [stemStartDate, setStemStartDate] = useState("");

  const [showDropdown, setShowDropdown] = useState(false);
  const filteredMajors = majorName 
    ? COMMON_MAJORS.filter(m => m.toLowerCase().includes(majorName.toLowerCase()))
    : COMMON_MAJORS;

  const checkStemEligibility = (major: string) => {
    if (!major) return false;
    const lowerMajor = major.toLowerCase();
    return STEM_KEYWORDS.some(keyword => lowerMajor.includes(keyword));
  };

  const handleMajorChange = (val: string) => {
    setMajorName(val);
    setIsStemEligible(checkStemEligibility(val));
  };

  const handleNext = () => {
    if (step === 'welcome') setStep('course');
    else if (step === 'course') {
      if (!majorName.trim()) {
        toast({ title: "Please enter your major", variant: "destructive" });
        return;
      }
      setStep('status');
    }
    else if (step === 'status') {
      if (!status) {
        toast({ title: "Please select an option", variant: "destructive" });
        return;
      }
      setStep('dates');
    }
    else if (step === 'dates') {
      handleSave();
    }
  };

  const calculateAutoDates = (field: string, value: string) => {
    // If OPT start is filled, we can auto-suggest OPT End
    if (field === 'optStartDate' && value) {
      setOptStartDate(value);
      const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
      if (dateRegex.test(value)) {
        const parts = value.split('/');
        const date = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        date.setDate(date.getDate() + 364);
        
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const yy = date.getFullYear();
        setOptEndDate(`${mm}/${dd}/${yy}`);
      }
    } else {
      if (field === 'programEndDate') setProgramEndDate(value);
      if (field === 'optEndDate') setOptEndDate(value);
      if (field === 'stemStartDate') setStemStartDate(value);
    }
  };

  const handleSave = async () => {
    // Requires at least one date or basic validation based on status
    if (status === 'applying_opt' && !programEndDate) {
      toast({ title: "Program End Date is required", variant: "destructive" });
      return;
    }
    if ((status === 'on_opt' || status === 'stem_opt') && !optStartDate) {
      toast({ title: "OPT Start Date is required", variant: "destructive" });
      return;
    }

    try {
      setIsSaving(true);
      setStep('finishing');

      const payload = {
        degree_level: degreeLevel,
        major_name: majorName.trim(),
        is_stem_eligible: isStemEligible,
        program_end_date: programEndDate || null,
        opt_start_date: optStartDate || null,
        opt_ead_end_date: optEndDate || null,
        stem_start_date: stemStartDate || null,
      };

      const response = await fetch('/api/opt/calculator', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        toast({
          title: "Profile Configured! 🎉",
          description: "Your dashboard is now customized for your journey.",
          className: "bg-green-50 border-green-200",
        });
        onComplete(); // Tells parent to hide the modal and refresh data
      } else {
        throw new Error(result.error || "Failed to save dates");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      setStep('dates'); // revert step
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Prevent closing by clicking outside
      if (!open) return;
    }}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-background border-none shadow-2xl [&>button]:hidden">
        {/* Header Progress */}
        <div className="h-1.5 w-full bg-muted flex">
          <div className={`h-full bg-blue-600 transition-all duration-500 ${
            step === 'welcome' ? 'w-1/5' : 
            step === 'course' ? 'w-2/5' : 
            step === 'status' ? 'w-3/5' : 
            step === 'dates' ? 'w-4/5' : 'w-full'
          }`} />
        </div>

        <div className="p-8 sm:p-10 min-h-[460px] flex flex-col">
          {step === 'welcome' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 flex-1 flex flex-col justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome to TrackMyOPT</h2>
              <p className="text-lg text-muted-foreground max-w-sm mx-auto">
                Let's set up your profile so we can track your legal deadlines, countdowns, and unemployment days accurately.
              </p>
              <div className="pt-8">
                <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg rounded-full" onClick={handleNext}>
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {step === 'course' && (
            <div className="animate-in fade-in slide-in-from-right-4 flex-1 flex flex-col">
              <h2 className="text-2xl font-bold tracking-tight mb-2">What did you study?</h2>
              <p className="text-muted-foreground mb-4">This helps us determine if you are eligible for the 24-month STEM OPT extension.</p>
              
              <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-3 flex gap-3 text-sm text-blue-800 dark:text-blue-300 mb-6">
                <div className="mt-0.5"><GraduationCap className="h-4 w-4" /></div>
                <div><span className="font-semibold">Tip:</span> Your official STEM eligibility is based on the <strong>CIP Code</strong> printed on your Form I-20 under "Program of Study".</div>
              </div>

              <div className="space-y-6 flex-1">
                <div className="space-y-3">
                  <label className="text-sm font-medium">Degree Level</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Associate', "Bachelor's", "Master's", 'Doctorate'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDegreeLevel(level)}
                        className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                          degreeLevel === level
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-card hover:bg-muted border-border'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 relative">
                  <label className="text-sm font-medium">Major / Course Name</label>
                  <input
                    type="text"
                    value={majorName}
                    onChange={(e) => {
                      handleMajorChange(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    placeholder="e.g. Computer Science, Mechanical Engineering..."
                    className="w-full p-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                  
                  {showDropdown && filteredMajors.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredMajors.map((major) => (
                        <li 
                          key={major}
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-foreground transition-colors"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            handleMajorChange(major);
                            setShowDropdown(false);
                          }}
                        >
                          {major}
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {majorName.length > 2 && (
                    <div className={`p-4 rounded-lg flex items-start gap-3 transition-opacity duration-300 ${isStemEligible ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-100 dark:border-emerald-800' : 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-100 dark:border-amber-800'}`}>
                      {isStemEligible ? (
                        <>
                          <div className="p-1.5 bg-emerald-100 rounded-full text-emerald-600 dark:bg-emerald-800 dark:text-emerald-300 mt-0.5">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">STEM Eligible!</p>
                            <p className="text-xs opacity-90 mt-0.5">This major qualifies for the 24-month OPT extension.</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-1.5 bg-amber-100 rounded-full text-amber-600 dark:bg-amber-800 dark:text-amber-300 mt-0.5">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                          <div>
                            <p className="font-semibold text-sm">Non-STEM / Undetermined</p>
                            <p className="text-xs opacity-90 mt-0.5">We didn't detect STEM keywords. If your CIP code is on the DHS list, you can force-change this in settings later.</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-6 flex justify-between mt-auto">
                <Button variant="ghost" onClick={() => setStep('welcome')}>Back</Button>
                <Button onClick={handleNext} disabled={!majorName.trim()} className="px-8">
                  Continue <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 'status' && (
            <div className="animate-in fade-in slide-in-from-right-4 flex-1 flex flex-col">
              <h2 className="text-2xl font-bold tracking-tight mb-2">Where are you in your journey?</h2>
              <p className="text-muted-foreground mb-8">This helps us customize your dashboard widgets.</p>
              
              <div className="space-y-3 flex-1">
                {[
                  { id: 'applying_opt', icon: Calendar, title: "I am applying for OPT soon", desc: "Just graduated or graduating soon. I need help tracking application deadlines." },
                  { id: 'on_opt', icon: Briefcase, title: "I am currently on OPT", desc: "My OPT has started and I need to track unemployment days." },
                  { id: 'stem_opt', icon: GraduationCap, title: "I am on STEM OPT", desc: "I'm on a 24-month extension and need to track I-983 reviews." }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setStatus(option.id as any)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-4 ${
                      status === option.id 
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-muted hover:border-gray-300 dark:hover:border-gray-700 bg-card'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${status === option.id ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                      <option.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`font-semibold ${status === option.id ? 'text-blue-900 dark:text-blue-100' : 'text-foreground'}`}>{option.title}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">{option.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="pt-6 flex justify-between mt-auto">
                <Button variant="ghost" onClick={() => setStep('course')}>Back</Button>
                <Button onClick={handleNext} disabled={!status} className="px-8">
                  Continue <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 'dates' && (
            <div className="animate-in fade-in slide-in-from-right-4 flex-1 flex flex-col">
              <h2 className="text-2xl font-bold tracking-tight mb-2">Set your key dates</h2>
              <p className="text-muted-foreground mb-2">
                We use these dates to calculate your filing windows, OPT expiry, and unemployment day limits.
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                You can always edit these later from the OPT Dates section if you don&apos;t have everything handy right now.
              </p>
              
              <div className="space-y-5 flex-1 overflow-y-auto pr-2 pb-4">
                {status === 'applying_opt' && (
                  <DateInput
                    label="Program End Date"
                    value={programEndDate}
                    onChange={(v) => calculateAutoDates('programEndDate', v)}
                    description="The official end date on your I-20"
                    required
                  />
                )}
                
                {(status === 'on_opt' || status === 'stem_opt') && (
                  <>
                    <DateInput
                      label={<span className="flex items-center gap-1"><JargonTooltip term="OPT" showIcon={false} /> Start Date (From <JargonTooltip term="EAD" showIcon={false} />)</span>}
                      value={optStartDate}
                      onChange={(v) => calculateAutoDates('optStartDate', v)}
                      description="The start date printed on your EAD card"
                      required
                    />
                    <DateInput
                      label={<span className="flex items-center gap-1"><JargonTooltip term="OPT" showIcon={false} /> End Date</span>}
                      value={optEndDate}
                      onChange={(v) => calculateAutoDates('optEndDate', v)}
                      description="The expiration date on your EAD card"
                    />
                  </>
                )}

                {status === 'stem_opt' && (
                  <DateInput
                    label={<span className="flex items-center gap-1"><JargonTooltip term="STEM OPT" showIcon={true}>STEM Extension</JargonTooltip> Start Date</span>}
                    value={stemStartDate}
                    onChange={(v) => calculateAutoDates('stemStartDate', v)}
                    description="The start date of your 24-month extension"
                    required
                  />
                )}
              </div>
              
              <div className="pt-6 flex items-center justify-between mt-auto border-t">
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep('status')}>Back</Button>
                  <button
                    type="button"
                    onClick={() => (onSkip ?? onComplete)()}
                    className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                  >
                    Skip for now
                  </button>
                </div>
                <Button onClick={handleNext} disabled={isSaving} className="px-8">
                  {isSaving ? 'Saving...' : 'Finish Setup'} 
                  {!isSaving && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}

          {step === 'finishing' && (
            <div className="animate-in zoom-in-95 flex flex-col items-center justify-center flex-1 space-y-4 text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <h2 className="text-xl font-semibold">Configuring your dashboard...</h2>
              <p className="text-muted-foreground">This will just take a second.</p>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
