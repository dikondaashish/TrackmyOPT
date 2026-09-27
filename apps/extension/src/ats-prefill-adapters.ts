import { UPLOAD_CAPABILITIES, type UploadCapability } from './upload-verification';
import {
  ORG_TRAP_RE,
  SENSITIVE_FIELD_RE,
  normalizeFieldSignal,
} from './easy-apply-matchers';
import { isInActiveControlTree } from './scoped-control-dom';

export type FormSectionKind =
  | 'contact'
  | 'experience'
  | 'education'
  | 'skills'
  | 'unknown';

export interface ClassifiedControl {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  section: FormSectionKind;
  recordIndex?: number;
  field:
    | 'company'
    | 'title'
    | 'location'
    | 'startMonth'
    | 'startYear'
    | 'endMonth'
    | 'endYear'
    | 'startDate'
    | 'endDate'
    | 'isCurrent'
    | 'description'
    | 'school'
    | 'degree'
    | 'fieldOfStudy'
    | 'skills';
}

/** Named adapters are scoped capabilities, not claims of universal portal support. */
export interface AtsPrefillAdapter {
  id: 'generic' | 'workday' | 'greenhouse' | 'lever' | 'smartrecruiters' | 'ashby' | 'linkedin';
  upload?: UploadCapability;
  capabilities: AtsFieldCapabilities;
  matches(document: Document): boolean;
  findApplicationRoot(document: Document): HTMLElement | null;
  classifyRepeatableSections(root: HTMLElement): ClassifiedControl[];
}

/** Packaged, conservative operations. A declaration is not a claim that every
 * employer customization has been validated on a live site. */
export interface AtsFieldCapabilities {
  contact: boolean;
  skills: boolean;
  experience: boolean;
  education: boolean;
  searchableDropdown: boolean;
  /** A unique, visible Add button inside the matching section is required. */
  addRecord?: Partial<Record<'experience' | 'education', string>>;
}

type AdapterHints = {
  applicationRoots: string;
  repeatableRecords: string;
};

const GENERIC_HINTS: AdapterHints = {
  applicationRoots:
    'form#application-form, form#application_form, form.application--form, form, [role="main"], main',
  repeatableRecords:
    '[data-record-index], [data-testid*="experience" i], [data-testid*="education" i], fieldset, [role="group"]',
};

const WORKDAY_HINTS: AdapterHints = {
  applicationRoots:
    '[data-automation-id="jobApplicationPage"], [data-automation-id="applicationPage"], [data-automation-id="applyFlowPage"], form',
  repeatableRecords:
    '[data-automation-id="workExperienceCard"], [data-automation-id="educationCard"], [data-record-index], fieldset',
};

const GREENHOUSE_HINTS: AdapterHints = {
  applicationRoots:
    'form#application-form, form#application_form, form.application--form',
  repeatableRecords: '[data-record-index], fieldset, [role="group"]',
};

const SMARTRECRUITERS_HINTS: AdapterHints = {
  applicationRoots: 'oc-oneclick-form',
  repeatableRecords: '[data-test="experience-entry"], [data-test="education-entry"], [data-test="experience-edit-form"], [data-test="education-edit-form"]',
};

const CAPABILITIES: Record<AtsPrefillAdapter['id'], AtsFieldCapabilities> = {
  generic: { contact: true, skills: true, experience: true, education: true, searchableDropdown: true },
  workday: {
    contact: true, skills: true, experience: true, education: true, searchableDropdown: true,
    addRecord: {
      experience: 'button,[role="button"]',
      education: 'button,[role="button"]',
    },
  },
  greenhouse: { contact: true, skills: true, experience: true, education: true, searchableDropdown: true,
    addRecord: { experience: 'button', education: 'button' } },
  lever: { contact: true, skills: true, experience: true, education: true, searchableDropdown: true,
    addRecord: { experience: 'button', education: 'button' } },
  ashby: { contact: true, skills: true, experience: true, education: true, searchableDropdown: true,
    addRecord: { experience: 'button', education: 'button' } },
  smartrecruiters: { contact: true, skills: true, experience: true, education: true, searchableDropdown: true,
    addRecord: { experience: '[data-test="add-experience"] spl-button[aria-label="Add experience entry"]',
      education: '[data-test="add-education"] spl-button[aria-label="Add education entry"]' } },
  linkedin: { contact: true, skills: true, experience: false, education: false, searchableDropdown: true },
};

function hostname(document: Document): string {
  try {
    return document.location.hostname.toLowerCase().replace(/\.$/, '');
  } catch {
    return '';
  }
}

function isHostOrSubdomain(host: string, suffix: string): boolean {
  return host === suffix || host.endsWith(`.${suffix}`);
}

function safeQuery<T extends Element>(
  root: ParentNode,
  selector: string
): T | null {
  try {
    return root.querySelector<T>(selector);
  } catch {
    return null;
  }
}

function safeQueryAll<T extends Element>(
  root: ParentNode,
  selector: string
): T[] {
  try {
    const result = Array.from(root.querySelectorAll<T>(selector));
    for (const host of Array.from(root.querySelectorAll<HTMLElement>('*'))) {
      if (host.shadowRoot) result.push(...safeQueryAll<T>(host.shadowRoot, selector));
    }
    return result;
  } catch {
    return [];
  }
}

