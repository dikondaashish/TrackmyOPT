import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "AI Resume Builder for OPT & H-1B Jobs | F-1 Student ATS Optimizer | TrackMyOPT",
    description:
        "Build ATS-optimized resumes for H-1B and STEM OPT positions. AI-powered resume scoring, keyword optimization, and instant feedback — built for F-1 students competing for sponsorship roles.",
    alternates: {
        canonical: "https://www.trackmyopt.com/features/resume-ai",
    },
    openGraph: {
        title: "AI Resume Builder for F-1 Students on OPT | TrackMyOPT",
        description:
            "ATS-optimized resumes tailored for H-1B sponsorship and STEM OPT roles. Stop getting filtered out by automated screening.",
        url: "https://www.trackmyopt.com/features/resume-ai",
        siteName: "TrackMyOPT",
    },
    keywords: [
        "AI resume builder OPT",
        "ATS scanner F-1 students",
        "H-1B resume optimizer",
        "STEM OPT resume",
        "international student resume builder",
    ],
};

export default function ResumeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
