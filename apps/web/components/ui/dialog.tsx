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
  returnFocusRef: React.MutableRefObject<HTMLElement | null>;
};

const DialogContext = React.createContext<DialogContextValue | null>(null);

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const subscribeToNothing = () => () => undefined;
const getClientMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  const mounted = React.useSyncExternalStore(
    subscribeToNothing,
    getClientMountedSnapshot,
    getServerMountedSnapshot
  );
  const returnFocusRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
      returnFocusRef.current?.focus();
      returnFocusRef.current = null;
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
    <DialogContext.Provider value={{ onOpenChange, returnFocusRef }}>
      <div className="fixed inset-0 z-50">
        <div
          aria-hidden="true"
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
  const context = React.useContext(DialogContext);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const { onOpenChange } = context ?? {};

  React.useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const focusable = content.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    (focusable[0] ?? content).focus();

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = Array.from(content.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (items.length === 0) {
        event.preventDefault();
        content.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    content.addEventListener("keydown", trapFocus);
    return () => content.removeEventListener("keydown", trapFocus);
  }, []);
  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain pointer-events-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={(node) => {
            contentRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
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
            className="absolute right-2 top-2 z-20 flex min-h-11 min-w-11 items-center justify-center rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
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
