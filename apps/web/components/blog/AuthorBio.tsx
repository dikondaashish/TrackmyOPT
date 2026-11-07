import Link from "next/link";

interface AuthorBioProps {
    compact?: boolean;
}

export function AuthorBio({ compact = false }: AuthorBioProps) {
    if (compact) {
        return (
            <div className="flex items-center gap-3 py-3">
                <div className="w-8 h-8 rounded-full bg-primary-soft border border-primary-muted flex items-center justify-center text-primary text-xs font-bold">VK</div>
                <div>
                    <span className="text-sm font-medium text-foreground">Vinay Kumar</span>
                    <span className="text-xs text-muted-foreground ml-2">Content Writer, TrackMyOPT</span>
                </div>
            </div>
        );
    }

    return (
        <div className="my-10 rounded-xl border border-border bg-surface p-6 sm:p-7">
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-card border border-primary-muted shadow-card flex items-center justify-center text-primary text-xl font-bold flex-shrink-0">
                    VK
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-foreground text-lg">
                        Written by Vinay Kumar
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        Vinay is a content writer at TrackMyOPT who specializes in immigration guidance for international students. All content is researched using official USCIS, SEVP, and Department of Labor sources and reviewed for accuracy by the TrackMyOPT team, which includes former F-1 students who navigated OPT, STEM OPT, and H-1B transitions firsthand.
                    </p>
                    <p className="flex flex-wrap items-center gap-2 mt-3 text-sm text-muted-foreground">
                        <span>Content Writer</span>
                        <span aria-hidden>·</span>
                        <span>3,500+ Users Signed Up</span>
                    </p>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                        <Link href="/about" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                            About TrackMyOPT →
                        </Link>
                        <a href="https://www.linkedin.com/company/trackmyopt" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
                            LinkedIn →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const AUTOMATED_BYLINE = "TrackMyOPT News Desk";

/** Byline for policy-news posts generated and published without editorial review. */
export function AutomatedNewsByline() {
    return (
        <div className="my-10 rounded-xl border border-border bg-surface p-6 sm:p-7">
            <h3 className="font-bold text-foreground text-lg">
                {AUTOMATED_BYLINE}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Generated automatically from the official government document cited above. Confirm how it applies to you with your DSO or an immigration attorney.
            </p>
            <Link href="/about" className="inline-block mt-3 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                About TrackMyOPT →
            </Link>
        </div>
    );
}
