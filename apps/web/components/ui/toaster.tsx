"use client"

import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "./toast"
import { useToast } from "@/hooks/useToast"

export function Toaster() {
    const { toasts, dismiss } = useToast()

    return (
        <ToastProvider>
            <ToastViewport>
                {toasts.map(function ({ id, title, description, action, open, onOpenChange, ...props }) {
                    return (
                        <Toast key={id} {...props}>
                            <div className="grid min-w-0 flex-1 gap-1 pr-2">
                                {title && <ToastTitle>{title}</ToastTitle>}
                                {description && (
                                    <ToastDescription>{description}</ToastDescription>
                                )}
                            </div>
                            {action}
                            <ToastClose
                                type="button"
                                aria-label="Close notification"
                                onClick={(event) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    dismiss(id)
                                }}
                            />
                        </Toast>
                    )
                })}
            </ToastViewport>
        </ToastProvider>
    )
}
