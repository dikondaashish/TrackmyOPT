import { cardIsBeingProducedGuide } from './card-is-being-produced';
import { cardMailedTrackingGuide } from './card-mailed-tracking-unavailable';
import { uscisSilentUpdateGuide } from './uscis-silent-update';
import { optExpediteRequestGuide } from './opt-expedite-request';
import { caseActivelyReviewedGuide } from './case-actively-reviewed';
import { fingerprintsWereTakenGuide } from './fingerprints-were-taken';
import { stemOptPending180Guide } from './stem-opt-pending-180-days';
import { travelWhileOptPendingGuide } from './travel-while-opt-pending';
import { i140ApprovedGuide } from './i140-approved-what-next';
import { h1bProcessingTimeGuide } from './h1b-processing-time';
import type { ResearchArticle } from './types';

/**
 * "Waiting on USCIS" guides published November 20, 2026: status messages, the
 * silent update question, the OPT expedite request, STEM OPT past 180 days,
 * travel while pending, I-140 approval and H-1B processing times. Chosen from Search
 * Console queries and Google autocomplete with no matching post.
 */
export const statusMessageGuidesNovember2026: ResearchArticle[] = [
  cardIsBeingProducedGuide,
  cardMailedTrackingGuide,
  uscisSilentUpdateGuide,
  optExpediteRequestGuide,
  caseActivelyReviewedGuide,
  fingerprintsWereTakenGuide,
  stemOptPending180Guide,
  travelWhileOptPendingGuide,
  i140ApprovedGuide,
  h1bProcessingTimeGuide,
];
