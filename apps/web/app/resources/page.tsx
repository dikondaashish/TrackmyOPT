import { LandingNavbar } from "../../components/landing/LandingNavbar";
import { LandingComparison } from "../../components/landing/LandingComparison";
import { LandingValueGrid } from "../../components/landing/LandingValueGrid";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Resources - TrackMyOPT",
    description: "Learn how TrackMyOPT helps you secure your F-1 status and land a job.",
};

export default function ResourcesPage() {
    return (
        <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900/30 dark:selection:text-blue-100 relative">
            <LandingNavbar />
            <div className="pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                    <h1 className="text-4xl font-bold mb-4">Resources & Guides</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Deep dive into how we help you succeed from graduation to H-1B.
                    </p>
                </div>
                <LandingComparison />
                <LandingValueGrid />
            </div>
            <LandingFooter />
        </main>
    );
}
