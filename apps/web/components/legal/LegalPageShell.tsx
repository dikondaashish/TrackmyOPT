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
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div>
        <LandingNavbar />

        <header className="border-b border-border bg-surface">
          <div className="mx-auto max-w-3xl px-4 pb-10 pt-8 sm:pb-12">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated: {formatPolicyVersionLabel(policyType)}
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 pb-20 pt-10">
          <p className="mb-10 rounded-lg border-l-4 border-l-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
            {COMPANY.productName} is operated by {COMPANY.legalName}. This page is not legal advice.
          </p>

          <div
            className="prose prose-lg prose-longform dark:prose-invert max-w-none
            prose-headings:text-foreground
            prose-h2:mt-12
            prose-p:text-muted-foreground
            prose-li:text-muted-foreground
            prose-strong:text-foreground
            prose-a:text-primary prose-a:font-medium
            prose-hr:border-border"
          >
            {children}
          </div>
        </div>

        <LandingFooter />
      </div>
    </main>
  );
}
