"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Briefcase,
    FileText,
    ClipboardList,
    Building2,
    FolderOpen,
    FileSearch,
    Calendar,
    BarChart3,
    Chrome,
    Lightbulb,
    Bug,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Settings,
    HelpCircle,
    Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

interface NavLink {
    label: string;
    href: string;
    icon: typeof Home;
    badge?: string;
}

interface NavSection {
    label: string;
    icon: typeof Home;
    links: NavLink[];
}

const MAIN_LINKS: NavLink[] = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "OPT Tracker", href: "/dashboard/opt-dates", icon: Calendar },
    { label: "Job Tracker", href: "/dashboard/career/job-tracker", icon: ClipboardList },
    { label: "H-1B Sponsors", href: "/dashboard/career/h1b-sponsors", icon: Building2 },
    { label: "Case Status", href: "/dashboard/case-status", icon: FileSearch },
    { label: "Documents", href: "/dashboard/documents", icon: FolderOpen },
];

const CAREER_TOOLS: NavSection = {
    label: "Career Tools",
    icon: Briefcase,
    links: [
        { label: "Resume Generator", href: "/dashboard/career/resume-generator", icon: FileText },
        { label: "ATS Scanner", href: "/dashboard/career/ats-scanner", icon: BarChart3 },
    ]
};

const OPT_TOOLS: NavSection = {
    label: "OPT Tools",
    icon: Wrench,
    links: [
        { label: "OPT Apply", href: "/dashboard/opt-tools/opt-apply", icon: FileText },
        { label: "OPT Clock", href: "/dashboard/opt-tools/opt-clock", icon: Calendar },
        { label: "STEM Apply", href: "/dashboard/opt-tools/stem-apply", icon: FileText },
        { label: "STEM Clock", href: "/dashboard/opt-tools/stem-clock", icon: Calendar },
    ]
};

const FOOTER_LINKS: NavLink[] = [
    { label: "Chrome Extension", href: "/auth/extension", icon: Chrome },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
    { label: "Help", href: "/dashboard/help", icon: HelpCircle },
];

export function Sidebar({ isCollapsed = false, onToggleCollapse, isMobileOpen = false, onMobileClose }: SidebarProps) {
    const pathname = usePathname();
    const [expandedSections, setExpandedSections] = useState<string[]>(["Career Tools"]);

    // Close mobile menu on navigation
    const handleLinkClick = () => {
        if (onMobileClose) {
            onMobileClose();
        }
    };

    const toggleSection = (label: string) => {
        setExpandedSections(prev =>
            prev.includes(label)
                ? prev.filter(l => l !== label)
                : [...prev, label]
        );
    };

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard";
        }
        return pathname.startsWith(href);
    };

    const NavLinkItem = ({ link }: { link: NavLink }) => {
        const Icon = link.icon;
        const active = isActive(link.href);

        return (
            <Link
                href={link.href}
                onClick={handleLinkClick}
                className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    active
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
            >
                <Icon className={cn("w-5 h-5 flex-shrink-0", active && "text-blue-600 dark:text-blue-400")} />
                {!isCollapsed && (
                    <>
                        <span className="flex-1">{link.label}</span>
                        {link.badge && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded">
                                {link.badge}
                            </span>
                        )}
                    </>
                )}
            </Link>
        );
    };

    const NavSectionItem = ({ section }: { section: NavSection }) => {
        const Icon = section.icon;
        const isExpanded = expandedSections.includes(section.label);
        const hasActiveChild = section.links.some(link => isActive(link.href));

        return (
            <div>
                <button
                    onClick={() => toggleSection(section.label)}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        hasActiveChild
                            ? "text-blue-700 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    )}
                >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                        <>
                            <span className="flex-1 text-left">{section.label}</span>
                            <ChevronDown className={cn(
                                "w-4 h-4 transition-transform",
                                isExpanded && "rotate-180"
                            )} />
                        </>
                    )}
                </button>

                {/* Expanded Links */}
                {!isCollapsed && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                        {section.links.map(link => (
                            <NavLinkItem key={link.href} link={link} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onMobileClose}
                />
            )}
            <aside
                className={cn(
                    "fixed left-0 top-14 bottom-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-40 transition-all duration-300",
                    // Desktop behavior
                    "hidden lg:flex",
                    isCollapsed ? "lg:w-16" : "lg:w-[200px]",
                    // Mobile behavior
                    isMobileOpen && "flex w-[260px] !left-0"
                )}
            >
                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {/* Main Links */}
                    {MAIN_LINKS.map(link => (
                        <NavLinkItem key={link.href} link={link} />
                    ))}

                    {/* Divider */}
                    <div className="my-3 border-t border-gray-200 dark:border-gray-700" />

                    {/* Expandable Sections */}
                    <NavSectionItem section={CAREER_TOOLS} />
                    <NavSectionItem section={OPT_TOOLS} />
                </nav>

                {/* Footer Links */}
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
                    {FOOTER_LINKS.map(link => (
                        <NavLinkItem key={link.href} link={link} />
                    ))}

                    {/* Collapse Toggle */}
                    {onToggleCollapse && (
                        <button
                            onClick={onToggleCollapse}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            {isCollapsed ? (
                                <ChevronRight className="w-5 h-5" />
                            ) : (
                                <>
                                    <ChevronLeft className="w-5 h-5" />
                                    <span className="text-xs">Collapse</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}
