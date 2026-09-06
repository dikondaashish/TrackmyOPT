/**
 * True while the user is mid-interaction: a resume is generating (or its result
 * is on screen), the AI-analysis or resume-template modal is open, or the
 * save-status dialog is up. SPA route churn on job boards like Workday must
 * never tear the widget down during these — that would destroy work in progress
 * (e.g. a running resume generation) or a result the user is still reading.
 */

import { RESUME_PANEL_CLASS, WIDGET_ROOT_ID } from './widget-dom-ids';

export function isWidgetInteractionInFlight(): boolean {
  if (document.getElementById('tmo-resume-chooser')) return true;
  if (document.getElementById('tmo-ai-analysis')) return true;
  if (document.getElementById('tmo-application-status-dialog')) return true;
  const widget = document.getElementById(WIDGET_ROOT_ID);
  return !!widget?.querySelector('.' + RESUME_PANEL_CLASS);
}