function closestAcrossShadow(control: Element, selector: string): Element | null {
  let current: Element | null = control;
  for (let depth = 0; current && depth < 5; depth += 1) {
    const match: Element | null = current.closest(selector);
    if (match) return match;
    current = (current.getRootNode() as ShadowRoot).host ?? null;
  }
  return null;
}

function controlSignal(control: HTMLElement): string {
  const hosts: HTMLElement[] = [];
  let boundary: Element = control;
  for (let depth = 0; depth < 4; depth += 1) {
    const host = (boundary.getRootNode?.() as ShadowRoot | undefined)?.host as HTMLElement | undefined;
    if (!host) break;
    hosts.push(host);
    boundary = host;
  }
  const parts = [
    control.getAttribute('aria-label'),
    control.getAttribute('name'),
    control.getAttribute('placeholder'),
    control.getAttribute('data-automation-id'),
    control.getAttribute('data-testid'),
    ...hosts.flatMap(host => [host.getAttribute('label'), host.getAttribute('data-test'),
      host.closest('oc-datepicker')?.getAttribute('data-test')]),
  ];
  if (control.id) {
    const root = control.getRootNode?.() as ParentNode | undefined;
    parts.push(
      (root &&
        safeQueryAll<HTMLLabelElement>(root, 'label[for]').find(
          (label) => label.htmlFor === control.id
        )?.textContent) ||
        null
    );
  }
  parts.push(control.closest('label')?.textContent ?? null);
  return normalizeFieldSignal(parts.filter(Boolean).join(' '));
}

