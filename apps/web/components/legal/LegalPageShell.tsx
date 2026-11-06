import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import {
  COMPANY,
  formatPolicyVersionLabel,
  type LegalPolicyType,
} from "@/lib/legal/legal-config";

interface LegalPageShellProps {
  title: string;
  policyType: LegalPolicyType;
  children: React.ReactNode;
}

export function LegalPageShell({ title, policyType, children }: LegalPageShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-foreground overflow-x-hidden">
      <div>
        <LandingNavbar />

        <div className="max-w-4xl mx-auto pt-8 pb-20 px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-8 md:p-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {title}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Last updated: {formatPolicyVersionLabel(policyType)}
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-10">
              {COMPANY.productName} is operated by {COMPANY.legalName}. This page is not legal advice.
            </p>

            <div
              className="prose prose-lg prose-longform dark:prose-invert max-w-none
              prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-p:text-gray-600 dark:prose-p:text-gray-400
              prose-li:text-gray-600 dark:prose-li:text-gray-400
              prose-strong:text-gray-900 dark:prose-strong:text-white
              prose-a:text-blue-600 dark:prose-a:text-blue-400"
            >
              {children}
            </div>
          </div>
        </div>

        <LandingFooter />
      </div>
    </main>
  );
}
