import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Community | TrackMyOPT - Connect with F-1 Students & Alumni",
    description: "Join 5,000+ international students and alumni. Get referrals, interview tips, and visa advice from people who've navigated OPT successfully.",
    keywords: ["F-1 student community", "international student network", "OPT support group", "H-1B referrals", "alumni mentorship"],
    alternates: {
        canonical: "https://trackmyopt.com/features/community",
    },
    openGraph: {
        title: "TrackMyOPT Community - 5,000+ Students & Alumni",
        description: "You don't have to navigate OPT alone. Connect with mentors, get referrals, and find your support network.",
        url: "https://trackmyopt.com/features/community",
    },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
    return children;
}
