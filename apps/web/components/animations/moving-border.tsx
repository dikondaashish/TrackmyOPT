"use client";
import React from "react";
import { cn } from "@/lib/utils";

export function Button({
  borderRadius = "1.75rem",
  children,
  as: Component = "button",
  containerClassName,
  borderClassName,
  className,
  ...otherProps
}: {
  borderRadius?: string;
  children: React.ReactNode;
  as?: any;
  containerClassName?: string;
  borderClassName?: string;
  className?: string;
  [key: string]: any;
}) {
  return (
    <Component
      className={cn(
        "relative text-xl p-[2px] overflow-hidden group",
        containerClassName
      )}
      style={{
        borderRadius: borderRadius,
      }}
      {...otherProps}
    >
      {/* Animated border gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ borderRadius: borderRadius }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin-slow blur-sm" />
      </div>
      
      {/* Rotating border effect */}
      <div 
        className={cn(
          "absolute inset-0 animate-border-spin",
          borderClassName
        )}
        style={{ borderRadius: borderRadius }}
      />

      {/* Button content */}
      <div
        className={cn(
          "relative flex items-center justify-center w-full h-full antialiased",
          className
        )}
        style={{
          borderRadius: `calc(${borderRadius} * 0.96)`,
        }}
      >
        {children}
      </div>
    </Component>
  );
}
