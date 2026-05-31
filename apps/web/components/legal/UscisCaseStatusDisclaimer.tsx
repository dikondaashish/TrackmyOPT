import { CASE_STATUS_ALERT_DISCLAIMER, CASE_STATUS_DISCLAIMER } from "@/lib/legal/legal-config";
import { cn } from "@/lib/utils";

interface UscisCaseStatusDisclaimerProps {
  variant?: "default" | "compact" | "alert";
  className?: string;
  showAlertNote?: boolean;
}

export function UscisCaseStatusDisclaimer({
  variant = "default",
  className,
  showAlertNote = false,
}: UscisCaseStatusDisclaimerProps) {
  const text = showAlertNote ? CASE_STATUS_ALERT_DISCLAIMER : CASE_STATUS_DISCLAIMER;

  if (variant === "compact") {
    return (
      <p className={cn("text-xs text-muted-foreground leading-relaxed", className)} role="note">
        {text}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-amber-200/80 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/30 p-3 text-sm text-amber-950 dark:text-amber-100",
        variant === "alert" && "border-blue-200/80 bg-blue-50/80 dark:border-blue-900/50 dark:bg-blue-950/30 text-blue-950 dark:text-blue-100",
        className
      )}
      role="note"
    >
      <p className="leading-relaxed m-0">{text}</p>
    </div>
  );
}
