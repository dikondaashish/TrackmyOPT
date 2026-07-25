"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  HelpCircle,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Briefcase,
  AlertTriangle,
  Info,
  Mail,
  ExternalLink,
  Crown,
  Shield,
  Bell,
  Calculator,
  Search,
  Heart,
  Tag,
  Settings,
  Puzzle,
  DollarSign,
  User,
  MapPin,
  FilePenLine,
  CircleHelp,
  Rocket,
  Gift,
  Timer,
  BadgeCheck,
} from "lucide-react";
import { EXTENSION_AUTOFILL_SUPPORT_NOTICE } from "@/lib/legal/legal-config";

// Collapsible section component
function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-card hover:bg-accent/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 bg-card border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}

// FAQ Item component
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

// Feature card component
function FeatureCard({
  icon,
  title,
  description,
  link,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}) {
  return (
    <a
      href={link}
      className="block p-4 bg-card border border-border rounded-lg hover:border-primary hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </a>
  );
}

export function HelpSection() {
  const [activeTab, setActiveTab] = useState<"guide" | "features" | "faq">("guide");

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Help Center</h1>
            <p className="text-muted-foreground">
              Everything you need to know about OPT and TrackMyOPT
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
        {[
          { id: "guide", label: "OPT Guide", icon: BookOpen },
          { id: "features", label: "App Features", icon: Search },
          { id: "faq", label: "FAQ", icon: HelpCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent"
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* OPT Guide Tab */}
      {activeTab === "guide" && (
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
      )}

      {/* App Features Tab */}
      {activeTab === "features" && (
        <div className="space-y-6">
          {/* Quick Navigation */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">TrackMyOPT Features</h2>
            <p className="text-muted-foreground mb-6">
              TrackMyOPT provides comprehensive tools to help you manage your OPT journey.
              Click on any feature to learn more or navigate directly to it.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Calendar className="w-5 h-5 text-blue-600" />}
                title="OPT Dates Calculator"
                description="Calculate important OPT filing windows, start dates, and deadlines based on your program end date."
                link="/dashboard/opt-dates"
              />
              <FeatureCard
                icon={<ClipboardCheck className="w-5 h-5 text-green-600" />}
                title="Case Status Tracker"
                description="Monitor your USCIS case status. Free: manual refresh anytime. Pro: daily auto-checks + email when status changes."
                link="/dashboard/case-status"
              />
              <FeatureCard
                icon={<Clock className="w-5 h-5 text-red-600" />}
                title="OPT Tools & Calculators"
                description="Track your unemployment days and calculate key OPT/STEM dates with our specialized tools."
                link="/dashboard/opt-tools"
              />
              <FeatureCard
                icon={<FileText className="w-5 h-5 text-purple-600" />}
                title="Document Vault"
                description="Securely store and organize your OPT documents with AI-powered analysis."
                link="/dashboard/documents"
              />
              <FeatureCard
                icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
                title="Tax Filing Guide"
                description="Navigate US tax requirements as an international student. Access trusted partners like Sprintax."
                link="/dashboard/tax-filing"
              />
              <FeatureCard
                icon={<Heart className="w-5 h-5 text-pink-600" />}
                title="Health Insurance Finder"
                description="Find affordable health insurance plans that meet OPT requirements and your budget."
                link="/dashboard/opt-health-insurance-finder"
              />
              <FeatureCard
                icon={<Tag className="w-5 h-5 text-orange-600" />}
                title="Exclusive Offers"
                description="Access curated discounts and deals from our trusted partners for international students."
                link="/dashboard/offers"
              />
              <FeatureCard
                icon={<Settings className="w-5 h-5 text-slate-600" />}
                title="Settings & Account"
                description="Manage your profile, notification preferences, and account security settings."
                link="/dashboard/settings"
              />
            </div>
          </Card>

          {/* Detailed Feature Guides */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Feature Guides</h2>

            <CollapsibleSection
              title="OPT Dates Calculator"
              icon={<Calculator className="w-5 h-5 text-blue-600" />}
              defaultOpen={true}
            >
              <div className="pt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  The OPT Dates Calculator helps you determine critical dates in your OPT journey.
                </p>

                <div className="space-y-3">
                  <h4 className="font-semibold">How to Use:</h4>
                  <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                    <li>Navigate to <strong>OPT Dates</strong> from the sidebar</li>
                    <li>Enter your <strong>Program End Date</strong> (graduation date)</li>
                    <li>Enter your <strong>OPT Start Date</strong> (from your EAD)</li>
                    <li>Enter your <strong>OPT EAD End Date</strong></li>
                    <li>If applicable, check <strong>STEM Eligible</strong> and enter STEM dates</li>
                    <li>Click <strong>Save Dates</strong> to save your information</li>
                  </ol>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Tip:</strong> The calculator will automatically compute your filing window,
                    grace period dates, and STEM extension deadlines.
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Case Status Tracker"
              icon={<ClipboardCheck className="w-5 h-5 text-green-600" />}
            >
              <div className="pt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Track your USCIS case status and receive notifications when it changes.
                </p>

                <div className="space-y-3">
                  <h4 className="font-semibold">How to Use:</h4>
                  <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                    <li>Go to <strong>Case Status</strong> from the sidebar</li>
                    <li>Enter your 13-character <strong>Receipt Number</strong> (e.g., EAC2390012345)</li>
                    <li>Click <strong>Save</strong> to save your receipt number</li>
                    <li>Click <strong>Refresh Status</strong> to check current status (Free)</li>
                    <li>Upgrade to <strong>Pro</strong> for daily auto-checks and email when status changes</li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Common Status Updates</h5>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Case Was Received</li>
                      <li>• Case Is Being Actively Reviewed</li>
                      <li>• Request for Evidence Sent</li>
                      <li>• Card Is Being Produced</li>
                      <li>• Card Was Mailed To Me</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h5 className="font-medium text-sm mb-1 text-green-700 dark:text-green-300">Pro feature</h5>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Pro members get email alerts when USCIS posts a new status on their case.
                      Helpful for spotting RFEs and approvals early — confirm details with your DSO.
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Unemployment Clock Tracker"
              icon={<Clock className="w-5 h-5 text-red-600" />}
            >
              <div className="pt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Monitor your unemployment days and maintain F-1 status compliance.
                </p>

                <div className="space-y-3">
                  <h4 className="font-semibold">Understanding the Clock:</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li><strong>90 days</strong> - Maximum unemployment on initial OPT</li>
                    <li><strong>60 days</strong> - Separate limit for STEM OPT extension</li>
                    <li><strong>Stops</strong> - When you have qualifying employment</li>
                    <li><strong>Resets</strong> - Does NOT reset; it's cumulative</li>
                  </ul>
                </div>

                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    <strong>Warning:</strong> Exceeding your unemployment limit violates your F-1 status.
                    Use this tracker diligently to stay compliant.
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Document Vault (Pro)"
              icon={<FileText className="w-5 h-5 text-purple-600" />}
            >
              <div className="pt-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Pro feature</span>
                </div>

                <p className="text-sm text-muted-foreground">
                  Securely store all your immigration documents with passcode protection and AI-powered organization.
                </p>

                <div className="space-y-3">
                  <h4 className="font-semibold">Features:</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>✓ <strong>Passcode Protection</strong> - Add an extra layer of security</li>
                    <li>✓ <strong>AI Document Analysis</strong> - Automatic categorization and data extraction</li>
                    <li>✓ <strong>Expiry Tracking</strong> - Get reminders before documents expire</li>
                    <li>✓ <strong>Secure Storage</strong> - Your documents are encrypted and safe</li>
                    <li>✓ <strong>Easy Search</strong> - Find any document quickly</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">Supported Documents</h5>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      <li>• I-20, I-797, I-94</li>
                      <li>• EAD Card, Passport</li>
                      <li>• Visa, SSN Card</li>
                      <li>• Employment Letters</li>
                      <li>• Tax Documents</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h5 className="font-medium text-sm mb-1">AI Extraction</h5>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      <li>• Document type detection</li>
                      <li>• Issue & expiry dates</li>
                      <li>• Key information summary</li>
                      <li>• Auto-categorization</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Notifications & Reminders"
              icon={<Bell className="w-5 h-5 text-amber-600" />}
            >
              <div className="pt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Stay on top of important deadlines with our notification system.
                </p>

                <div className="space-y-3">
                  <h4 className="font-semibold">Notification Types:</h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                      <span><strong>Email Notifications</strong> — Receive updates to your email</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Bell className="w-4 h-4 mt-0.5 shrink-0" />
                      <span><strong>Case Status Alerts</strong> — Know when USCIS updates your case</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                      <span><strong>Document Expiry Reminders</strong> — 30-day advance notice</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                      <span><strong>Deadline Reminders</strong> — 9:00 AM ET emails before filing windows and unemployment limits</span>
                    </li>
                  </ul>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Configure your notification preferences in <strong>Settings</strong> to choose
                    which alerts you want to receive.
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Tax Filing for International Students"
              icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
            >
              <div className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h5 className="font-medium text-sm mb-1 flex items-center gap-1.5"><User className="w-3.5 h-3.5 shrink-0" /> Who Should Use This?</h5>
                    <p className="text-xs text-muted-foreground">
                      All F-1 students (including those on OPT) who were in the US for any part of the tax year.
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h5 className="font-medium text-sm mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 shrink-0" /> Where To Find It?</h5>
                    <p className="text-xs text-muted-foreground">
                      Navigate to <strong>Tax Filing</strong> from the sidebar menu.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2"><FilePenLine className="w-4 h-4 shrink-0" /> What Does This Feature Do?</h4>
                  <p className="text-sm text-muted-foreground">
                    The Tax Filing Guide helps you navigate US tax requirements as an international student.
                    It connects you with trusted tax preparation partners who specialize in non-resident returns.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2"><Clock className="w-4 h-4 shrink-0" /> When Should You Use It?</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <strong>Tax Season:</strong> January 1 - April 15 each year</li>
                    <li>• <strong>Form 8843:</strong> Required even if you had no income</li>
                    <li>• <strong>Form 1040-NR:</strong> If you earned income in the US</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2"><CircleHelp className="w-4 h-4 shrink-0" /> Why Is This Important?</h4>
                  <p className="text-sm text-muted-foreground">
                    Filing taxes correctly is a legal requirement. Using the wrong tax forms (like 1040 instead of 1040-NR)
                    can cause visa issues. USCIS checks tax compliance for green card applications.
                  </p>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <h5 className="font-medium text-sm mb-2 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5"><Rocket className="w-3.5 h-3.5 shrink-0" /> How To Use:</h5>
                  <ol className="text-sm space-y-1 text-emerald-600 dark:text-emerald-400 list-decimal list-inside">
                    <li>Go to <strong>Tax Filing</strong> from the sidebar</li>
                    <li>Answer the tax status questions to determine your requirements</li>
                    <li>Review the <strong>Important Tax Deadlines</strong> section</li>
                    <li>Choose a trusted partner (Sprintax, Glacier Tax Prep, etc.)</li>
                    <li>Use exclusive coupon codes if available</li>
                  </ol>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Health Insurance Finder"
              icon={<Heart className="w-5 h-5 text-pink-600" />}
            >
              <div className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h5 className="font-medium text-sm mb-1 flex items-center gap-1.5"><User className="w-3.5 h-3.5 shrink-0" /> Who Should Use This?</h5>
                    <p className="text-xs text-muted-foreground">
                      OPT students who lost school-sponsored coverage or need affordable insurance during their work authorization period.
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h5 className="font-medium text-sm mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 shrink-0" /> Where To Find It?</h5>
                    <p className="text-xs text-muted-foreground">
                      Navigate to <strong>Insurance Finder</strong> from the sidebar or go to <strong>/dashboard/opt-health-insurance-finder</strong>.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2"><FilePenLine className="w-4 h-4 shrink-0" /> What Does This Feature Do?</h4>
                  <p className="text-sm text-muted-foreground">
                    Helps you find health insurance plans suitable for international students on OPT.
                    Compare options ranging from short-term plans to ACA-compliant coverage.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2"><Clock className="w-4 h-4 shrink-0" /> When Should You Use It?</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <strong>After Graduation:</strong> When school insurance ends</li>
                    <li>• <strong>Before OPT Starts:</strong> To avoid coverage gaps</li>
                    <li>• <strong>Job Change:</strong> If losing employer coverage</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2"><CircleHelp className="w-4 h-4 shrink-0" /> Why Is This Important?</h4>
                  <p className="text-sm text-muted-foreground">
                    Medical bills in the US can be financially devastating without insurance.
                    A single ER visit can cost $5,000+. Having coverage protects your finances and health.
                  </p>
                </div>

                <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <h5 className="font-medium text-sm mb-2 text-pink-700 dark:text-pink-300 flex items-center gap-1.5"><Rocket className="w-3.5 h-3.5 shrink-0" /> How To Use:</h5>
                  <ol className="text-sm space-y-1 text-pink-600 dark:text-pink-400 list-decimal list-inside">
                    <li>Go to <strong>Insurance Finder</strong></li>
                    <li>Enter your eligibility information (visa status, dates)</li>
                    <li>Browse recommended insurance plans</li>
                    <li>Compare coverage, deductibles, and premiums</li>
                    <li>Click through to apply with our partner providers</li>
                  </ol>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Exclusive Offers & Discounts"
              icon={<Tag className="w-5 h-5 text-orange-600" />}
            >
              <div className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h5 className="font-medium text-sm mb-1 flex items-center gap-1.5"><User className="w-3.5 h-3.5 shrink-0" /> Who Should Use This?</h5>
                    <p className="text-xs text-muted-foreground">
                      All TrackMyOPT users who want to save money on services designed for international students.
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h5 className="font-medium text-sm mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 shrink-0" /> Where To Find It?</h5>
                    <p className="text-xs text-muted-foreground">
                      Click <strong>Offers</strong> in the header or navigate via sidebar to <strong>/dashboard/offers</strong>.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2"><FilePenLine className="w-4 h-4 shrink-0" /> What Does This Feature Do?</h4>
                  <p className="text-sm text-muted-foreground">
                    Curates exclusive discounts and deals from our trusted partners. These offers are
                    specifically negotiated for TrackMyOPT users and may include tax services, insurance,
                    banking, and more.
                  </p>
                </div>

                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <h5 className="font-medium text-sm mb-2 text-orange-700 dark:text-orange-300 flex items-center gap-1.5"><Gift className="w-3.5 h-3.5 shrink-0" /> Current Offer Categories:</h5>
                  <ul className="text-sm text-orange-600 dark:text-orange-400 space-y-1">
                    <li>✓ Tax Preparation Services</li>
                    <li>✓ Health Insurance</li>
                    <li>✓ Banking & Credit Cards</li>
                    <li>✓ Career Services</li>
                    <li>✓ Immigration Assistance</li>
                  </ul>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="OPT Tools & Calculators"
              icon={<Calculator className="w-5 h-5 text-indigo-600" />}
            >
              <div className="pt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  TrackMyOPT provides 4 specialized calculators to help you manage your OPT timeline:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1.5"><Calendar className="w-4 h-4 shrink-0" /> OPT Apply Date Calculator</h5>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mb-2">
                      <strong>What:</strong> Calculates your OPT application window (90 days before to 60 days after program end).
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      <strong>How:</strong> Enter your program end date → Get earliest/latest filing dates.
                    </p>
                  </div>

                  <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h5 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-1.5"><Clock className="w-4 h-4 shrink-0" /> OPT Clock Tracker</h5>
                    <p className="text-xs text-red-700 dark:text-red-400 mb-2">
                      <strong>What:</strong> Tracks your 90-day unemployment limit during initial OPT.
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-400">
                      <strong>How:</strong> Enter OPT start date + employment spans → See days used/remaining.
                    </p>
                  </div>

                  <div className="p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h5 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-1.5"><GraduationCap className="w-4 h-4 shrink-0" /> STEM Apply Date Calculator</h5>
                    <p className="text-xs text-green-700 dark:text-green-400 mb-2">
                      <strong>What:</strong> Calculates your STEM OPT extension application window.
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400">
                      <strong>How:</strong> Enter current OPT end date → Get 90-day filing window.
                    </p>
                  </div>

                  <div className="p-4 border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h5 className="font-semibold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-1.5"><Timer className="w-4 h-4 shrink-0" /> STEM Clock Tracker</h5>
                    <p className="text-xs text-purple-700 dark:text-purple-400 mb-2">
                      <strong>What:</strong> Tracks your separate 60-day unemployment limit during STEM OPT.
                    </p>
                    <p className="text-xs text-purple-700 dark:text-purple-400">
                      <strong>How:</strong> Enter STEM start date + employment → Track compliance.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    <strong className="inline-flex items-center gap-1"><BadgeCheck className="w-4 h-4 inline shrink-0" /> Free Access:</strong> All OPT Tools are available without login. Use them directly from
                    <strong> /dashboard/opt-tools</strong> or the Chrome extension.
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Chrome Extension"
              icon={<Puzzle className="w-5 h-5 text-cyan-600" />}
            >
              <div className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h5 className="font-medium text-sm mb-1 flex items-center gap-1.5"><User className="w-3.5 h-3.5 shrink-0" /> Who Should Use This?</h5>
                    <p className="text-xs text-muted-foreground">
                      Anyone who wants quick access to OPT tools and case status without visiting the full website.
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h5 className="font-medium text-sm mb-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 shrink-0" /> Where To Get It?</h5>
                    <p className="text-xs text-muted-foreground">
                      Download from the Chrome Web Store (search "TrackMyOPT") or visit our homepage.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2"><FilePenLine className="w-4 h-4 shrink-0" /> What Does The Extension Do?</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>✓ Quick access to all 4 OPT calculators</li>
                    <li>✓ View unemployment days at a glance</li>
                    <li>✓ Check case status without leaving your tab</li>
                    <li>✓ Prefill eligible empty profile and work-history fields on an open job application</li>
                    <li>✓ Attach the active job-scoped generated resume only when the Resume/CV input is empty</li>
                    <li>✓ Dark mode support</li>
                    <li>✓ Syncs with your account</li>
                  </ul>
                </div>

                <div className="p-3 border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <h5 className="font-medium text-sm mb-2 text-cyan-800 dark:text-cyan-300">
                    Application prefill safety
                  </h5>
                  <p className="text-xs leading-relaxed text-cyan-700 dark:text-cyan-400">
                    {EXTENSION_AUTOFILL_SUPPORT_NOTICE}
                  </p>
                  <ul className="mt-2 text-xs space-y-1 text-cyan-700 dark:text-cyan-400">
                    <li>• Generated resume data expires after 30 minutes or when the job changes.</li>
                    <li>• Existing field values and uploaded files are never replaced.</li>
                    <li>• Visa, sponsorship, work authorization, salary, DOB, and EEO answers are never guessed. You may save optional private answers in Settings, but the extension requires your review before every application. SSN fields always stay for you.</li>
                    <li>• Custom dropdowns and unsupported controls stay blank; enter those values manually.</li>
                    <li>• TrackMyOPT never clicks Add another, Next, Review, Done, or Submit.</li>
                  </ul>
                </div>

                <div className="p-3 border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <h5 className="font-medium text-sm mb-2 text-amber-800 dark:text-amber-300">
                    Features not enabled in this release
                  </h5>
                  <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                    Continuous mode, skills prefill, AI screening-answer drafts and exact-question answer reuse, and generated cover-letter attachment are independently gated off. If a future release enables AI drafts, every inserted draft will require an edit or an explicit Confirm reviewed action.
                  </p>
                </div>

                <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <h5 className="font-medium text-sm mb-2 text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5"><Rocket className="w-3.5 h-3.5 shrink-0" /> How To Install:</h5>
                  <ol className="text-sm space-y-1 text-cyan-600 dark:text-cyan-400 list-decimal list-inside">
                    <li>Visit Chrome Web Store and search "TrackMyOPT"</li>
                    <li>Click <strong>Add to Chrome</strong></li>
                    <li>Pin the extension to your toolbar</li>
                    <li>Click the icon and sign in with your account</li>
                    <li>Access tools instantly from any webpage!</li>
                  </ol>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              title="Settings & Account"
              icon={<Settings className="w-5 h-5 text-slate-600" />}
            >
              <div className="pt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Manage your TrackMyOPT account, notification preferences, and security settings.
                </p>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2"><Settings className="w-4 h-4 shrink-0" /> Available Settings:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 border border-border rounded-lg">
                      <h5 className="font-medium text-sm mb-1">Profile</h5>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        <li>• Update email address</li>
                        <li>• Change password</li>
                        <li>• Set timezone</li>
                      </ul>
                    </div>
                    <div className="p-3 border border-border rounded-lg">
                      <h5 className="font-medium text-sm mb-1">Notifications</h5>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        <li>• Case status alerts</li>
                        <li>• Document expiry reminders</li>
                        <li>• Tool usage notifications</li>
                      </ul>
                    </div>
                    <div className="p-3 border border-border rounded-lg">
                      <h5 className="font-medium text-sm mb-1">Security</h5>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        <li>• View active sessions</li>
                        <li>• Logout from all devices</li>
                        <li>• Document Vault passcode</li>
                      </ul>
                    </div>
                    <div className="p-3 border border-border rounded-lg">
                      <h5 className="font-medium text-sm mb-1">Subscription</h5>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        <li>• View current plan</li>
                        <li>• Upgrade to Pro</li>
                        <li>• Manage billing</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 shrink-0" /> Navigate to:</strong> Sidebar → <strong>Settings</strong> or go to <strong>/dashboard/settings</strong>
                  </p>
                </div>
              </div>
            </CollapsibleSection>
          </div>

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
      )}

      {/* FAQ Tab */}
      {activeTab === "faq" && (
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
                  answer="Yes! The Chrome extension is free for OPT calculators and quick tools. Pro adds Document Vault, daily reminders, and case status email alerts."
                />
                <FAQItem
                  question="Does the extension work offline?"
                  answer="The OPT calculators work offline once loaded. However, features like Case Status Tracker require an internet connection to check USCIS for updates."
                />
                <FAQItem
                  question="What does application Prefill change?"
                  answer="Prefill only adds eligible TrackMyOPT profile and active job-scoped resume information to empty supported fields on the open application. It does not replace existing values or files, answer sensitive questions, add extra rows, navigate the application, or submit it. Review every field and attachment yourself."
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
      )}

      {/* Quick Links Footer */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Useful External Resources</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "USCIS Case Status", url: "https://egov.uscis.gov/casestatus/landing.do" },
            { label: "SEVP Portal", url: "https://studyinthestates.dhs.gov/students" },
            { label: "I-765 Instructions", url: "https://www.uscis.gov/i-765" },
            { label: "STEM Degree List", url: "https://studyinthestates.dhs.gov/stem-opt-hub/additional-resources/eligible-cip-codes-for-the-stem-opt-extension" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 text-sm border border-border rounded-lg hover:bg-accent hover:border-primary transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="text-center text-xs text-muted-foreground p-4 bg-card border border-border rounded-lg">
        <p>
          <strong>Disclaimer:</strong> TrackMyOPT provides general information and tools to help manage your OPT.
          This is not legal advice. Immigration rules can change. Always consult with your DSO or an immigration
          attorney for specific guidance on your situation.
        </p>
      </div>
    </div>
  );
}
