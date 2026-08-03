import { Calendar, Clock, GraduationCap, Timer, type LucideIcon } from "lucide-react";

/** Lucide icons for OPT tools — matches sidebar / OPT Tools page. */
export const OPT_TOOL_ICONS = {
  opt_apply: Calendar,
  opt_clock: Clock,
  stem_apply: GraduationCap,
  stem_clock: Timer,
} as const satisfies Record<string, LucideIcon>;

export type OptToolIconKey = keyof typeof OPT_TOOL_ICONS;

export const OPT_TOOL_ICONS_BY_SLUG: Record<
  "opt-apply" | "opt-clock" | "stem-apply" | "stem-clock",
  LucideIcon
> = {
  "opt-apply": Calendar,
  "opt-clock": Clock,
  "stem-apply": GraduationCap,
  "stem-clock": Timer,
};
