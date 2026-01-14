import { SponsorScore } from "@/lib/career/h1b/sponsorScore";

interface SponsorScoreBadgeProps {
    scoreData: SponsorScore;
}

export function SponsorScoreBadge({ scoreData }: SponsorScoreBadgeProps) {
    const { score, label } = scoreData;

    let colorClass = "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    if (label === "Strong") colorClass = "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
    if (label === "Medium") colorClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    if (label === "Low") colorClass = "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300";

    return (
        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg ${colorClass}`}>
            <div className="flex flex-col items-center leading-none">
                <span className="text-xs font-bold">{score}</span>
            </div>
            <div className="h-4 w-px bg-current opacity-20" />
            <span className="text-xs font-medium">{label}</span>
        </div>
    );
}
