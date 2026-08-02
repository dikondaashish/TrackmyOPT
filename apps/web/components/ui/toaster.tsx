"use client"

import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "./toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
    const { toasts, dismiss } = useToast()

    return (
        <ToastProvider>
            <ToastViewport>
                {toasts.map(function ({ id, title, description, action, ...props }) {
                    return (
                        <Toast key={id} {...props}>
                            <div className="grid min-w-0 flex-1 gap-1">
                                {title && <ToastTitle>{title}</ToastTitle>}
                                {description && (
                                    <ToastDescription>{description}</ToastDescription>
                                )}
                            </div>
                            {action}
                            <ToastClose onClick={() => dismiss(id)} />
                        </Toast>
                    )
                })}
            </ToastViewport>
        </ToastProvider>
    )
}
