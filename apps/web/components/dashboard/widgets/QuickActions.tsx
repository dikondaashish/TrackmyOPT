"use client";

import Link from "next/link";
import { 
  Calendar, 
  Briefcase, 
  FileText, 
  Upload, 
  Bell,
  Calculator} from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "edit-dates",
    label: "Edit Dates",
    description: "Update OPT timeline",
    href: "/dashboard/opt-dates",
    icon: <Calendar className="w-5 h-5" />,
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  {
    id: "report-employment",
    label: "Report Employment",
    description: "Add or update job",
    href: "/dashboard/opt-dates#employment",
    icon: <Briefcase className="w-5 h-5" />,
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  {
    id: "upload-docs",
    label: "Upload Documents",
    description: "Store important files",
    href: "/dashboard/documents",
    icon: <Upload className="w-5 h-5" />,
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  {
    id: "case-status",
    label: "Check Case",
    description: "USCIS case status",
    href: "/dashboard/case-status",
    icon: <FileText className="w-5 h-5" />,
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  {
    id: "opt-tools",
    label: "OPT Calculator",
    description: "Calculate deadlines",
    href: "/dashboard/opt-tools",
    icon: <Calculator className="w-5 h-5" />,
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  {
    id: "notifications",
    label: "Email Alerts",
    description: "Manage reminders",
    href: "/dashboard/settings#notifications",
    icon: <Bell className="w-5 h-5" />,
    color: "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {QUICK_ACTIONS.map((action) => (
        <Link
          key={action.id}
          href={action.href}
          className="group flex flex-col items-center max-md:min-h-[88px] p-4 bg-card border border-border rounded-xl shadow-card hover:border-primary-muted hover:shadow-elevated transition-[box-shadow,border-color]"
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color} mb-3`}>
            {action.icon}
          </div>
          <span className="text-sm font-medium text-center">{action.label}</span>
          <span className="text-xs text-muted-foreground text-center mt-0.5 hidden sm:block">
            {action.description}
          </span>
        </Link>
      ))}
    </div>
  );
}
