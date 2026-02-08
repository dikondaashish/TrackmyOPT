import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | TrackMyOPT - Sign In to Your OPT Dashboard",
    description: "Sign in to TrackMyOPT to access your OPT timeline, unemployment tracker, USCIS case status, and job search tools.",
    alternates: {
        canonical: "https://www.trackmyopt.com/login",
    },
    robots: {
        index: false,
        follow: true,
    },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return children;
}
