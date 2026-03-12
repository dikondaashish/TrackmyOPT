import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI Resume Builder for H-1B Jobs | TrackMyOPT',
    description: 'Beat the ATS with our AI Resume Doctor. Tailored for international students seeking H-1B sponsorship and STEM OPT roles.',
    openGraph: {
        title: 'AI Resume Scorer for F-1 Students | TrackMyOPT',
        description: 'Get instant feedback on your resume. Optimize for H-1B keywords and beat the ATS.',
        url: 'https://www.trackmyopt.com/features/resume-ai',
    },
    keywords: ['AI Resume Builder', 'ATS Scanner', 'H1B Resume', 'International Student Resume', 'Resume Scorer']
};

export default function ResumeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
