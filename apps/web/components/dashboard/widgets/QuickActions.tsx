"use client";

import Link from "next/link";
import { 
  Calendar, 
  Briefcase, 
  MapPin, 
  FileText, 
  Upload, 
  Bell,
  Calculator,
  Shield,
  GraduationCap
} from "lucide-react";

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
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    id: "report-employment",
    label: "Report Employment",
    description: "Add or update job",
    href: "/dashboard/opt-dates#employment",
    icon: <Briefcase className="w-5 h-5" />,
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  {
    id: "upload-docs",
    label: "Upload Documents",
    description: "Store important files",
    href: "/dashboard/documents",
    icon: <Upload className="w-5 h-5" />,
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    id: "case-status",
    label: "Check Case",
    description: "USCIS case status",
    href: "/dashboard/case-status",
    icon: <FileText className="w-5 h-5" />,
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    id: "opt-tools",
    label: "OPT Calculator",
    description: "Calculate deadlines",
    href: "/dashboard/opt-tools",
    icon: <Calculator className="w-5 h-5" />,
    color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
  {
    id: "notifications",
    label: "Email Alerts",
    description: "Manage reminders",
    href: "/dashboard/settings#notifications",
    icon: <Bell className="w-5 h-5" />,
    color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
  },
  {
    id: "education",
    label: "Education",
    description: "Update degree & major",
    href: "/dashboard/settings",
    icon: <GraduationCap className="w-5 h-5" />,
    color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {QUICK_ACTIONS.map((action) => (
        <Link
          key={action.id}
          href={action.href}
          className="group flex flex-col items-center p-4 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className={`p-3 rounded-xl ${action.color} mb-3 group-hover:scale-110 transition-transform`}>
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
