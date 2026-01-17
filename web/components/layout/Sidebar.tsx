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
    LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    const [expandedSections, setExpandedSections] = useState<string[]>(["Career Tools"]);

    // Close mobile menu on navigation
    const handleLinkClick = () => {
        if (onMobileClose) {
            onMobileClose();
        }
    };

    // Sign out handler
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = async () => {
        if (isSigningOut) return;
        setIsSigningOut(true);
        try {
            await import("@/lib/supabaseClient").then(m => m.supabase.auth.signOut());
            // Force redirect to login
            window.location.href = '/login';
        } catch (error) {
            window.location.href = '/login';
        }
    };

    // Get user initials matching reference logic
    const getUserInitials = () => {
        if (userName) {
            const names = userName.split(' ').filter(Boolean);
            const initials = names.length > 1
                ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
                : names[0][0].toUpperCase();
            return initials;
        }

        if (userEmail) {
            const emailParts = userEmail.split('@')[0].split('.');
            const initials = emailParts.length > 1
                ? `${emailParts[0][0]}${emailParts[1][0]}`.toUpperCase()
                : emailParts[0].substring(0, 2).toUpperCase();
            return initials;
        }

        return "U";
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

                    {/* Footer Section: Profile + SignOut + Toggle */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4 bg-white dark:bg-gray-900">
                        <div className={cn("flex items-center gap-3 px-1", isCollapsed ? "justify-center" : "")}>
                            <div className="relative flex-shrink-0">
                                {/* User Avatar Circle */}
                                <div
                                    className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-sm font-bold text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-sm"
                                    title={isCollapsed ? userEmail : undefined}
                                >
                                    {getUserInitials()}
                                </div>
                                {/* PRO Badge */}
                                {isPremium && (
                                    <div className="absolute -bottom-3.5 -right-0.5 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-lg border-2 border-white dark:border-gray-900 uppercase">
                                        Pro
                                    </div>
                                )}
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {userEmail || "Loading..."}
                                    </p>
                                    {isLoading ? (
                                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1" />
                                    ) : isPremium ? (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Premium Member</p>
                                    ) : (
                                        <Link
                                            href="/premium/checkout"
                                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                        >
                                            Upgrade to Pro
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sign Out Button */}
                        <button
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                                isCollapsed ? "justify-center" : ""
                            )}
                            title={isCollapsed ? "Sign Out" : undefined}
                        >
                            <LogOut className={cn("w-4 h-4 flex-shrink-0", isSigningOut ? "animate-spin" : "")} />
                            {!isCollapsed && <span className="text-sm font-medium">{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>}
                        </button>

                        {/* Collapse Toggle (Desktop) */}
                        <div className="hidden lg:flex justify-end pt-2">
                            <button
                                onClick={onToggleCollapse}
                                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            >
                                {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
