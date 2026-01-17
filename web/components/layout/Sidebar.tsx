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
import { UserProfileMenu } from "./UserProfileMenu";
import { useState } from "react";

interface SidebarProps {
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
    userEmail?: string;
    userName?: string;
    isPremium?: boolean;
    isLoading?: boolean;
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

export function Sidebar({
    isCollapsed = false,
    onToggleCollapse,
    isMobileOpen = false,
    onMobileClose,
    userEmail,
    userName,
    isPremium,
    isLoading
}: SidebarProps) {
    const pathname = usePathname();
    const [expandedSections, setExpandedSections] = useState<string[]>([]);

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
                    "fixed left-0 top-14 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 transition-all duration-300",
                    // Height calculation: 100vh - header height (56px) - some bottom padding
                    "h-[calc(100vh-56px)]",
                    // Desktop behavior
                    "hidden lg:block",
                    isCollapsed ? "lg:w-16" : "lg:w-[230px]",
                    // Mobile behavior
                    isMobileOpen && "block w-[260px] !left-0"
                )}
            >
                {/* Sidebar Flex Container */}
                <div className="flex flex-col h-full">
                    {/* Scrollable Navigation Area */}
                    <div className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                        <nav className="p-3 space-y-1">
                            {/* Main Links */}
                            {MAIN_LINKS.map(link => (
                                <NavLinkItem key={link.href} link={link} />
                            ))}

                            {/* Divider */}
                            <div className="my-3 border-t border-gray-200 dark:border-gray-700" />

                            {/* Expandable Sections */}
                            <NavSectionItem section={CAREER_TOOLS} />
                            <NavSectionItem section={OPT_TOOLS} />

                            {/* Divider before Footer Links */}
                            <div className="my-3 border-t border-gray-200 dark:border-gray-700" />

                            {/* Footer Links */}
                            {FOOTER_LINKS.map(link => (
                                <NavLinkItem key={link.href} link={link} />
                            ))}
                        </nav>
                    </div>

                    {/* Fixed/Sticky Bottom Area for Profile & Collapse Toggle */}
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-10 flex items-center justify-between gap-2">
                        {/* Profile Menu */}
                        <div className="flex-1 min-w-0">
                            <UserProfileMenu
                                userEmail={userEmail}
                                userName={userName}
                                isCollapsed={isCollapsed}
                                isPremium={isPremium}
                                isLoading={isLoading}
                            />
                        </div>

                        {/* Collapse Toggle */}
                        {onToggleCollapse && (
                            <button
                                onClick={onToggleCollapse}
                                className="group flex-shrink-0 flex items-center justify-center p-2 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 transition-colors"
                                aria-label="Collapse Sidebar"
                            >
                                {isCollapsed ? (
                                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="16" width="16" xmlns="http://www.w3.org/2000/svg" className="transform rotate-180">
                                        <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                                        <path d="M15 4v16"></path>
                                        <path d="M10 10l-2 2l2 2"></path>
                                    </svg>
                                ) : (
                                    <>
                                        <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                                            <path d="M15 4v16"></path>
                                            <path d="M10 10l-2 2l2 2"></path>
                                        </svg>
                                        {/* Tooltip */}
                                        <div className="absolute right-full mr-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                            Collapse
                                        </div>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
