import { findApplicationForm, getLabelText } from '../../easy-apply/easy-apply-engine';
import { API_ENDPOINTS } from '../../shared/config';
import { detectScreeningQuestion } from '../../screening/screening-question-drafts';
import { createScreeningQuestionReviewUI } from '../../screening/screening-question-review-ui';
import { AUTOFILL_FEATURE_FLAGS } from '../../prefill/autofill-feature-flags';
import { type AutofillPlanEntitlements } from '../../prefill/autofill-plan-entitlements';
import { JobInfo } from '../../job/job-posting-scrape';
import { scrapeJobDescription } from '../../job/job-description-scrape';
import { getLastResumeJobDescription } from '../job-portal-tracker-widget';
import { trackWidgetAnalytics } from './widget-analytics';

export type ScreeningReviewDeps = {
  hasCurrentArtifact: () => boolean;
  getPlanEntitlements: () => Readonly<AutofillPlanEntitlements>;
};

export async function mountScreeningQuestionReviewsWith(
  deps: ScreeningReviewDeps,
  card: HTMLElement,
  job: JobInfo,
  hasResolvedArtifact = false,
  resolvedJobDescription = '',
): Promise<void> {
  if (!AUTOFILL_FEATURE_FLAGS.aiScreeningDrafts) return;
  // A valid artifact can be owned by the background/session store without
  // existing in this content script's short-lived module cache. The resolved
  // prefill result is the authority for that common handoff path.
  if (!deps.hasCurrentArtifact() && !hasResolvedArtifact) return;
  card.querySelector('.tmo-screening-review-list')?.remove();
  const host = document.createElement('div');
  host.className = 'tmo-screening-review-list';
  const form = findApplicationForm();
  if (!form) return;
  for (const element of Array.from(form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('textarea,input[type="text"]'))) {
    const eligible = await detectScreeningQuestion({
      label: getLabelText(element),
      value: element.value,
      hidden: element.hidden || element.getClientRects().length === 0,
      disabled: element.disabled,
      element,
      characterLimit: element.maxLength > 0 ? element.maxLength : undefined,
    });
    if (!eligible) continue;
    const savedResponse = await chrome.runtime.sendMessage({
      type: 'LOAD_SCREENING_ANSWER', questionHash: eligible.questionHash,
    }).catch(() => null) as { answer?: import('../../screening/screening-question-drafts').SavedScreeningAnswer } | null;
    host.appendChild(createScreeningQuestionReviewUI({
      question: eligible,
      limits: {
        quotaPeriod: deps.getPlanEntitlements().planTier === 'free'
          ? 'month'
          : 'day',
        quotaLimit:
          deps.getPlanEntitlements().screeningDraftsMonthlyLimit ?? 25,
        quotaRemaining:
          deps.getPlanEntitlements().screeningDraftsMonthlyLimit ?? 25,
        dailyRemaining: 25,
        itemRegenerationsRemaining: 3,
        itemRegenerationLimit: 3,
      },
      savedAnswer: savedResponse?.answer,
      generateDraft: async (regenerate) => {
        const response = await chrome.runtime.sendMessage({
          type: 'GENERATE_SCREENING_DRAFT',
          questionText: eligible.normalizedQuestionText,
          characterLimit: eligible.characterLimit,
          jobDescription:
            resolvedJobDescription ||
            getLastResumeJobDescription() ||
            scrapeJobDescription(),
          companyName: job.company_name || '',
          roleTitle: job.role_title || '',
          regenerate,
        }) as {
          draft?: string;
          quotaPeriod?: 'day' | 'month';
          quotaLimit?: number;
          quotaRemaining?: number;
          dailyRemaining?: number;
          itemRegenerationsRemaining?: number;
          itemRegenerationLimit?: number;
          error?: string;
        };
        if (!response?.draft) throw new Error(response?.error || 'Draft generation failed');
        return {
          draft: response.draft,
          limits: {
            quotaPeriod: response.quotaPeriod,
            quotaLimit: response.quotaLimit,
            quotaRemaining: response.quotaRemaining,
            dailyRemaining: response.dailyRemaining ?? 0,
            itemRegenerationsRemaining: response.itemRegenerationsRemaining ?? 0,
            itemRegenerationLimit: response.itemRegenerationLimit ?? 3,
          },
        };
      },
      onReviewed: async (answer) => {
        const saved = await chrome.runtime.sendMessage({
          type: 'SAVE_SCREENING_ANSWER',
          answer: {
            questionHash: eligible.questionHash,
            normalizedQuestionText: eligible.normalizedQuestionText,
            editedAnswer: answer,
            source: 'user_edited_ai_draft',
          },
        }).catch(() => null) as { ok?: boolean } | null;
        return saved?.ok === true;
      },
      onReviewStateChange: (reviewState) => {
        trackWidgetAnalytics('extension_widget_screening_review_state', {
          review_state: reviewState,
        });
      },
      onDeleteSavedAnswer: async (questionHash) => {
        await chrome.runtime.sendMessage({ type: 'DELETE_SCREENING_ANSWER', questionHash });
      },
      onUpgrade: () => {
        window.open(API_ENDPOINTS.PRICING, '_blank', 'noopener,noreferrer');
      },
    }));
  }
  if (host.childElementCount > 0) {
    (card.querySelector('.tmo-job-widget-scroll-body') || card).appendChild(host);
  }
}
