/**
 * Default landing after login / OAuth / magic link.
 * Phase 4: send users to case status (add receipt), not the empty hub.
 */
export const DEFAULT_POST_AUTH_PATH = "/dashboard/case-status" as const;
