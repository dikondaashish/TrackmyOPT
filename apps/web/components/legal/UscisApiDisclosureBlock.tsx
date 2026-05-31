import Link from "next/link";
import { USCIS_API_DISCLOSURE } from "@/lib/legal/legal-config";
import { cn } from "@/lib/utils";

export function UscisApiDisclosureBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4 text-sm text-slate-700 dark:text-slate-300",
        className
      )}
    >
      <p className="m-0 leading-relaxed">{USCIS_API_DISCLOSURE}</p>
      <p className="mt-2 mb-0 text-xs text-muted-foreground">
        <Link href="/disclaimer" className="underline underline-offset-2">
          Legal disclaimer
        </Link>
        {" · "}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
