"use client";

import { Clock, Calculator, Calendar, FileText, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OptTool {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    href: string;
    iconBg: string;
    iconColor: string;
}

const OPT_TOOLS: OptTool[] = [
    {
        id: "countdown",
        icon: Clock,
        title: "OPT Countdown",
        description: "Track your remaining OPT/STEM OPT days and important deadlines.",
        href: "/dashboard/opt-dates",
        iconBg: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
        id: "unemployment",
        icon: Calculator,
        title: "Unemployment Calculator",
        description: "Calculate your remaining unemployment days on OPT/STEM OPT.",
        href: "/dashboard/opt-dates",
        iconBg: "bg-amber-100 dark:bg-amber-900/30",
        iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
        id: "timeline",
        icon: Calendar,
        title: "OPT Timeline",
        description: "View your complete OPT journey with key milestones and dates.",
        href: "/dashboard/opt-dates",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
        iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
        id: "documents",
        icon: FileText,
        title: "Document Vault",
        description: "Securely store and manage your OPT-related documents.",
        href: "/dashboard/documents",
        iconBg: "bg-purple-100 dark:bg-purple-900/30",
        iconColor: "text-purple-600 dark:text-purple-400",
    },
];

export function OptToolsSection() {
    const router = useRouter();

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        OPT Management
                    </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                    OPT Tools
                </h1>
                <p className="text-muted-foreground">
                    Essential tools to manage your OPT/STEM OPT journey
                </p>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {OPT_TOOLS.map((tool) => (
                    <Card key={tool.id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${tool.iconBg}`}>
                                <tool.icon className={`w-6 h-6 ${tool.iconColor}`} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-foreground mb-1">
                                    {tool.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {tool.description}
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(tool.href)}
                                >
                                    Open Tool
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
