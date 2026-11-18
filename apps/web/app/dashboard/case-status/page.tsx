import { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { CaseStatusSection } from "@/components/dashboard/case-status/CaseStatusSection";

export const metadata: Metadata = {
  title: "Case Status | TrackMyOPT",
  description: "Track your USCIS case status automatically",
};

export default function CaseStatusPage() {
  return (
    <PageShell>
      <CaseStatusSection />
    </PageShell>
  );
}

