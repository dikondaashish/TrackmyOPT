import { Metadata } from "next";
import { CaseStatusSection } from "@/components/dashboard/CaseStatusSection";

export const metadata: Metadata = {
  title: "Case Status | TrackMyOPT",
  description: "Track your USCIS case status automatically",
};

export default function CaseStatusPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <CaseStatusSection />
    </div>
  );
}

