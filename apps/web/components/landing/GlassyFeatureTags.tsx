import { Check } from "lucide-react"

const milestones = [
    "H-1B Selected",
    "OPT Approved",
    "STEM Extension",
    "Job Offer",
    "EAD Card",
    "I-983 Signed",
]

export function GlassyFeatureTags() {
    return (
        <ul className="grid w-full grid-cols-2 gap-x-6 gap-y-3 text-left text-sm text-foreground">
            {milestones.map((label) => (
                <li key={label} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                    <span>{label}</span>
                </li>
            ))}
        </ul>
    )
}
