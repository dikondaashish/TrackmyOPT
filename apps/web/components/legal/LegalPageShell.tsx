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
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-slate-50 dark:bg-zinc-950" />
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-blue-100/40 dark:bg-blue-900/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <div className="relative z-10">
        <LandingNavbar />

        <div className="max-w-4xl mx-auto pt-8 pb-20 px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>

          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-2xl p-8 md:p-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              {title}
            </h1>
            <p className="text-sm font-mono text-blue-600 dark:text-blue-400 mb-4 uppercase tracking-widest">
              Last updated: {formatPolicyVersionLabel(policyType)}
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-10">
              {COMPANY.productName} is operated by {COMPANY.legalName}. This page is not legal advice.
              U.S. counsel should review before launch.
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
