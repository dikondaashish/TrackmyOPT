"use client";

import { Card } from "@/components/ui/card";
import {
  GraduationCap,
  Calendar,
  Clock,
  Briefcase,
  AlertTriangle,
  Info,
  Mail,
  ExternalLink,
  Shield,
} from "lucide-react";

export function HelpGuideTab() {
  return (
      <div className="space-y-6">
        {/* What is OPT */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold">What is OPT?</h2>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              <strong>Optional Practical Training (OPT)</strong> is a temporary employment authorization
              that allows F-1 visa students to work in the United States for up to 12 months after
              completing their academic program. OPT must be directly related to your major area of study.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  Pre-Completion OPT
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Work authorization while still enrolled in school. Limited to 20 hours/week during
                  classes, full-time during breaks. Time used reduces post-completion OPT.
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                  Post-Completion OPT
                </h4>
                <p className="text-sm text-green-700 dark:text-green-400">
                  12-month work authorization after graduation. Must apply within 60 days of program
                  end date. Most common type of OPT that TrackMyOPT helps you manage.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* OPT Timeline */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-bold">OPT Timeline & Key Dates</h2>
          </div>

          <div className="space-y-4">
            {/* Timeline Steps */}
            <div className="relative">
              <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500" />

              {[
                {
                  title: "Apply for OPT",
                  date: "90 days before to 60 days after program end",
                  description: "Submit Form I-765 with required documents to USCIS. File as early as possible within this window.",
                  color: "blue",
                },
                {
                  title: "Program End Date",
                  date: "Your graduation/completion date",
                  description: "This is your official program end date as indicated on your I-20. Grace period and OPT timing are calculated from this date.",
                  color: "purple",
                },
                {
                  title: "60-Day Grace Period",
                  date: "Starts after program end",
                  description: "You have 60 days to either start OPT, transfer schools, change status, or depart the US. This is NOT additional OPT time.",
                  color: "amber",
                },
                {
                  title: "OPT Start Date",
                  date: "Within 60 days after program end",
                  description: "Your chosen OPT start date. Once OPT starts, your 12-month clock and unemployment clock begin.",
                  color: "green",
                },
                {
                  title: "OPT End Date",
                  date: "12 months after OPT start",
                  description: "Your EAD card expires. You must stop working unless you have filed for STEM extension or have another valid work authorization.",
                  color: "red",
                },
              ].map((step, index) => (
                <div key={index} className="relative pl-10 pb-6 last:pb-0">
                  <div className={`absolute left-2 w-5 h-5 rounded-full border-2 bg-background ${step.color === "blue" ? "border-blue-500" :
                    step.color === "purple" ? "border-purple-500" :
                      step.color === "amber" ? "border-amber-500" :
                        step.color === "green" ? "border-green-500" :
                          "border-red-500"
                    }`} />
                  <div className={`p-4 rounded-lg ${step.color === "blue" ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800" :
                    step.color === "purple" ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800" :
                      step.color === "amber" ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800" :
                        step.color === "green" ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" :
                          "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    }`}>
                    <h4 className="font-semibold">{step.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 mb-2">{step.date}</p>
                    <p className="text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Unemployment Clock */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold">The Unemployment Clock</h2>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800 dark:text-red-300">Critical: Understanding Your Limits</h4>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  You are limited to <strong>90 days of unemployment</strong> during your 12-month OPT period.
                  STEM OPT has a separate <strong>60-day limit</strong>. Exceeding these limits can result in loss of F-1 status.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Initial OPT (12 months)
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Maximum 90 days of unemployment</li>
                  <li>• Clock starts on your OPT start date</li>
                  <li>• Any day without employment counts</li>
                  <li>• Volunteer work does NOT stop the clock</li>
                </ul>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  STEM OPT (24 months)
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Separate 60-day unemployment limit</li>
                  <li>• Does NOT carry over from initial OPT</li>
                  <li>• Must have qualifying STEM degree</li>
                  <li>• Must work for E-Verify employer</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                What Stops the Unemployment Clock?
              </h4>
              <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                <li>✓ Paid employment related to your field of study</li>
                <li>✓ Self-employment (must be properly documented)</li>
                <li>✓ Working at least 20 hours per week</li>
                <li>✓ Multiple part-time jobs totaling 20+ hours</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* STEM OPT Extension */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold">STEM OPT Extension (24 Months)</h2>
          </div>

          <p className="text-muted-foreground mb-4">
            Students with STEM (Science, Technology, Engineering, or Mathematics) degrees can apply
            for an additional 24-month extension, giving you a total of 36 months of OPT.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400">
                Eligibility Requirements
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ STEM degree from SEVP-certified school</li>
                <li>✓ Currently employed on post-completion OPT</li>
                <li>✓ Employer enrolled in E-Verify</li>
                <li>✓ Job related to STEM degree field</li>
                <li>✓ Apply up to 90 days before OPT expires</li>
              </ul>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">
                Application Timeline
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Apply up to 90 days before OPT ends</li>
                <li>• Must be received by USCIS before OPT expires</li>
                <li>• Can continue working up to 180 days while pending</li>
                <li>• New I-20 required from DSO</li>
                <li>• Submit Form I-765 with fee</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-300">Important Note</h4>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  You can apply for STEM OPT up to 2 times in your lifetime if you earn multiple
                  qualifying STEM degrees at different education levels (e.g., Bachelor's then Master's).
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Cap Gap */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold">Cap Gap Extension</h2>
          </div>

          <p className="text-muted-foreground mb-4">
            If your employer files an H-1B petition on your behalf that is selected in the lottery,
            you may be eligible for a "cap gap" extension of your OPT and F-1 status.
          </p>

          <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg">
            <h4 className="font-semibold text-cyan-800 dark:text-cyan-300 mb-2">
              How Cap Gap Works
            </h4>
            <ul className="text-sm text-cyan-700 dark:text-cyan-400 space-y-1">
              <li>• Automatically extends OPT through October 1</li>
              <li>• Only if H-1B petition is timely filed and selected</li>
              <li>• EAD card will show expired date but you can still work</li>
              <li>• Carry cap-gap approval notice when traveling domestically</li>
            </ul>
          </div>
        </Card>

        {/* Still Need Help */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Still Have Questions?</h3>
            <p className="text-muted-foreground mb-4">
              We're here to help! Reach out to our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=support@trackmyopt.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Mail className="w-4 h-4" />
                Email Support
              </a>
              <a
                href="https://uscis.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border bg-card rounded-lg hover:bg-accent transition-colors font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                USCIS Official Site
              </a>
            </div>
          </div>
        </Card>
      </div>
  );
}
