import { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "OPT Help Center | F-1 Visa FAQ | TrackMyOPT Support",
  alternates: {
    canonical: "https://www.trackmyopt.com/help",
  },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingNavbar />
      <main className="min-h-screen bg-surface px-4 pt-8 sm:px-6">
        {children}
      </main>
      <LandingFooter />
    </>
  );
}
