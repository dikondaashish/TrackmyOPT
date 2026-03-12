import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OPT Answers | TrackMyOPT",
  description:
    "Quick answers to your most common OPT, F-1, and STEM OPT questions. Get AI-cited answers backed by USCIS regulations.",
  openGraph: {
    title: "OPT Answers | TrackMyOPT",
    description:
      "Quick answers to your most common OPT, F-1, and STEM OPT questions.",
    type: "website",
    url: "https://www.trackmyopt.com/answers",
    images: [
      {
        url: "https://www.trackmyopt.com/og-answers.png",
        width: 1200,
        height: 630,
        alt: "TrackMyOPT Answers",
      },
    ],
  },
  alternates: {
    canonical: "https://www.trackmyopt.com/answers",
  },
};

export default function AnswersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
