"use client";
import {
  LayoutDashboard,
  Calendar,
  ClipboardCheck,
  Clock,
  FileText,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Receipt,
  Briefcase,
  ChevronDown,
  Globe,
  Lightbulb,
  Bug,
  Building2,
  ClipboardList
} from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  badge?: string | null;
}

interface ExpandableSection {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: MenuItem[];
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<string[]>(["Career Hub"]);

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Calendar, label: "OPT Dates", path: "/dashboard/opt-dates" },
    { icon: ClipboardCheck, label: "Case Status", path: "/dashboard/case-status" },
    { icon: Clock, label: "OPT Tools", path: "/dashboard/opt-tools" },
  ];

  const expandableSections: ExpandableSection[] = [
    {
      icon: Briefcase,
      label: "Career Hub",
      children: [
        { icon: ClipboardList, label: "Job Tracker", path: "/dashboard/career/job-tracker" },
        { icon: Building2, label: "H-1B Sponsors", path: "/dashboard/career/h1b-sponsors" },
      ]
    }
  ];

  const bottomMenuItems: MenuItem[] = [
    { icon: Shield, label: "Health Insurance", path: "/dashboard/opt-health-insurance-finder", badge: "From $0" },
    { icon: FileText, label: "Documents", path: "/dashboard/documents" },
    { icon: Receipt, label: "Tax Filing", path: "/dashboard/tax-filing", badge: "Free" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
    { icon: HelpCircle, label: "Help", path: "/dashboard/help" },
  ];

  const utilityLinks = [
    { icon: Globe, label: "Chrome Extension", href: "https://chrome.google.com/webstore" },
    { icon: Lightbulb, label: "Suggest a Feature", href: "mailto:feedback@trackmyopt.com" },
    { icon: Bug, label: "Report a bug", href: "mailto:support@trackmyopt.com" },
  ];

  const toggleSection = (label: string) => {
    setExpandedSections(prev =>
      prev.includes(label)
        ? prev.filter(s => s !== label)
        : [...prev, label]
    );
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  const renderMenuItem = (item: MenuItem, isNested = false) => {
    const active = isActive(item.path);
    return (
      <button
        key={item.path}
        onClick={() => router.push(item.path)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
          isNested && "pl-10",
          active
            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
          collapsed && "justify-center px-2"
        )}
        title={collapsed ? item.label : undefined}
      >
        <item.icon className={cn("w-5 h-5 flex-shrink-0", active && "text-blue-600 dark:text-blue-400")} />
        {!collapsed && (
          <span className="flex-1 flex items-center justify-between text-sm">
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <span className="ml-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </span>
        )}
      </button>
    );
  };

  const renderExpandableSection = (section: ExpandableSection) => {
    const isExpanded = expandedSections.includes(section.label);
    const hasActiveChild = section.children.some(child => isActive(child.path));

    return (
      <div key={section.label}>
        <button
          onClick={() => !collapsed && toggleSection(section.label)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
            hasActiveChild
              ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? section.label : undefined}
        >
          <section.icon className={cn("w-5 h-5 flex-shrink-0", hasActiveChild && "text-blue-600 dark:text-blue-400")} />
          {!collapsed && (
            <>
              <span className="flex-1 text-sm text-left truncate">{section.label}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              />
            </>
          )}
        </button>
        {!collapsed && isExpanded && (
          <div className="mt-1 space-y-0.5">
            {section.children.map(child => renderMenuItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-14 h-[calc(100vh-56px)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-0.5">
          {/* Main Menu Items */}
          {menuItems.map(item => renderMenuItem(item))}

          {/* Expandable Sections */}
          {expandableSections.map(section => renderExpandableSection(section))}

          {/* Divider */}
          <div className="my-3 border-t border-gray-100 dark:border-gray-800" />

          {/* Bottom Menu Items */}
          {bottomMenuItems.map(item => renderMenuItem(item))}
        </div>
      </nav>

      {/* Bottom Utility Section */}
      <div className="p-2 border-t border-gray-100 dark:border-gray-800">
        {/* Utility Links */}
        {!collapsed && (
          <div className="space-y-0.5 mb-2">
            {utilityLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm"
              >
                <link.icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{link.label}</span>
              </a>
            ))}
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors",
            collapsed && "px-2"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
