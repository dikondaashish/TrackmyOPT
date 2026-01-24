import { cn } from "@/lib/utils"

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted/50 bg-gray-200 dark:bg-gray-800", className)}
            {...props}
        />
    )
}

export { Skeleton }
