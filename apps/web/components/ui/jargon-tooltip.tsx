"use client"

import * as React from "react"
import { HelpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const JARGON_DICTIONARY: Record<string, string> = {
  "EAD": "Employment Authorization Document: A card issued by USCIS that proves your legal right to work in the US.",
  "DSO": "Designated School Official: The main contact at your university for international student immigration matters.",
  "OPT": "Optional Practical Training: Temporary employment directly related to an F-1 student's major area of study.",
  "STEM OPT": "A 24-month extension of OPT for F-1 students with a degree in Science, Technology, Engineering, or Math.",
  "USCIS": "U.S. Citizenship and Immigration Services: The federal agency that oversees lawful immigration to the US.",
  "I-983": "Training Plan for STEM OPT Students: A required form completed by you and your employer to outline your training goals.",
  "I-20": "A document issued by your university that certifies you are eligible for F-1 student status.",
  "SEVP": "Student and Exchange Visitor Program: The DHS program that manages foreign students and exchange visitors in the US.",
  "SEVIS": "Student and Exchange Visitor Information System: The database used by the government to track international students.",
  "E-VERIFY": "An internet-based system that allows businesses to determine the eligibility of their employees to work in the US. Required for STEM OPT employers.",
  "CAP-GAP": "An extension of F-1 status and work authorization for students with a pending or approved H-1B petition.",
  "H-1B": "A visa for temporary workers in specialty occupations that require theoretical or technical expertise."
}

interface JargonTooltipProps {
  term: string;
  definition?: string; // Optional override
  children?: React.ReactNode; // Optional custom trigger content
  className?: string;
  showIcon?: boolean;
}

export function JargonTooltip({ term, definition, children, className, showIcon = true }: JargonTooltipProps) {
  const def = definition || JARGON_DICTIONARY[term.toUpperCase()] || "Definition not found.";
  
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("inline-flex items-center gap-1 border-b border-dashed border-gray-400 hover:border-primary hover:text-primary transition-colors cursor-help px-0.5", className)}>
            {children || term}
            {showIcon && <HelpCircle className="w-3 h-3 text-gray-400 hover:text-primary transition-colors" />}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px] p-3 text-sm leading-relaxed shadow-xl border-border bg-popover text-popover-foreground z-[100]">
          <p><strong className="font-semibold text-primary">{term}:</strong> {def}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
