import { cardIsBeingProducedGuide } from './card-is-being-produced';
import { cardMailedTrackingGuide } from './card-mailed-tracking-unavailable';
import { uscisSilentUpdateGuide } from './uscis-silent-update';
import { optExpediteRequestGuide } from './opt-expedite-request';
import { caseActivelyReviewedGuide } from './case-actively-reviewed';
import type { ResearchArticle } from './types';

/**
 * "Waiting on USCIS" guides published November 20, 2026: status messages, the
 * silent update question and the OPT expedite request. Chosen from Search
 * Console queries and Google autocomplete with no matching post.
 */
export const statusMessageGuidesNovember2026: ResearchArticle[] = [
  cardIsBeingProducedGuide,
  cardMailedTrackingGuide,
  uscisSilentUpdateGuide,
  optExpediteRequestGuide,
  caseActivelyReviewedGuide,
];
