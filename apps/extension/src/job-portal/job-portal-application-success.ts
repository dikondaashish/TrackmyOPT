/** Conservative, page-visible evidence that an applicant completed submission.
 * Never infer success from job-description text or a URL alone. */
type Ats = 'workday' | 'greenhouse' | 'lever' | 'ashby' | 'smartrecruiters' | 'linkedin' | 'generic';

const SUCCESS_ROOTS: Record<Ats, string> = {
  workday: '[data-automation-id="applicationSubmitted"],[data-automation-id="applicationConfirmationPage"]',
  greenhouse: '#application_confirmation,#application-confirmation,.application-confirmation',
  lever: '.thanks,[data-qa="application-confirmation"]',
  ashby: '[data-testid="application-success"],.ashby-application-form-success',
  smartrecruiters: '[data-test="application-success"],[data-testid="application-success"]',
  linkedin: '.artdeco-modal,[role="dialog"]',
  generic: 'main,[role="main"],article',
};
const CONFIRMATION = [
  /^application (?:submitted|received|sent|successful|complete)$/i,
  /^your application (?:has been|was) (?:submitted|received|sent)$/i,
  /^thank you for applying(?:[!.])?$/i,
  /^we(?:'ve| have) received your application(?:[!.])?$/i,
  /^you(?:'ve| have) applied to .+$/i,
];

function ats(host: string): Ats {
  if (/(^|\.)(?:myworkdayjobs\.com|myworkdaysite\.com|myworkday\.com)$/.test(host)) return 'workday';
  if (/(^|\.)(?:greenhouse\.io|greenhouse\.com)$/.test(host)) return 'greenhouse';
  if (/(^|\.)lever\.co$/.test(host)) return 'lever';
  if (/(^|\.)ashbyhq\.com$/.test(host)) return 'ashby';
  if (/(^|\.)smartrecruiters\.com$/.test(host)) return 'smartrecruiters';
  if (/(^|\.)linkedin\.com$/.test(host)) return 'linkedin';
  return 'generic';
}

function visible(element: HTMLElement): boolean {
  if (element.hidden || element.closest('[hidden],[inert],[aria-hidden="true"]')) return false;
  const style = element.ownerDocument.defaultView?.getComputedStyle(element);
  return style?.display !== 'none' && style?.visibility !== 'hidden';
}

export function isApplicationSuccessPage(doc: Document = document): boolean {
  const portal = ats(doc.location.hostname.toLowerCase());
  const roots = Array.from(doc.querySelectorAll<HTMLElement>(SUCCESS_ROOTS[portal])).filter(visible);
  if (roots.length === 0) return false;
  // A live submission form means the applicant is still on the application.
  const activeSubmit = Array.from(doc.querySelectorAll<HTMLElement>(
    'form button,form input[type="submit"],button[data-automation-id="submit"],button[aria-label="Submit Application"]'
  )).some(button => visible(button) && (
    button.matches('input[type="submit"],button[type="submit"],[data-automation-id="submit"],[aria-label="Submit Application"]') ||
    /^submit (?:your )?application$/i.test((button.textContent || '').trim())
  ));
  if (activeSubmit) return false;
  for (const root of roots) {
    for (const heading of Array.from(root.querySelectorAll<HTMLElement>('h1,h2,h3,[role="heading"],[role="status"]'))) {
      if (!visible(heading)) continue;
      const text = (heading.textContent || '').replace(/\s+/g, ' ').trim();
      if (text.length <= 120 && CONFIRMATION.some(pattern => pattern.test(text))) return true;
    }
  }
  return false;
}
