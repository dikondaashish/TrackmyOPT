"use client"

import * as React from "react"
import { X } from "lucide-react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { getPortalRoot } from "@/lib/portal-root"

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

type DialogContextValue = {
  onOpenChange?: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue>({});

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange?.(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!open || !mounted) return null;

  return createPortal(
    <DialogContext.Provider value={{ onOpenChange }}>
      <div className="fixed inset-0 z-50">
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => onOpenChange?.(false)}
        />
        {children}
      </div>
    </DialogContext.Provider>,
    getPortalRoot()
  );
};

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }
>(({ className, children, onClose, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DialogContext);
  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          className={cn(
            "relative bg-background border rounded-lg shadow-lg animate-fade-in",
            "w-full max-w-lg",
            className
          )}
          {...props}
        >
          {children}
          <button
            type="button"
            aria-label="Close"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleClose();
            }}
            className="absolute right-4 top-4 z-20 rounded-sm p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>
    </div>
  );
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
}
