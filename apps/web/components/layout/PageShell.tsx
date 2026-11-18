import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  title?: ReactNode;
  description?: ReactNode;
  /** Buttons or links shown on the right of the title. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * The one width and spacing every dashboard page uses. The dashboard layout
 * already pads the canvas, so pages must not add their own outer padding.
 */
export function PageShell({ title, description, actions, children, className }: PageShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl space-y-5", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h1 className="font-semibold text-foreground">{title}</h1>}
            {description && <p className="mt-0.5 text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </div>
  );
}