export function sectionSignal(section: HTMLElement): string {
  const heading = safeQuery<HTMLElement>(
    section,
    ':scope > legend, :scope > h1, :scope > h2, :scope > h3, :scope > h4'
  );
  return normalizeFieldSignal(
    [
      section.getAttribute('aria-label'),
      section.getAttribute('data-automation-id'),
      section.getAttribute('data-testid'),
      section.getAttribute('data-test'),
      section.id,
      section.className,
      heading?.textContent,
    ]
      .filter((part): part is string => typeof part === 'string')
      .join(' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
  );
}

export function classifySection(signal: string): FormSectionKind {
  if (
    /\b(work experience|employment|work history|professional experience|experience section)\b/.test(
      signal
    ) || /^experience(?:\s|$)/.test(signal)
  ) {
    return 'experience';
  }
  if (
    /\b(education|academic|school history|educational background)\b/.test(
      signal
    )
  ) {
    return 'education';
  }
  if (
    /\b(technical skills|professional skills|skills section|skills)\b/.test(
      signal
    )
  ) {
    return 'skills';
  }
  return 'unknown';
}

function classifyRepeatableField(
  signal: string,
  section: FormSectionKind
): ClassifiedControl['field'] | null {
  if (!signal || SENSITIVE_FIELD_RE.test(signal)) return null;
  if (section === 'skills') {
    return /\bskills?\b/.test(signal) ? 'skills' : null;
  }
  if (section === 'experience' || section === 'education') {
    // Split controls often inherit a startDate/endDate automation name.
    // Explicit month/year labels must win over that enclosing date signal.
    if (/\b(start month|from month)\b/.test(signal)) return 'startMonth';
    if (/\b(start year|from year)\b/.test(signal)) return 'startYear';
    if (/\b(end month|to month|graduation month)\b/.test(signal)) return 'endMonth';
    if (/\b(end year|to year|graduation year)\b/.test(signal)) return 'endYear';
    if (/\b(start date|from date|date from)\b/.test(signal)) return 'startDate';
    if (/\b(end date|to date|date to|graduation date)\b/.test(signal)) return 'endDate';
  }
  if (section === 'experience') {
    if (
      /\b(company|employer|organization|organisation)\b/.test(signal) &&
      !ORG_TRAP_RE.test(signal)
    )
      return 'company';
    if (/\b(job title|position title|role title|title|position)\b/.test(signal))
      return 'title';
    if (
      /\b(currently work|current role|currently employed|present)\b/.test(
        signal
      )
    )
      return 'isCurrent';
    if (/\b(description|responsibilities|duties|achievements)\b/.test(signal))
      return 'description';
    if (/\b(location|city)\b/.test(signal)) return 'location';
  }
  if (section === 'education') {
    if (/\b(school|university|college|institution)\b/.test(signal))
      return 'school';
    if (/\b(field of study|major|discipline)\b/.test(signal))
      return 'fieldOfStudy';
    if (/\b(degree|qualification)\b/.test(signal)) return 'degree';
    if (/\b(location|city)\b/.test(signal)) return 'location';
  }
  return null;
}

function classifyWithHints(
  root: HTMLElement,
  hints: AdapterHints
): ClassifiedControl[] {
  const sections = safeQueryAll<HTMLElement>(
    root,
    'fieldset, section, [role="group"], [data-automation-id], [data-testid], [data-test], [class*="experience" i], [class*="education" i], [class*="skills" i]'
  );
  const results: ClassifiedControl[] = [];
  const seen = new Set<Element>();
  const recordsBySection: Record<'experience' | 'education', Element[]> = {
    experience: [],
    education: [],
  };

  for (const sectionElement of sections) {
    const section = classifySection(sectionSignal(sectionElement));
    if (
      section !== 'experience' &&
      section !== 'education' &&
      section !== 'skills'
    )
      continue;

    for (const control of safeQueryAll<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >(sectionElement, 'input, textarea, select')) {
      if (seen.has(control)) continue;
      const field = classifyRepeatableField(controlSignal(control), section);
      if (!field) continue;

      let recordIndex: number | undefined;
      if (section === 'experience' || section === 'education') {
        const record =
          closestAcrossShadow(control, hints.repeatableRecords) || sectionElement;
        const records = recordsBySection[section];
        let index = records.indexOf(record);
        if (index < 0) {
          records.push(record);
          index = records.length - 1;
        }
        recordIndex = index;
      }

      seen.add(control);
      results.push({ element: control, section, recordIndex, field });
    }
  }
  return results;
}

function createAdapter(
  id: AtsPrefillAdapter['id'],
  hints: AdapterHints,
  matches: (document: Document) => boolean
): AtsPrefillAdapter {
  return {
    id,
    upload: UPLOAD_CAPABILITIES[id],
    capabilities: CAPABILITIES[id],
    matches,
    findApplicationRoot: (document) =>
      safeQueryAll<HTMLElement>(document, hints.applicationRoots).find(
        isInActiveControlTree
      ) || null,
    classifyRepeatableSections: (root) => classifyWithHints(root, hints),
  };
}

export const workdayPrefillAdapter: AtsPrefillAdapter = createAdapter(
  'workday',
  WORKDAY_HINTS,
  (document) => {
    const host = hostname(document);
    return (
      isHostOrSubdomain(host, 'myworkdayjobs.com') ||
      isHostOrSubdomain(host, 'myworkdaysite.com') ||
      isHostOrSubdomain(host, 'myworkday.com') ||
      !!safeQuery(
        document,
        '[data-automation-id="jobApplicationPage"], [data-automation-id="applyFlowPage"]'
      )
    );
  }
);

export const greenhousePrefillAdapter: AtsPrefillAdapter = createAdapter(
  'greenhouse',
  GREENHOUSE_HINTS,
  (document) => {
    const host = hostname(document);
    return (
      isHostOrSubdomain(host, 'greenhouse.io') ||
      isHostOrSubdomain(host, 'greenhouse.com')
    );
  }
);

export const genericPrefillAdapter: AtsPrefillAdapter = createAdapter(
  'generic',
  GENERIC_HINTS,
  () => true
);

export const leverPrefillAdapter: AtsPrefillAdapter = createAdapter(
  'lever',
  {
    applicationRoots: 'form#application-form',
    repeatableRecords: GENERIC_HINTS.repeatableRecords,
  },
  (document) => isHostOrSubdomain(hostname(document), 'lever.co')
);

export const smartRecruitersPrefillAdapter: AtsPrefillAdapter = createAdapter(
  'smartrecruiters',
  SMARTRECRUITERS_HINTS,
  (document) => isHostOrSubdomain(hostname(document), 'smartrecruiters.com')
);

export const ATS_PREFILL_ADAPTERS: readonly AtsPrefillAdapter[] = [
  workdayPrefillAdapter,
  greenhousePrefillAdapter,
  leverPrefillAdapter,
  smartRecruitersPrefillAdapter,
  createAdapter(
    'ashby',
    {
      applicationRoots: '[role="tabpanel"][aria-labelledby="job-application-form"]',
      repeatableRecords: GENERIC_HINTS.repeatableRecords,
    },
    (document) => isHostOrSubdomain(hostname(document), 'ashbyhq.com')
  ),
  createAdapter(
    'linkedin',
    {
      applicationRoots: '[data-test-modal],.jobs-easy-apply-modal,form',
      repeatableRecords: GENERIC_HINTS.repeatableRecords,
    },
    (document) => isHostOrSubdomain(hostname(document), 'linkedin.com')
  ),
  genericPrefillAdapter,
];

/** Packaged rollback: disable one adapter in a release without disabling others.
 * No remote selectors, scripts, or action instructions are accepted.
 */
export const DISABLED_ATS_ADAPTERS: ReadonlySet<AtsPrefillAdapter['id']> = new Set();

/** Specific adapters win; the conservative generic adapter is the fallback. */
export function selectAtsPrefillAdapter(
  document: Document,
  specificAdaptersEnabled = true,
  disabled: ReadonlySet<AtsPrefillAdapter['id']> = DISABLED_ATS_ADAPTERS
): AtsPrefillAdapter {
  if (!specificAdaptersEnabled) return genericPrefillAdapter;
  return (
    ATS_PREFILL_ADAPTERS.find((adapter) => !disabled.has(adapter.id) && adapter.matches(document)) ||
    genericPrefillAdapter
  );
}
