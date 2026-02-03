import { cn } from "@/lib/utils";
import React from "react";

interface TypographyProps extends React.HTMLAttributes<HTMLHeadingElement | HTMLParagraphElement> {
    children: React.ReactNode;
    className?: string;
}

export function H1({ children, className, ...props }: TypographyProps) {
    return (
        <h1
            className={cn(
                "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
                className
            )}
            {...props}
        >
            {children}
        </h1>
    );
}

export function H2({ children, className, ...props }: TypographyProps) {
    return (
        <h2
            className={cn(
                "scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0",
                className
            )}
            {...props}
        >
            {children}
        </h2>
    );
}

export function H3({ children, className, ...props }: TypographyProps) {
    return (
        <h3
            className={cn(
                "scroll-m-20 text-2xl font-semibold tracking-tight",
                className
            )}
            {...props}
        >
            {children}
        </h3>
    );
}

export function H4({ children, className, ...props }: TypographyProps) {
    return (
        <h4
            className={cn(
                "scroll-m-20 text-xl font-semibold tracking-tight",
                className
            )}
            {...props}
        >
            {children}
        </h4>
    );
}

export function P({ children, className, ...props }: TypographyProps) {
    return (
        <p
            className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
            {...props}
        >
            {children}
        </p>
    );
}

export function Lead({ children, className, ...props }: TypographyProps) {
    return (
        <p
            className={cn("text-xl text-muted-foreground", className)}
            {...props}
        >
            {children}
        </p>
    );
}

export function Large({ children, className, ...props }: TypographyProps) {
    return (
        <div
            className={cn("text-lg font-semibold", className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function Small({ children, className, ...props }: TypographyProps) {
    return (
        <small
            className={cn("text-sm font-medium leading-none", className)}
            {...props}
        >
            {children}
        </small>
    );
}

export function Muted({ children, className, ...props }: TypographyProps) {
    return (
        <p
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        >
            {children}
        </p>
    );
}

export function GradientText({ children, className, gradient = "blue", ...props }: TypographyProps & { gradient?: "blue" | "purple" | "amber" | "green" | "cyan" }) {
    const gradients = {
        blue: "from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400",
        purple: "from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400",
        amber: "from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400",
        green: "from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400",
        cyan: "from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400",
    };

    return (
        <span
            className={cn(
                "bg-clip-text text-transparent bg-gradient-to-r",
                gradients[gradient],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
