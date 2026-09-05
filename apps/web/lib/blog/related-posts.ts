import type { RelatedPostLink } from "@/components/blog/RelatedPosts";

const CATALOG: Record<string, RelatedPostLink> = {
  "stem-opt-extension-guide": {
    href: "/blog/stem-opt-extension-guide",
    title: "STEM OPT Extension Guide",
    description: "24-month STEM OPT eligibility, I-983, and filing timeline.",
  },
  "i-983-training-plan-guide": {
    href: "/blog/i-983-training-plan-guide",
    title: "I-983 Training Plan Guide",
    description: "How to complete Form I-983 for STEM OPT.",
  },
  "90-day-unemployment-rule-opt": {
    href: "/blog/90-day-unemployment-rule-opt",
    title: "90-Day Unemployment Rule",
    description: "What counts as unemployment on OPT and STEM OPT.",
  },
  "uscis-case-status-tracking-guide": {
    href: "/blog/uscis-case-status-tracking-guide",
    title: "USCIS Case Status Tracking",
    description: "How to track your I-765 and understand status updates.",
  },
  "opt-to-h1b-transition": {
    href: "/blog/opt-to-h1b-transition",
    title: "OPT to H-1B Transition",
    description: "Cap-gap, lottery timing, and what to do if not selected.",
  },
  "opt-processing-time-2026": {
    href: "/blog/opt-processing-time-2026",
    title: "OPT Processing Time 2026",
    description: "Current I-765 wait times and planning tips.",
  },
  "can-you-travel-on-opt-complete-guide": {
    href: "/blog/can-you-travel-on-opt-complete-guide",
    title: "Traveling on OPT",
    description: "Documents and risks for international travel on OPT.",
  },
  "laid-off-on-opt": {
    href: "/blog/laid-off-on-opt",
    title: "Laid Off on OPT",
    description: "Unemployment clock, grace period, and next steps.",
  },
  "laid-off-on-stem-opt": {
    href: "/blog/laid-off-on-stem-opt",
    title: "Laid Off on STEM OPT",
    description: "STEM-specific layoff rules and reporting deadlines.",
  },
  "h1b-cap-gap-extension": {
    href: "/blog/h1b-cap-gap-extension",
    title: "H-1B Cap-Gap Extension",
    description: "How cap-gap keeps F-1 status after OPT ends.",
  },
  "opt-application-checklist-2026": {
    href: "/blog/opt-application-checklist-2026",
    title: "OPT Application Checklist",
    description: "Documents and steps before you file Form I-765.",
  },
  "e-verify-employer-search": {
    href: "/e-verify-employer-search",
    title: "E-Verify Employer Search",
    description: "Confirm STEM OPT employer enrollment in E-Verify.",
  },
};

type ClusterKey = "stem" | "unemployment" | "travel" | "h1b" | "filing" | "default";

const CLUSTERS: Record<ClusterKey, string[]> = {
  stem: [
    "stem-opt-extension-guide",
    "i-983-training-plan-guide",
    "laid-off-on-stem-opt",
    "e-verify-employer-search",
  ],
  unemployment: [
    "90-day-unemployment-rule-opt",
    "laid-off-on-opt",
    "laid-off-on-stem-opt",
    "opt-to-h1b-transition",
  ],
  travel: [
    "can-you-travel-on-opt-complete-guide",
    "uscis-case-status-tracking-guide",
    "opt-processing-time-2026",
  ],
  h1b: [
    "opt-to-h1b-transition",
    "h1b-cap-gap-extension",
    "uscis-case-status-tracking-guide",
  ],
  filing: [
    "opt-application-checklist-2026",
    "opt-processing-time-2026",
    "uscis-case-status-tracking-guide",
    "stem-opt-extension-guide",
  ],
  default: [
    "stem-opt-extension-guide",
    "90-day-unemployment-rule-opt",
    "uscis-case-status-tracking-guide",
    "opt-to-h1b-transition",
  ],
};

function clusterForSlug(slug: string): ClusterKey {
  const s = slug.toLowerCase();
  if (s.includes("stem") || s.includes("i-983") || s.includes("i983") || s.includes("e-verify")) {
    return "stem";
  }
  if (s.includes("unemployment") || s.includes("laid-off") || s.includes("layoff")) {
    return "unemployment";
  }
  if (s.includes("travel")) return "travel";
  if (s.includes("h1b") || s.includes("cap-gap")) return "h1b";
  if (s.includes("application") || s.includes("processing") || s.includes("i-765") || s.includes("checklist")) {
    return "filing";
  }
  return "default";
}

/** Pick up to 4 related links for a blog slug, excluding itself. */
export function getRelatedPostsForSlug(slug: string, limit = 4): RelatedPostLink[] {
  const keys = CLUSTERS[clusterForSlug(slug)].filter((k) => k !== slug);
  return keys
    .map((k) => CATALOG[k])
    .filter((p): p is RelatedPostLink => Boolean(p))
    .slice(0, limit);
}
