"use client";

import { AlertTriangle, Building2, Bell, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CaseState } from "./StickyCaseSwitcher";

interface ActionCard {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  href?: string;
  onClick?: () => void;
  variant: "urgent" | "warning" | "neutral";
}

interface SmartNextStepsProps {
  caseState: CaseState;
  ppOverdueDays?: number;
  onOpenNotifications?: () => void;
  onOpenEVerify?: () => void;
}

const VARIANT_STYLES: Record<ActionCard["variant"], string> = {
  urgent:  "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20",
  warning: "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20",
  neutral: "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20",
};

const TITLE_STYLES: Record<ActionCard["variant"], string> = {
  urgent:  "text-red-700 dark:text-red-300",
  warning: "text-amber-700 dark:text-amber-300",
  neutral: "text-gray-800 dark:text-gray-200",
};

function buildCards(
  caseState: CaseState,
  ppOverdueDays = 0,
  onOpenNotifications?: () => void,
  onOpenEVerify?: () => void
): ActionCard[] {
  const cards: ActionCard[] = [];

  if (caseState === "urgent" && ppOverdueDays > 0) {
    cards.push({
      icon: <AlertTriangle className="w-5 h-5" />,
      title: "PP Overdue",
      body: `Contact USCIS PP unit — ${ppOverdueDays} business day${ppOverdueDays !== 1 ? "s" : ""} past deadline.`,
      cta: "Call (800) 375-5283",
      href: "tel:18003755283",
      variant: "urgent",
    });
  }

  if (caseState === "actionNeeded") {
    cards.push({
      icon: <AlertTriangle className="w-5 h-5" />,
      title: "Response Required",
      body: "USCIS needs additional documents. Contact your DSO or attorney immediately.",
      cta: "View RFE guidance",
      href: "https://my.uscis.gov",
      variant: "urgent",
    });
  }

  // STEM employer check nudge
  cards.push({
    icon: <Building2 className="w-5 h-5" />,
    title: "STEM Employer",
    body: "Verify E-Verify enrollment before filing STEM extension.",
    cta: "Check E-Verify",
    onClick: onOpenEVerify,
    variant: "warning",
  });

  // Monitor status
  cards.push({
    icon: <Bell className="w-5 h-5" />,
    title: "Case Monitored",
    body: "Auto-checks active. You will be notified on any status change.",
    cta: "Edit settings",
    onClick: onOpenNotifications,
    variant: "neutral",
  });

  return cards.slice(0, 3);
}

export function SmartNextSteps({ caseState, ppOverdueDays = 0, onOpenNotifications, onOpenEVerify }: SmartNextStepsProps) {
  const cards = buildCards(caseState, ppOverdueDays, onOpenNotifications, onOpenEVerify);

  if (cards.length === 0) return null;

  return (
    <div>
      <h2 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3 px-0.5">
        Next Steps
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((card, i) => (
          <div
            key={i}
            className={cn(
              "rounded-xl border p-4 flex flex-col gap-3",
              VARIANT_STYLES[card.variant]
            )}
          >
            <div className={cn(TITLE_STYLES[card.variant])}>
              {card.icon}
            </div>
            <div className="flex-1">
              <p className={cn("text-sm font-bold mb-1", TITLE_STYLES[card.variant])}>{card.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{card.body}</p>
            </div>
            {card.href ? (
              <Button size="sm" variant="outline" className="w-full gap-2 justify-between" asChild>
                <a href={card.href} target={card.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                  {card.cta}
                  {card.href.startsWith("tel:") ? <Phone className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </a>
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="w-full gap-2 justify-between" onClick={card.onClick}>
                {card.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
