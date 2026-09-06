/**
 * Private answers review panel for the job-portal tracker widget.
 * Answers stay local until the user explicitly approves them for this application.
 */

import { API_ENDPOINTS } from './config';
import {
  normalizeSavedPrivateApplicationAnswers,
  type SensitiveAnswerSession,
} from './sensitive-autofill';
import type { JobPortalLoginCredential } from './job-portal-login';
import {
  approvalMatchesJob,
  createPrivateApprovalBinding,
  type PrivateApprovalBinding,
} from './private-approval-session';
import { JobInfo, getJobInfo } from './job-posting-scrape';
import { jobContextFor } from './job-portal-job-helpers';
import { selectField, textField } from './job-portal-widget-ui';

export type SensitiveAnswerPanelHost = {
  clearPrivateApplicationApproval: () => void;
  commitSensitiveApproval: (args: {
    login: JobPortalLoginCredential | null;
    session: SensitiveAnswerSession;
    binding: PrivateApprovalBinding;
  }) => void;
};

export function createSensitiveAnswerPanel(
  job: JobInfo,
  host: SensitiveAnswerPanelHost,
): HTMLElement {
  const panelApprovalBinding = createPrivateApprovalBinding(jobContextFor(job));
  const section = document.createElement('section');
  section.className = 'tmo-sensitive-answer-panel';
  section.style.cssText =
    'border-top:1px solid var(--tmo-widget-border);padding:9px 11px;background:var(--tmo-widget-surface-2);';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = 'Private answers (review required)';
  toggle.style.cssText =
    'width:100%;padding:0;border:0;background:transparent;color:var(--tmo-widget-ink);font:inherit;font-size:11px;font-weight:800;text-align:left;cursor:pointer;';
  const body = document.createElement('div');
  body.hidden = true;
  body.style.cssText = 'display:none;gap:7px;margin-top:8px;';
  const note = document.createElement('p');
  note.textContent =
    'Saved answers and your shared default job-portal login load here for review. Passwords stay masked. TrackMyOPT never sends them to AI or analytics and never submits the application.';
  note.style.cssText =
    'margin:0;color:var(--tmo-widget-muted);font-size:10.5px;line-height:1.4;';
  const manageSavedData = document.createElement('button');
  manageSavedData.type = 'button';
  manageSavedData.textContent = 'Manage saved prefill data';
  manageSavedData.style.cssText =
    'min-height:34px;padding:6px 8px;border:1px solid var(--tmo-widget-border);border-radius:7px;background:var(--tmo-widget-surface);color:var(--tmo-widget-accent);font:inherit;font-size:11px;font-weight:800;text-align:left;cursor:pointer;';
  manageSavedData.addEventListener('click', () => {
    window.open(
      API_ENDPOINTS.DASHBOARD_JOB_PREFILL,
      '_blank',
      'noopener,noreferrer'
    );
  });
  const portalLoginSummary = document.createElement('p');
  portalLoginSummary.style.cssText =
    'margin:0;padding:7px 8px;border:1px solid var(--tmo-widget-border);border-radius:7px;background:var(--tmo-widget-surface);color:var(--tmo-widget-muted);font-size:10.5px;line-height:1.4;';
  portalLoginSummary.textContent =
    'No approved default job-portal login is loaded.';
  let loadedJobPortalLogin: JobPortalLoginCredential | null = null;

  const yesNoOptions: Array<[string, string]> = [
    ['', 'Leave unanswered'],
    ['yes', 'Yes'],
    ['no', 'No'],
  ];
  const workAuth = selectField('Authorized to work?', yesNoOptions);
  const sponsorship = selectField('Need sponsorship now or later?', yesNoOptions);
  const visaType = selectField('Visa / work status', [
    ['', 'Leave unanswered'],
    ['us_citizen', 'U.S. citizen'],
    ['permanent_resident', 'Permanent resident'],
    ['h1b', 'H-1B'],
    ['f1_student', 'F-1 student'],
    ['opt', 'OPT'],
    ['cpt', 'CPT'],
    ['j1', 'J-1'],
    ['l1', 'L-1'],
    ['o1', 'O-1'],
    ['tn', 'TN'],
    ['e3', 'E-3'],
    ['other', 'Other'],
  ]);
  const visaOther = textField(
    'Other visa / work status',
    'text',
    'Exact status if Other'
  );
  const citizenship = textField('Citizenship', 'text', 'Exact answer to use');
  const annualSalary = textField(
    'Expected annual salary',
    'text',
    'Example: $120,000'
  );
  const hourlyRate = textField(
    'Expected hourly rate',
    'text',
    'Example: $58'
  );
  const inPerson = selectField('Can work in-person?', yesNoOptions);
  const relocate = selectField('Willing to relocate?', yesNoOptions);
  const startImmediately = selectField('Can start immediately?', yesNoOptions);
  const transportation = selectField(
    'Has reliable transportation?',
    yesNoOptions
  );
  const accommodations = selectField('Needs accommodations?', yesNoOptions);
  const dob = textField('Date of birth', 'date');
  const sexGender = selectField('Sex / gender', [
    ['', 'Leave unanswered'],
    ['female', 'Female'],
    ['male', 'Male'],
    ['non_binary', 'Non-binary'],
    ['prefer_not_to_answer', 'Prefer not to answer'],
  ]);
  const raceEthnicity = selectField('Race / ethnicity', [
    ['', 'Leave unanswered'],
    ['american_indian_or_alaska_native', 'American Indian or Alaska Native'],
    ['asian', 'Asian'],
    ['black_or_african_american', 'Black or African American'],
    ['hispanic_or_latino', 'Hispanic or Latino'],
    ['native_hawaiian_or_pacific_islander', 'Native Hawaiian or Pacific Islander'],
    ['white', 'White'],
    ['two_or_more_races', 'Two or more races'],
    ['prefer_not_to_answer', 'Prefer not to answer'],
  ]);
  const hispanicLatino = selectField('Hispanic or Latino?', [
    ['', 'Leave unanswered'],
    ['yes', 'Yes'],
    ['no', 'No'],
    ['prefer_not_to_answer', 'Prefer not to answer'],
  ]);
  const veteranStatus = selectField('Veteran status', [
    ['', 'Leave unanswered'],
    ['not_protected_veteran', 'Not a protected veteran'],
    ['protected_veteran', 'Protected veteran'],
    ['prefer_not_to_answer', 'Prefer not to answer'],
  ]);
  const disabilityStatus = selectField('Disability status', [
    ['', 'Leave unanswered'],
    ['yes', 'Yes'],
    ['no', 'No'],
    ['prefer_not_to_answer', 'Prefer not to answer'],
  ]);
  const eeo = selectField('EEO questions', [
    ['', 'Leave unanswered'],
    ['prefer_not_to_answer', 'Prefer not to answer'],
  ]);
  const save = document.createElement('button');
  save.type = 'button';
  save.textContent = 'Review and use for this application';
  save.style.cssText =
    // on-accent, not white: the dark-theme accent is a light teal, against
    // which white text is unreadable.
    'min-height:34px;padding:6px 8px;border:0;border-radius:7px;background:var(--tmo-widget-accent);color:var(--tmo-color-on-accent);font:inherit;font-size:11px;font-weight:800;cursor:pointer;';
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.style.cssText =
    'margin:0;color:var(--tmo-widget-success-ink);font-size:10.5px;font-weight:700;';

  let savedAnswersRequested = false;
  const loadSavedAnswersForReview = () => {
    if (savedAnswersRequested) return;
    savedAnswersRequested = true;
    chrome.runtime.sendMessage(
      { type: 'GET_PRIVATE_APPLICATION_ANSWERS' },
      (response?: { ok?: boolean; data?: unknown }) => {
        if (chrome.runtime.lastError || !response?.ok) {
          savedAnswersRequested = false;
          return;
        }
        if (!response.data) return;
        const saved = normalizeSavedPrivateApplicationAnswers(response.data);
        if (!saved) return;
        loadedJobPortalLogin = saved.defaultJobPortalLogin ?? null;
        portalLoginSummary.textContent = loadedJobPortalLogin
          ? `Default job-portal login ready for this application: ${loadedJobPortalLogin.email}. Password: ••••••••`
          : 'No default job-portal login is saved. Add one in TrackMyOPT.';
        workAuth.control.value = saved.workAuthorization ?? '';
        sponsorship.control.value = saved.requiresSponsorship ?? '';
        visaType.control.value = saved.visaType ?? (
          saved.visaStatus ? 'other' : ''
        );
        visaOther.control.value =
          saved.visaOther ?? saved.visaStatus ?? '';
        citizenship.control.value = saved.citizenship ?? '';
        annualSalary.control.value =
          saved.expectedAnnualSalary ?? saved.salaryExpectation ?? '';
        hourlyRate.control.value = saved.expectedHourlyRate ?? '';
        inPerson.control.value = saved.canWorkInPerson ?? '';
        relocate.control.value = saved.willingToRelocate ?? '';
        startImmediately.control.value = saved.canStartImmediately ?? '';
        transportation.control.value = saved.reliableTransportation ?? '';
        accommodations.control.value = saved.needsAccommodations ?? '';
        dob.control.value = saved.dateOfBirth ?? '';
        sexGender.control.value = saved.sexGender ?? '';
        hispanicLatino.control.value = saved.hispanicLatino ?? '';
        raceEthnicity.control.value = saved.raceEthnicity ?? '';
        veteranStatus.control.value = saved.veteranStatus ?? '';
        disabilityStatus.control.value = saved.disabilityStatus ?? '';
        eeo.control.value = saved.eeoPreference ?? '';
        status.textContent =
          'Saved answers loaded. Review them, then approve for this application.';
      }
    );
  };

  toggle.addEventListener('click', () => {
    body.hidden = !body.hidden;
    body.style.display = body.hidden ? 'none' : 'grid';
    if (!body.hidden) loadSavedAnswersForReview();
  });
  save.addEventListener('click', () => {
    const currentJob = getJobInfo();
    if (
      !currentJob ||
      !approvalMatchesJob(panelApprovalBinding, jobContextFor(currentJob))
    ) {
      loadedJobPortalLogin = null;
      host.clearPrivateApplicationApproval();
      status.textContent =
        'This application changed. Review the private answers again for the current job.';
      return;
    }
    const nextSession: SensitiveAnswerSession = {
      confirmed: true,
      ...(workAuth.control.value
        ? { workAuthorization: workAuth.control.value as 'yes' | 'no' }
        : {}),
      ...(sponsorship.control.value
        ? { requiresSponsorship: sponsorship.control.value as 'yes' | 'no' }
        : {}),
      ...(visaType.control.value
        ? {
            visaType: visaType.control
              .value as SensitiveAnswerSession['visaType'],
          }
        : {}),
      ...(visaOther.control.value.trim()
        ? { visaOther: visaOther.control.value.trim() }
        : {}),
      ...(citizenship.control.value.trim()
        ? { citizenship: citizenship.control.value.trim() }
        : {}),
      ...(annualSalary.control.value.trim()
        ? { expectedAnnualSalary: annualSalary.control.value.trim() }
        : {}),
      ...(hourlyRate.control.value.trim()
        ? { expectedHourlyRate: hourlyRate.control.value.trim() }
        : {}),
      ...(inPerson.control.value
        ? {
            canWorkInPerson: inPerson.control.value as 'yes' | 'no',
          }
        : {}),
      ...(relocate.control.value
        ? {
            willingToRelocate: relocate.control.value as 'yes' | 'no',
          }
        : {}),
      ...(startImmediately.control.value
        ? {
            canStartImmediately: startImmediately.control.value as 'yes' | 'no',
          }
        : {}),
      ...(transportation.control.value
        ? {
            reliableTransportation: transportation.control.value as
              | 'yes'
              | 'no',
          }
        : {}),
      ...(accommodations.control.value
        ? {
            needsAccommodations: accommodations.control.value as 'yes' | 'no',
          }
        : {}),
      ...(dob.control.value ? { dateOfBirth: dob.control.value } : {}),
      ...(sexGender.control.value
        ? {
            sexGender: sexGender.control
              .value as SensitiveAnswerSession['sexGender'],
          }
        : {}),
      ...(hispanicLatino.control.value
        ? {
            hispanicLatino: hispanicLatino.control
              .value as SensitiveAnswerSession['hispanicLatino'],
          }
        : {}),
      ...(raceEthnicity.control.value
        ? {
            raceEthnicity: raceEthnicity.control
              .value as SensitiveAnswerSession['raceEthnicity'],
          }
        : {}),
      ...(veteranStatus.control.value
        ? {
            veteranStatus: veteranStatus.control
              .value as SensitiveAnswerSession['veteranStatus'],
          }
        : {}),
      ...(disabilityStatus.control.value
        ? {
            disabilityStatus: disabilityStatus.control
              .value as SensitiveAnswerSession['disabilityStatus'],
          }
        : {}),
      ...(eeo.control.value === 'prefer_not_to_answer'
        ? { eeoPreference: 'prefer_not_to_answer' as const }
        : {}),
    };
    host.commitSensitiveApproval({
      login: loadedJobPortalLogin,
      session: nextSession,
      binding: panelApprovalBinding,
    });
    status.textContent =
      loadedJobPortalLogin
        ? 'Approved for this application. Prefill can use the masked portal login and these exact answers.'
        : 'Approved for this application. Prefill can use these exact answers.';
  });

  body.append(
    note,
    manageSavedData,
    portalLoginSummary,
    workAuth.wrapper,
    sponsorship.wrapper,
    visaType.wrapper,
    visaOther.wrapper,
    citizenship.wrapper,
    annualSalary.wrapper,
    hourlyRate.wrapper,
    inPerson.wrapper,
    relocate.wrapper,
    startImmediately.wrapper,
    transportation.wrapper,
    accommodations.wrapper,
    dob.wrapper,
    sexGender.wrapper,
    hispanicLatino.wrapper,
    raceEthnicity.wrapper,
    veteranStatus.wrapper,
    disabilityStatus.wrapper,
    eeo.wrapper,
    save,
    status
  );
  section.append(toggle, body);

  return section;
}

