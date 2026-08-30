"use client";

import { useState } from "react";
import {
  FileText,
  ExternalLink,
  BookOpen,
  HelpCircle,
  ChevronRight,
  Search,
  Building2,
  Scale,
  GraduationCap,
  Briefcase,
  Clock
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: "form" | "guide" | "faq" | "external";
  url: string;
  isExternal: boolean;
  icon: React.ReactNode;
  tags: string[];
}

const RESOURCES: Resource[] = [
  {
    id: "i-765",
    title: "Form I-765",
    description: "Application for Employment Authorization Document (EAD)",
    category: "form",
    url: "https://www.uscis.gov/i-765",
    isExternal: true,
    icon: <FileText className="w-5 h-5" />,
    tags: ["ead", "employment", "application"],
  },
  {
    id: "i-983",
    title: "Form I-983",
    description: "Training Plan for STEM OPT Students",
    category: "form",
    url: "https://www.ice.gov/doclib/sevis/pdf/i983.pdf",
    isExternal: true,
    icon: <FileText className="w-5 h-5" />,
    tags: ["stem", "training", "employer"],
  },
  {
    id: "i-20",
    title: "Form I-20",
    description: "Certificate of Eligibility for Student Status",
    category: "form",
    url: "https://www.ice.gov/sevis/i-20-request",
    isExternal: true,
    icon: <GraduationCap className="w-5 h-5" />,
    tags: ["student", "eligibility", "sevis"],
  },
  {
    id: "opt-guide",
    title: "OPT Application Guide",
    description: "Step-by-step guide to applying for OPT",
    category: "guide",
    url: "https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students",
    isExternal: true,
    icon: <BookOpen className="w-5 h-5" />,
    tags: ["opt", "application", "steps"],
  },
  {
    id: "stem-guide",
    title: "STEM OPT Extension Guide",
    description: "Complete guide to 24-month STEM extension",
    category: "guide",
    url: "https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt",
    isExternal: true,
    icon: <BookOpen className="w-5 h-5" />,
    tags: ["stem", "extension", "24-month"],
  },
  {
    id: "cap-gap",
    title: "Cap-Gap Extension",
    description: "Information about H-1B cap-gap extensions",
    category: "guide",
    url: "https://www.uscis.gov/working-in-the-united-states/temporary-workers/h-1b-specialty-occupations-and-fashion-models/extension-of-post-completion-optional-practical-training-opt-and-f-1-status-for-eligible-students-under-the-h-1b-cap-gap-regulations",
    isExternal: true,
    icon: <Clock className="w-5 h-5" />,
    tags: ["h1b", "cap-gap", "extension"],
  },
  {
    id: "e-verify",
    title: "E-Verify Employer Search",
    description: "Search the official USCIS database and review STEM OPT guidance",
    category: "guide",
    url: "/e-verify-employer-search",
    isExternal: false,
    icon: <Building2 className="w-5 h-5" />,
    tags: ["employer", "stem", "verification"],
  },
  {
    id: "uscis-case",
    title: "USCIS Case Status",
    description: "Check the status of your USCIS application",
    category: "external",
    url: "https://egov.uscis.gov/casestatus/landing.do",
    isExternal: true,
    icon: <Search className="w-5 h-5" />,
    tags: ["case", "status", "tracking"],
  },
  {
    id: "unemployment-faq",
    title: "Unemployment Rules FAQ",
    description: "Understanding the 90/60 day unemployment limit",
    category: "faq",
    url: "/dashboard/help#unemployment",
    isExternal: false,
    icon: <HelpCircle className="w-5 h-5" />,
    tags: ["unemployment", "rules", "90-day"],
  },
  {
    id: "reporting-faq",
    title: "Reporting Requirements",
    description: "What you need to report and when",
    category: "faq",
    url: "/dashboard/help#reporting",
    isExternal: false,
    icon: <Scale className="w-5 h-5" />,
    tags: ["reporting", "employer", "sevis"],
  },
  {
    id: "sevp-portal",
    title: "SEVP Portal",
    description: "Update your employer and address information",
    category: "external",
    url: "https://studyinthestates.dhs.gov/sevp-portal-help",
    isExternal: true,
    icon: <Briefcase className="w-5 h-5" />,
    tags: ["sevp", "update", "employer"],
  },
];

const CATEGORIES = [
  { id: "all", label: "All Resources" },
  { id: "form", label: "Official Forms" },
  { id: "guide", label: "Guides" },
  { id: "faq", label: "FAQs" },
  { id: "external", label: "External Tools" },
];

export function ResourceCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredResources = RESOURCES.filter((resource) => {
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryStyles = (category: Resource["category"]) => {
    switch (category) {
      case "form":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "guide":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "faq":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "external":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Resource Center</h2>
            <p className="text-sm text-muted-foreground">Official forms, guides, and helpful links</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mt-3">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${selectedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
                }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resources List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredResources.length === 0 ? (
          <div className="p-8 text-center">
            <Search className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No resources found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredResources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target={resource.isExternal ? "_blank" : undefined}
                rel={resource.isExternal ? "noopener noreferrer" : undefined}
                className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors group"
              >
                <div className={`shrink-0 p-2.5 rounded-lg ${getCategoryStyles(resource.category)}`}>
                  {resource.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                      {resource.title}
                    </h3>
                    {resource.isExternal && (
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {resource.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {resource.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 text-[10px] bg-muted rounded text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-muted/30 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">
          Always verify information with your DSO and official USCIS sources
        </p>
      </div>
    </div>
  );
}
