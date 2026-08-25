import type { StatusExplainerCategory } from "@/lib/uscis/status-explainer";

type StatusNextStep = {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
};

export function getStatusNextSteps(
  category: StatusExplainerCategory,
  daysSinceFiled: number | null
): StatusNextStep[] {
  switch (category) {
    case "approved":
      return [
        {
          label: "Add EAD dates to your OPT timeline",
          href: "/dashboard/opt-dates",
          description:
            "Track unemployment days and STEM deadlines from your EAD start date.",
        },
        {
          label: "Store your approval notice",
          href: "/dashboard/documents",
          description: "Keep I-797 and EAD copies in one place.",
        },
      ];
    case "rfe":
      return [
        {
          label: "Organize RFE documents",
          href: "/dashboard/documents",
          description: "Upload and track evidence before the response deadline.",
        },
        {
          label: "View on USCIS.gov",
          href: "https://egov.uscis.gov/casestatus",
          external: true,
        },
      ];
    case "denied":
    case "withdrawn":
      return [
        {
          label: "Review help resources",
          href: "/dashboard/help",
          description: "Next steps to discuss with your DSO or attorney.",
        },
      ];
    case "pending":
    case "received":
    case "transferred":
    case "premium_processing":
    case "other":
    case "unknown": {
      const steps: StatusNextStep[] = [
        {
          label: "Review your OPT deadline checklist",
          href: "/dashboard/opt-dates",
          description: "While you wait, make sure filing windows and dates are set.",
        },
      ];
      if (daysSinceFiled !== null && daysSinceFiled >= 45) {
        steps.push({
          label: "Check official USCIS processing times",
          href: "https://egov.uscis.gov/processing-times/",
          description: `You've been waiting ${daysSinceFiled} days — compare to USCIS estimates.`,
          external: true,
        });
      }
      return steps;
    }
    default:
      return [];
  }
}
