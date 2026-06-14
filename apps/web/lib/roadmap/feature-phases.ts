/**
 * Product roadmap phases — competitive gaps and implementation status.
 */

export const ROADMAP_PHASES = [
  {
    id: 1,
    title: "Trust & messaging alignment",
    status: "shipped" as const,
    items: [
      "Multi-case limits in FAQ and plan features",
      "Browser push documented on marketing pages",
      "Schema docs for push_subscriptions RLS/grants",
    ],
  },
  {
    id: 2,
    title: "Real community benchmarks",
    status: "shipped" as const,
    items: [
      "Aggregate anonymized stats from case_status, employment_spans, documents",
      "Replace random community-stats API with cached real aggregates",
    ],
  },
  {
    id: 3,
    title: "Onboarding & multi-case UX",
    status: "shipped" as const,
    items: [
      "Case limit errors in onboarding receipt step",
      "Pro upsell hint for tracking up to 8 cases",
    ],
  },
  {
    id: 4,
    title: "Chrome extension parity",
    status: "shipped" as const,
    items: [
      "Primary case status card on extension home",
      "Deep link to dashboard case status",
    ],
  },
  {
    id: 5,
    title: "Competitive intelligence",
    status: "in_progress" as const,
    items: [
      "Nearby-case cohort analysis with status/case-type distributions (shipped)",
      "AI outcome prediction from similar nearby cases (shipped)",
      "Shared USCIS case cache with lazy background scanning (shipped)",
      "Visa bulletin API placeholder (scaffolded)",
      "Multi-agency tracking (NVC, EOIR) — planned",
      "Native mobile push — planned",
    ],
  },
] as const;

export type RoadmapPhase = (typeof ROADMAP_PHASES)[number];
export type RoadmapStatus = "shipped" | "in_progress" | "planned";
