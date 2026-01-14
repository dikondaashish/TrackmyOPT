"use client";

import { Calculator, Clock, CalendarCheck, FileSpreadsheet, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface OptTool {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  highlights: string[];
  ctaText: string;
  href: string;
  badge: string;
  badgeColor: string;
  category: string;
}

const OPT_TOOLS: OptTool[] = [
  {
    id: "day-counter",
    icon: Clock,
    title: "90-Day Counter",
    description: "Track your unemployment days and stay compliant with OPT requirements.",
    highlights: [
      "Real-time day tracking",
      "Email alerts",
      "Compliance dashboard",
    ],
    ctaText: "Start Tracking",
    href: "/dashboard",
    badge: "Essential",
    badgeColor: "from-blue-500 to-cyan-600",
    category: "Compliance",
  },
  {
    id: "opt-calculator",
    icon: Calculator,
    title: "OPT Calculator",
    description: "Calculate your OPT/STEM OPT end dates and important deadlines.",
    highlights: [
      "Automatic calculations",
      "STEM extension dates",
      "Grace period tracking",
    ],
    ctaText: "Calculate Dates",
    href: "/dashboard/opt-dates",
    badge: "Calculator",
    badgeColor: "from-emerald-500 to-teal-600",
    category: "Planning",
  },
  {
    id: "timeline",
    icon: CalendarCheck,
    title: "OPT Timeline",
    description: "Visual timeline of your OPT journey with key milestones and deadlines.",
    highlights: [
      "Visual milestones",
      "Key dates reminder",
      "Status updates",
    ],
    ctaText: "View Timeline",
    href: "/dashboard/opt-dates",
    badge: "Timeline",
    badgeColor: "from-purple-500 to-pink-600",
    category: "Visualization",
  },
  {
    id: "document-checklist",
    icon: FileSpreadsheet,
    title: "Document Checklist",
    description: "Keep track of all required documents for your OPT and STEM applications.",
    highlights: [
      "Document vault",
      "Expiry reminders",
      "Secure storage",
    ],
    ctaText: "Manage Documents",
    href: "/dashboard/documents",
    badge: "Vault",
    badgeColor: "from-amber-500 to-orange-600",
    category: "Documents",
  },
];

export function OptToolsSection() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          {/* Badge */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-500/30">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                OPT Tools
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              OPT Tools & Resources
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Essential tools to manage your OPT journey and stay compliant
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {OPT_TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => router.push(tool.href)}
              onMouseEnter={() => setHoveredCard(tool.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] text-left"
            >
              {/* Badge */}
              <div className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold uppercase text-white rounded-full bg-gradient-to-r ${tool.badgeColor}`}>
                {tool.badge}
              </div>

              {/* Content */}
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.badgeColor} flex items-center justify-center flex-shrink-0`}>
                  <tool.icon className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {tool.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tool.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </div>

              {/* Highlights */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
                <ul className="space-y-1.5">
                  {tool.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${tool.badgeColor}`} />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="mt-4 flex items-center justify-end">
                <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                  {tool.ctaText}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>

              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-300 pointer-events-none" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
