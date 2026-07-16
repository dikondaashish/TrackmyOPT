import {
  SENSITIVE_FIELD_RE,
  normalizeFieldSignal,
} from './easy-apply-matchers';
import type { ClassifiedControl, FormSectionKind } from './section-aware-classifier';

/** The V1 boundary intentionally exposes no untested ATS-specific IDs. */
export interface AtsPrefillAdapter {
  id: 'generic' | 'workday' | 'greenhouse';
  matches(document: Document): boolean;
  findApplicationRoot(document: Document): HTMLElement | null;
  classifyRepeatableSections(root: HTMLElement): ClassifiedControl[];
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
    '[data-automation-id="workExperienceCard"], [data-automation-id="educationCard"], [data-automation-id="formField"], [role="group"]',
};

const GREENHOUSE_HINTS: AdapterHints = {
  applicationRoots:
    'form#application-form, form#application_form, form.application--form',
  repeatableRecords:
    '[data-testid*="experience" i], [data-testid*="education" i], .field, .field-group, fieldset, [role="group"]',
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

function safeQuery<T extends Element>(root: ParentNode, selector: string): T | null {
  try {
    return root.querySelector<T>(selector);
  } catch {
    return null;
  }
}

function safeQueryAll<T extends Element>(root: ParentNode, selector: string): T[] {
  try {
    return Array.from(root.querySelectorAll<T>(selector));
  } catch {
    return [];
  }
}

function controlSignal(control: HTMLElement): string {
  const parts = [
    control.getAttribute('aria-label'),
    control.getAttribute('name'),
    control.getAttribute('placeholder'),
    control.getAttribute('data-automation-id'),
    control.getAttribute('data-testid'),
  ];
  if (control.id) {
    parts.push(control.ownerDocument?.querySelector(`label[for="${CSS.escape(control.id)}"]`)?.textContent ?? null);
  }
  parts.push(control.closest('label')?.textContent ?? null);
  return normalizeFieldSignal(parts.filter(Boolean).join(' '));
}

function sectionSignal(section: HTMLElement): string {
  const heading = safeQuery<HTMLElement>(section, ':scope > legend, :scope > h1, :scope > h2, :scope > h3, :scope > h4');
  return normalizeFieldSignal([
    section.getAttribute('aria-label'),
    section.getAttribute('data-automation-id'),
    section.getAttribute('data-testid'),
    section.id,
    section.className,
    heading?.textContent,
  ].filter((part): part is string => typeof part === 'string').join(' '));
}

function classifySection(signal: string): FormSectionKind {
  if (/\b(work experience|employment|work history|professional experience|experience section)\b/.test(signal)) {
    return 'experience';
  }
  if (/\b(education|academic|school history|educational background)\b/.test(signal)) {
    return 'education';
  }
  if (/\b(technical skills|professional skills|skills section|skills)\b/.test(signal)) {
    return 'skills';
  }
  return 'unknown';
}

function classifyRepeatableField(
  signal: string,
  section: FormSectionKind,
): ClassifiedControl['field'] | null {
  if (!signal || SENSITIVE_FIELD_RE.test(signal)) return null;
  if (section === 'skills') {
    return /\bskills?\b/.test(signal) ? 'skills' : null;
  }
  if (section === 'experience') {
    if (/\b(company|employer|organization|organisation)\b/.test(signal)) return 'company';
    if (/\b(job title|position title|role title|title|position)\b/.test(signal)) return 'title';
    if (/\b(start month|from month)\b/.test(signal)) return 'startMonth';
    if (/\b(start year|from year)\b/.test(signal)) return 'startYear';
    if (/\b(end month|to month)\b/.test(signal)) return 'endMonth';
    if (/\b(end year|to year)\b/.test(signal)) return 'endYear';
    if (/\b(currently work|current role|currently employed|present)\b/.test(signal)) return 'isCurrent';
    if (/\b(description|responsibilities|duties|achievements)\b/.test(signal)) return 'description';
    if (/\b(location|city)\b/.test(signal)) return 'location';
  }
  if (section === 'education') {
    if (/\b(school|university|college|institution)\b/.test(signal)) return 'school';
    if (/\b(field of study|major|discipline)\b/.test(signal)) return 'fieldOfStudy';
    if (/\b(degree|qualification)\b/.test(signal)) return 'degree';
    if (/\b(start month|from month)\b/.test(signal)) return 'startMonth';
    if (/\b(start year|from year)\b/.test(signal)) return 'startYear';
    if (/\b(end month|graduation month|to month)\b/.test(signal)) return 'endMonth';
    if (/\b(end year|graduation year|to year)\b/.test(signal)) return 'endYear';
    if (/\b(location|city)\b/.test(signal)) return 'location';
  }
  return null;
}

function classifyWithHints(root: HTMLElement, hints: AdapterHints): ClassifiedControl[] {
  const sections = safeQueryAll<HTMLElement>(
    root,
    'fieldset, section, [role="group"], [data-automation-id], [data-testid], [class*="experience" i], [class*="education" i], [class*="skills" i]',
  );
  const results: ClassifiedControl[] = [];
  const seen = new Set<Element>();

  for (const sectionElement of sections) {
    const section = classifySection(sectionSignal(sectionElement));
    if (section !== 'experience' && section !== 'education' && section !== 'skills') continue;

    const records: Element[] = [];
    for (const control of safeQueryAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      sectionElement,
      'input, textarea, select',
    )) {
      if (seen.has(control)) continue;
      const field = classifyRepeatableField(controlSignal(control), section);
      if (!field) continue;

      let recordIndex: number | undefined;
      if (section === 'experience' || section === 'education') {
        const record = control.closest(hints.repeatableRecords) || sectionElement;
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
  matches: (document: Document) => boolean,
): AtsPrefillAdapter {
  return {
    id,
    matches,
    findApplicationRoot: (document) => safeQuery<HTMLElement>(document, hints.applicationRoots),
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
      isHostOrSubdomain(host, 'myworkday.com') ||
      !!safeQuery(document, '[data-automation-id="jobApplicationPage"], [data-automation-id="applyFlowPage"]')
    );
  },
);

export const greenhousePrefillAdapter: AtsPrefillAdapter = createAdapter(
  'greenhouse',
  GREENHOUSE_HINTS,
  (document) => {
    const host = hostname(document);
    return (
      isHostOrSubdomain(host, 'greenhouse.io') ||
      !!safeQuery(document, 'form#application-form, form#application_form, form.application--form')
    );
  },
);

export const genericPrefillAdapter: AtsPrefillAdapter = createAdapter(
  'generic',
  GENERIC_HINTS,
  () => true,
);

export const ATS_PREFILL_ADAPTERS: readonly AtsPrefillAdapter[] = [
  workdayPrefillAdapter,
  greenhousePrefillAdapter,
  genericPrefillAdapter,
];

/** Specific adapters win; the conservative generic adapter is the fallback. */
export function selectAtsPrefillAdapter(document: Document): AtsPrefillAdapter {
  return ATS_PREFILL_ADAPTERS.find((adapter) => adapter.matches(document)) || genericPrefillAdapter;
}
