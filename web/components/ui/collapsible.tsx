"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  icon?: React.ReactNode;
}

export function Collapsible({
  title,
  children,
  defaultOpen = false,
  className = "",
  titleClassName = "",
  contentClassName = "",
  icon,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className={`rounded-lg ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg ${titleClassName}`}
      >
        <div className="flex items-center gap-2 flex-1">
          {icon}
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className={`px-3 pb-3 pt-2 ${contentClassName}`}>
          {children}
        </div>
      )}
    </div>
  );
}
