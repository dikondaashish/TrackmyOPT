import {
  buildTransactionalEmail,
  emailBodySectionOpen,
  emailBodySectionClose,
  emailPrimaryButton,
  emailTextP,
} from './email-layout';
import { escapeHtml } from './transactional/formatting';

/** Preserve the complete plain-text summary in the HTML alternative. */
export function buildCaseSummaryEmailHtml(title: string, text: string): string {
  return buildTransactionalEmail({
    headerTitle: title,
    bodyHtml: `${emailBodySectionOpen()}
${emailTextP(`<span style="white-space:pre-wrap;">${escapeHtml(text)}</span>`)}
${emailPrimaryButton('https://www.trackmyopt.com/dashboard/case-status', 'Review your case')}
${emailBodySectionClose()}`,
  });
}

export function buildCaseDeadlineEmailBodies(title: string, dueDate: string) {
  const text = `Your saved task: ${title}\nConfirmed deadline: ${dueDate}\n\nReview the exact requirements and time on your official notice or with your DSO. This reminder does not extend a deadline.\n\nhttps://www.trackmyopt.com/dashboard/case-status\nManage this reminder by marking the task complete on your case page.`;
  return {
    subject: 'TrackMyOPT: review your saved case deadline',
    text,
    html: buildCaseSummaryEmailHtml('Your saved case deadline', text),
  };
}
