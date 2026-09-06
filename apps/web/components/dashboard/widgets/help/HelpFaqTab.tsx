"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  HelpCircle,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Mail,
  ExternalLink,
  Heart,
  Puzzle,
  DollarSign,
} from "lucide-react";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left hover:text-primary transition-colors"
      >
        <span className="font-medium pr-4">{question}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export function HelpFaqTab() {
  return (
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>

          {/* OPT FAQs */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              About OPT
            </h3>
            <div className="border border-border rounded-lg divide-y divide-border">
              <FAQItem
                question="When can I apply for OPT?"
                answer="You can apply for Post-Completion OPT up to 90 days before your program end date and up to 60 days after. It's recommended to apply as early as possible within this window, as processing times can vary from 90-120 days (3-4 months)."
              />
              <FAQItem
                question="How long is OPT valid?"
                answer="Standard Post-Completion OPT is valid for 12 months. If you have a STEM degree and work for an E-Verify employer, you may be eligible for a 24-month STEM OPT extension, giving you a total of 36 months."
              />
              <FAQItem
                question="What happens if I exceed 90 days of unemployment?"
                answer="The aggregate limit is 90 unemployment days during initial post-completion OPT and 150 days across initial OPT plus STEM OPT. Exceeding the applicable limit can violate F-1 status and may affect future immigration benefits; contact your DSO for case-specific guidance."
              />
              <FAQItem
                question="Can I travel while my OPT application is pending?"
                answer="Travel while OPT is pending is risky. If you leave the US, CBP may not allow you to re-enter while the application is pending. It's generally recommended to wait until you receive your EAD card before traveling internationally."
              />
              <FAQItem
                question="What is the difference between OPT and CPT?"
                answer="CPT (Curricular Practical Training) is work authorization used during your academic program as part of your curriculum. OPT is used after graduation. Using 12+ months of full-time CPT eliminates your eligibility for OPT."
              />
              <FAQItem
                question="Can I work for multiple employers on OPT?"
                answer="Yes, you can work for multiple employers on OPT. You can also work part-time (at least 20 hours/week to stop the unemployment clock). Self-employment is also allowed if properly documented."
              />
            </div>
          </div>

          {/* STEM OPT FAQs */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-green-600" />
              About STEM OPT
            </h3>
            <div className="border border-border rounded-lg divide-y divide-border">
              <FAQItem
                question="How do I know if my degree qualifies for STEM OPT?"
                answer="Your degree must be on the STEM Designated Degree Program list maintained by DHS. Check with your DSO or search the official list. Common qualifying fields include Computer Science, Engineering, Mathematics, and Physical Sciences."
              />
              <FAQItem
                question="When should I apply for STEM OPT extension?"
                answer="You can apply up to 90 days before your current OPT expires. Your application must be received by USCIS before your OPT end date. Apply early to ensure timely processing."
              />
              <FAQItem
                question="What if my STEM OPT is pending when my OPT expires?"
                answer="If you timely filed your STEM OPT extension, you can continue working for up to 180 days while the application is pending. Keep your receipt notice as proof of timely filing."
              />
              <FAQItem
                question="What is the I-983 Training Plan?"
                answer="The I-983 is a training plan form required for STEM OPT. It must be completed with your employer and outlines your training goals, supervision, and how the work relates to your STEM degree. It must be submitted to your DSO."
              />
            </div>
          </div>

          {/* Tax Filing FAQs */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Tax Filing for International Students
            </h3>
            <div className="border border-border rounded-lg divide-y divide-border">
              <FAQItem
                question="Do I need to file taxes as an F-1 student?"
                answer="Yes, all F-1 students who were present in the US during the tax year must file at least Form 8843 (even with no income). If you earned income, you'll also need to file Form 1040-NR. Filing correctly is a legal requirement."
              />
              <FAQItem
                question="What tax form should I use as a non-resident?"
                answer="Most F-1 students should file Form 1040-NR (Non-Resident). Do NOT use Form 1040 unless you meet the Substantial Presence Test. Using the wrong form can cause issues with future visa applications."
              />
              <FAQItem
                question="When are taxes due?"
                answer="Federal taxes are due April 15. Form 8843 is also due April 15 (or June 15 if you had no US income). State tax deadlines vary. Use our Tax Filing page to see all important dates."
              />
              <FAQItem
                question="Can I get a tax refund on OPT?"
                answer="Possibly! If taxes were withheld from your paycheck, you may get a refund. F-1 students are also exempt from FICA taxes (Social Security & Medicare) during their first 5 years—if your employer incorrectly withheld these, you can request a refund."
              />
            </div>
          </div>

          {/* Health Insurance FAQs */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              Health Insurance on OPT
            </h3>
            <div className="border border-border rounded-lg divide-y divide-border">
              <FAQItem
                question="Do I need health insurance on OPT?"
                answer="While not legally required, having health insurance is strongly recommended. Medical costs in the US are extremely high. A single ER visit can cost $5,000+. Many employers offer coverage, but if not, use our Insurance Finder."
              />
              <FAQItem
                question="What insurance options do I have on OPT?"
                answer="Options include: (1) Employer-sponsored insurance, (2) ACA Marketplace plans (healthcare.gov), (3) Short-term health insurance, (4) International student plans. Our Insurance Finder helps you compare these options."
              />
              <FAQItem
                question="Does my school insurance cover me after graduation?"
                answer="Usually no. Most school-sponsored plans end at graduation or shortly after. Check with your school for exact dates. You may have a gap between graduation and employer coverage—consider short-term plans."
              />
            </div>
          </div>

          {/* Extension FAQs */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Puzzle className="w-5 h-5 text-cyan-600" />
              Chrome Extension
            </h3>
            <div className="border border-border rounded-lg divide-y divide-border">
              <FAQItem
                question="How do I install the TrackMyOPT extension?"
                answer="Visit the Chrome Web Store and search 'TrackMyOPT'. Click 'Add to Chrome' and then pin it to your toolbar for quick access. Sign in with your TrackMyOPT account to sync your data."
              />
              <FAQItem
                question="Is the extension free?"
                answer="Yes. Free includes OPT tools, job tracking, Step-by-step application prefill, skills, private-answer review, 2 AI screening drafts per month, and 1 AI cover letter per month. Pro adds Continuous filling, Guided Autopilot, 100 shared AI writing actions per month, Document Vault, daily reminders, and USCIS status alerts."
              />
              <FAQItem
                question="Does the extension work offline?"
                answer="The OPT calculators work offline once loaded. However, features like Case Status Tracker require an internet connection to check USCIS for updates."
              />
              <FAQItem
                question="What does application Prefill change?"
                answer="Prefill adds eligible information from your dedicated job-portal profile and active job-scoped resume only to empty supported fields. Optional private answers can fill only after you review and approve their exact values for the current application. Guided Autopilot may advance allowlisted Next, Continue, and Done steps, but it stops before Review and never submits. Existing values and files are never replaced; review every field and attachment yourself."
              />
              <FAQItem
                question="Why did Prefill leave a field or attachment blank?"
                answer="The control may already contain a value, require a custom dropdown, be a sensitive question, reject PDF upload, or be unsupported on that application. Generated resume data also expires after 30 minutes or when the job URL, company, or role changes. Enter or upload the value manually and contact support with the content-free error category shown by the extension."
              />
            </div>
          </div>

          {/* TrackMyOPT FAQs */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-600" />
              About TrackMyOPT
            </h3>
            <div className="border border-border rounded-lg divide-y divide-border">
              <FAQItem
                question="Is my data secure?"
                answer="Yes, we take security seriously. All data is encrypted in transit and at rest. Document Vault uses additional passcode protection. We never share your personal information with third parties."
              />
              <FAQItem
                question="How does the case status tracker work?"
                answer="We check your case status directly from the USCIS website. On Free, you refresh manually anytime. On Pro, we run daily auto-checks and email you when your status changes."
              />
              <FAQItem
                question="What's included in Pro?"
                answer="Pro includes: 9:00 AM ET email reminders for all trackers, daily USCIS status checks, Document Vault with expiry reminders, unlimited job tracking, and AI resume tools."
              />
              <FAQItem
                question="Can I use TrackMyOPT on my phone?"
                answer="Yes! TrackMyOPT is fully responsive and works on mobile devices. We also offer a Chrome extension for quick access to your case status and key dates."
              />
              <FAQItem
                question="How do I contact support?"
                answer="Email support@trackmyopt.com anytime. Pro members get priority responses during business hours."
              />
            </div>
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
