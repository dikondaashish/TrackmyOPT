import { i485StatusGuide } from './i485-green-card-status-tracking';
import { optToGreenCardWithoutH1b } from './opt-to-green-card-without-h1b';
import { jobRelatedToDegreeAnswers } from './job-related-to-degree-answers';
import { optStartDateGuide } from './opt-start-date-guide';
import { optTravelSignature } from './opt-travel-signature';
import { premiumProcessingBusinessDays } from './premium-processing-business-days';
import { optDeniedAfterGrace } from './opt-denied-after-grace';
import { optTaxGuide } from './opt-tax-calculator';
import { optProcessingTimeEs } from './opt-processing-time-es';
import { visaBulletinKoreanNov2026 } from './visa-bulletin-korean-nov-2026';
import type { ResearchArticle } from './types';

/**
 * Backlog articles from section 2C and 2D of
 * docs/marketing/blog-strategy/2026-11-08-search-gaps-and-blog-architecture.md,
 * published November 9, 2026.
 */
export const backlogGuidesNovember2026: ResearchArticle[] = [
  i485StatusGuide,
  optToGreenCardWithoutH1b,
  jobRelatedToDegreeAnswers,
  optStartDateGuide,
  optTravelSignature,
  premiumProcessingBusinessDays,
  optDeniedAfterGrace,
  optTaxGuide,
  optProcessingTimeEs,
  visaBulletinKoreanNov2026,
];
