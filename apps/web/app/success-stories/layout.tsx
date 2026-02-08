import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Success Stories | TrackMyOPT - F-1 Students Who Landed Their Dream Jobs",
    description: "Read real success stories from international students who used TrackMyOPT to stay compliant, find H-1B sponsors, and land jobs at top companies.",
    keywords: ["OPT success stories", "F-1 student jobs", "H-1B success", "international student careers", "STEM OPT jobs"],
    alternates: {
        canonical: "https://www.trackmyopt.com/success-stories",
    },
    openGraph: {
        title: "TrackMyOPT Success Stories",
        description: "See how 2,500+ students used TrackMyOPT to land jobs at Google, Amazon, Microsoft, and more.",
        url: "https://www.trackmyopt.com/success-stories",
    },
};

export default function SuccessStoriesLayout({ children }: { children: React.ReactNode }) {
    return children;
}
