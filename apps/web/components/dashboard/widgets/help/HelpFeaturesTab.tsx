"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  FileText,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Mail,
  ExternalLink,
  Crown,
  Bell,
  Calculator,
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

export function HelpFeaturesTab() {
  return (
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
                  <li>• Visa, sponsorship, work authorization, salary, DOB, and EEO answers are never guessed. You may save optional private answers on the Chrome Job Prefill page, but the extension requires your review before every application. SSN fields always stay for you.</li>
                  <li>• Custom dropdowns and unsupported controls stay blank; enter those values manually.</li>
                  <li>• Guided Autopilot may click safe Next, Continue, or Done steps after required fields are complete. It never clicks Add another, Review, Submit, Apply, Finish, or another final application action.</li>
                </ul>
              </div>

              <div className="p-3 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h5 className="font-medium text-sm mb-2 text-blue-800 dark:text-blue-300">
                  Free and Pro access
                </h5>
                <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-400">
                  Free includes Step-by-step application prefill, skills, saved private-answer review, 2 AI screening drafts per month, and 1 AI cover letter per month. Pro adds Continuous filling, Guided Autopilot, and 100 shared AI writing actions per month, subject to safety limits. Every AI draft still requires your review, and neither plan ever submits an application.
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
  );
}
