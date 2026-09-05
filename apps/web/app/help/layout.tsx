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
      <main className="min-h-screen bg-white dark:bg-zinc-950 pt-4">
        {children}
      </main>
      <LandingFooter />
    </>
  );
}
