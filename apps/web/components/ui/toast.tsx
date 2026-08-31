"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// Simplified version of Shadcn UI Toast without Radix dependencies to avoid installation
// If Radix is available, we would use it, but this is a custom implementation for speed/compatibility.

type ToastProps = React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "destructive"
}

// Context for managing open state if needed, but for now we rely on the parent controller.
const ToastContext = React.createContext({})

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    return <ToastContext.Provider value={{}}>{children}</ToastContext.Provider>
}

const ToastViewport = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "pointer-events-none fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:max-w-[420px] sm:flex-col",
            className
        )}
        aria-live="polite"
        aria-atomic="true"
        {...props}
    />
))
ToastViewport.displayName = "ToastViewport"

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
    ({ className, variant, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "group pointer-events-auto relative flex w-full items-start justify-between gap-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
                    variant === "destructive"
                        ? "destructive group border-destructive bg-destructive text-destructive-foreground"
                        : "border bg-white text-foreground dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100",
                    className
                )}
                {...props}
            />
        )
    }
)
Toast.displayName = "Toast"

const ToastAction = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
    <button
        ref={ref}
        className={cn(
            "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
            className
        )}
        {...props}
    />
))
ToastAction.displayName = "ToastAction"

const ToastClose = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
    <button
        ref={ref}
        type="button"
        className={cn(
            "absolute right-1 top-1 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-md text-foreground/70 opacity-100 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
            className
        )}
        toast-close=""
        {...props}
    >
        <X className="h-4 w-4" aria-hidden="true" />
    </button>
))
ToastClose.displayName = "ToastClose"

const ToastTitle = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm font-semibold", className)}
        {...props}
    />
))
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm opacity-90 break-words", className)}
        {...props}
    />
))
ToastDescription.displayName = "ToastDescription"

export {
    ToastProvider,
    ToastViewport,
    Toast,
    ToastTitle,
    ToastDescription,
    ToastClose,
    ToastAction,
}
