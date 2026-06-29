import Link from "next/link";
import { cn } from "@/lib/utils";

interface ImmigrationContentDisclaimerProps {
  className?: string;
}

export function ImmigrationContentDisclaimer({
  className,
}: ImmigrationContentDisclaimerProps) {
  return (
    <p
      className={cn(
        "text-xs text-gray-500 dark:text-gray-400 leading-relaxed",
        className
      )}
      role="note"
    >
      This content is for educational purposes only and is not legal or immigration
      advice. Always verify information with your DSO, employer, or a licensed
      immigration attorney.{" "}
      <Link
        href="/disclaimer"
        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
      >
        Read our full disclaimer
      </Link>
      .
    </p>
  );
}
