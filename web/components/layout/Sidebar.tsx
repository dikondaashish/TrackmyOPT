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
    Wrench,
    X
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

    // On mobile, the sidebar is always "expanded" when open, regardless of desktop state
    const effectiveCollapsed = isCollapsed && !isMobileOpen;

    // Close mobile menu on navigation
    // Close mobile menu on navigation
    const handleLinkClick = () => {
        if (isMobileOpen && onMobileClose) {
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

    // Tooltip state for fixed positioning to avoid overflow clipping
    const [tooltip, setTooltip] = useState<{ label: string; top: number; left: number } | null>(null);

    const handleTooltipEnter = (e: React.MouseEvent, label: string) => {
        if (!effectiveCollapsed) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            label,
            top: rect.top + (rect.height / 2),
            left: rect.right + 10 // Add some spacing
        });
    };

    const handleTooltipLeave = () => {
        setTooltip(null);
    };

    // Submenu state for collapsed sections (Careerflow style)
    const [submenu, setSubmenu] = useState<{ label: string; top: number; left: number; links: NavLink[] } | null>(null);
    const submenuTimeoutRef = useState<{ current: NodeJS.Timeout | null }>({ current: null })[0];

    const handleSubmenuEnter = (e: React.MouseEvent, section: NavSection) => {
        if (!effectiveCollapsed) return;
        if (submenuTimeoutRef.current) clearTimeout(submenuTimeoutRef.current);

        const rect = e.currentTarget.getBoundingClientRect();
        setSubmenu({
            label: section.label,
            top: rect.top,
            left: rect.right + 8, // slight gap
            links: section.links
        });
    };

    const handleSubmenuLeave = () => {
        // Delay hiding to allow moving mouse into the submenu
        submenuTimeoutRef.current = setTimeout(() => {
            setSubmenu(null);
        }, 100);
    };

    const handleSubmenuContentEnter = () => {
        if (submenuTimeoutRef.current) clearTimeout(submenuTimeoutRef.current);
    };

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard";
        }
        return pathname.startsWith(href);
    };

    // Standalone Component for Nav Link
    const SidebarNavLink = ({
        link,
        isActive,
        isCollapsed,
        onLinkClick,
        onTooltipEnter,
        onTooltipLeave
    }: {
        link: NavLink;
        isActive: boolean;
        isCollapsed: boolean;
        onLinkClick: () => void;
        onTooltipEnter: (e: React.MouseEvent, label: string) => void;
        onTooltipLeave: () => void;
    }) => {
        const Icon = link.icon;

        return (
            <Link
                href={link.href}
                onClick={onLinkClick}
                onMouseEnter={(e) => onTooltipEnter(e, link.label)}
                onMouseLeave={onTooltipLeave}
                className={cn(
                    "group relative z-20 cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
                    isCollapsed && "justify-center px-0 w-10 h-10 mx-auto"
                )}
            >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-blue-600 dark:text-blue-400")} />
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

    // Standalone Component for Nav Section
    const SidebarNavSection = ({
        section,
        isExpanded,
        isActiveCheck,
        isCollapsed,
        onToggle,
        onToggleCollapse,
        onTooltipEnter,
        onTooltipLeave,
        onSubmenuEnter,
        onSubmenuLeave
    }: {
        section: NavSection;
        isExpanded: boolean;
        isActiveCheck: (href: string) => boolean;
        isCollapsed: boolean;
        onToggle: (label: string) => void;
        onToggleCollapse?: () => void;
        onTooltipEnter: (e: React.MouseEvent, label: string) => void;
        onTooltipLeave: () => void;
        onSubmenuEnter: (e: React.MouseEvent, section: NavSection) => void;
        onSubmenuLeave: () => void;
    }) => {
        const Icon = section.icon;
        const hasActiveChild = section.links.some(link => isActiveCheck(link.href));

        return (
            <div>
                <button
                    onClick={() => {
                        if (isCollapsed) {
                            if (onToggleCollapse) onToggleCollapse();
                            // Also open the section so it's ready
                            if (!isExpanded) onToggle(section.label);
                        } else {
                            onToggle(section.label);
                        }
                    }}
                    onMouseEnter={(e) => {
                        onTooltipEnter(e, section.label);
                        onSubmenuEnter(e, section);
                    }}
                    onMouseLeave={(e) => {
                        onTooltipLeave();
                        onSubmenuLeave();
                    }}
                    className={cn(
                        "w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        hasActiveChild
                            ? "text-blue-700 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
                        isCollapsed && "justify-center cursor-default px-0 w-10 h-10 mx-auto"
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
                            <SidebarNavLink
                                key={link.href}
                                link={link}
                                isActive={isActiveCheck(link.href)}
                                isCollapsed={false} // Always expanded inside submenu
                                onLinkClick={() => { }} // No mobile close needed usually, or pass it
                                onTooltipEnter={onTooltipEnter}
                                onTooltipLeave={onTooltipLeave}
                            />
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
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
                    onClick={onMobileClose}
                />
            )}
            <aside
                className={cn(
                    "fixed bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transition-transform duration-300 ease-out",
                    // Desktop: below header, normal sizing
                    "lg:top-14 lg:h-[calc(100vh-56px)] lg:translate-x-0",
                    "lg:block",
                    isCollapsed ? "lg:w-16" : "lg:w-[230px]",
                    // Mobile: full height, slide from left
                    "top-0 left-0 h-full w-[280px]",
                    "lg:left-0",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Sidebar Flex Container */}
                <div className="flex flex-col h-full">
                    {/* Mobile Header with Close Button */}
                    <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">Menu</span>
                        <button
                            onClick={onMobileClose}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {/* Scrollable Navigation Area */}
                    <div className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                        <nav className="p-3 space-y-1">
                            {/* Main Links */}
                            {MAIN_LINKS.map(link => (
                                <SidebarNavLink
                                    key={link.href}
                                    link={link}
                                    isActive={isActive(link.href)}
                                    isCollapsed={effectiveCollapsed}
                                    onLinkClick={handleLinkClick}
                                    onTooltipEnter={handleTooltipEnter}
                                    onTooltipLeave={handleTooltipLeave}
                                />
                            ))}

                            {/* Divider */}
                            <div className="my-3 border-t border-gray-200 dark:border-gray-700" />

                            {/* Expandable Sections */}
                            <SidebarNavSection
                                section={CAREER_TOOLS}
                                isExpanded={expandedSections.includes(CAREER_TOOLS.label)}
                                isActiveCheck={isActive}
                                isCollapsed={effectiveCollapsed}
                                onToggle={toggleSection}
                                onToggleCollapse={onToggleCollapse}
                                onTooltipEnter={handleTooltipEnter}
                                onTooltipLeave={handleTooltipLeave}
                                onSubmenuEnter={handleSubmenuEnter}
                                onSubmenuLeave={handleSubmenuLeave}
                            />
                            <SidebarNavSection
                                section={OPT_TOOLS}
                                isExpanded={expandedSections.includes(OPT_TOOLS.label)}
                                isActiveCheck={isActive}
                                isCollapsed={effectiveCollapsed}
                                onToggle={toggleSection}
                                onToggleCollapse={onToggleCollapse}
                                onTooltipEnter={handleTooltipEnter}
                                onTooltipLeave={handleTooltipLeave}
                                onSubmenuEnter={handleSubmenuEnter}
                                onSubmenuLeave={handleSubmenuLeave}
                            />

                            {/* Divider before Footer Links */}
                            <div className="my-3 border-t border-gray-200 dark:border-gray-700" />

                            {/* Footer Links */}
                            {FOOTER_LINKS.map(link => (
                                <SidebarNavLink
                                    key={link.href}
                                    link={link}
                                    isActive={isActive(link.href)}
                                    isCollapsed={effectiveCollapsed}
                                    onLinkClick={handleLinkClick}
                                    onTooltipEnter={handleTooltipEnter}
                                    onTooltipLeave={handleTooltipLeave}
                                />
                            ))}
                        </nav>
                    </div>

                    {/* Fixed/Sticky Bottom Area for Profile & Collapse Toggle */}
                    <div className={cn(
                        "border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 z-10 flex",
                        effectiveCollapsed ? "flex-col items-center justify-center gap-4 py-4" : "flex-row items-center justify-between gap-2 p-3"
                    )}>
                        {/* Profile Menu */}
                        <div className="flex-1 min-w-0">
                            <UserProfileMenu
                                userEmail={userEmail}
                                userName={userName}
                                isCollapsed={effectiveCollapsed}
                                isPremium={isPremium}
                                isLoading={isLoading}
                            />
                        </div>

                        {/* Collapse Toggle - Desktop Only */}
                        {onToggleCollapse && (
                            <button
                                onClick={onToggleCollapse}
                                onMouseEnter={(e) => handleTooltipEnter(e, isCollapsed ? "Expand" : "Collapse")}
                                onMouseLeave={handleTooltipLeave}
                                className="hidden lg:flex group relative flex-shrink-0 items-center justify-center p-2 rounded-lg text-gray-900 dark:text-gray-100 hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 transition-colors"
                                aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                            >
                                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="16" width="16" xmlns="http://www.w3.org/2000/svg" className={cn("transition-transform duration-200", isCollapsed && "rotate-180")}>
                                    <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                                    <path d="M15 4v16"></path>
                                    <path d="M10 10l-2 2l2 2"></path>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Global Fixed Tooltip Portal */}
            {
                tooltip && effectiveCollapsed && (
                    <div
                        className="fixed z-[100] px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in duration-200"
                        style={{
                            top: tooltip.top,
                            left: tooltip.left,
                            transform: 'translateY(-50%)'
                        }}
                    >
                        {tooltip.label}
                        {/* Arrow */}
                        <div className="absolute top-1/2 left-[-4px] -translate-y-1/2 bg-gray-900 w-2 h-2 transform rotate-45" />
                    </div>
                )
            }

            {/* Floating Submenu Portal for Collapsed Sections */}
            {
                submenu && effectiveCollapsed && (
                    <div
                        className="fixed z-[100] min-w-[180px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-1 animate-in fade-in zoom-in-95 duration-100"
                        style={{
                            top: submenu.top,
                            left: submenu.left,
                        }}
                        onMouseEnter={handleSubmenuContentEnter}
                        onMouseLeave={handleSubmenuLeave}
                    >
                        {/* Header */}
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 mb-1">
                            {submenu.label}
                        </div>
                        {/* Links */}
                        <div className="flex flex-col gap-0.5">
                            {submenu.links.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => {
                                        setSubmenu(null);
                                        handleLinkClick();
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md transition-colors"
                                >
                                    <link.icon className="w-4 h-4" />
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )
            }
        </>
    );
}
