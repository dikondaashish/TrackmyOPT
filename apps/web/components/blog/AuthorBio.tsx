import Link from "next/link";

interface AuthorBioProps {
    compact?: boolean;
}

export function AuthorBio({ compact = false }: AuthorBioProps) {
    if (compact) {
        return (
            <div className="flex items-center gap-3 py-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">T</div>
                <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">TrackMyOPT Team</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Former F-1 Students &amp; Immigration Experts</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 my-10">
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    T
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                        Written by the TrackMyOPT Team
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                        Our team includes former F-1 students who navigated OPT, STEM OPT, and H-1B transitions firsthand. We combine lived immigration experience with data from USCIS, ICE.gov, and 2,500+ student users to create the most accurate and practical guides for international students in the US.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            Former F-1 Students
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                            USCIS Data Verified
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            2,500+ Students Trust Us
                        </span>
                    </div>
                    <div className="mt-3">
                        <Link href="/about" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                            Learn more about our team →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
