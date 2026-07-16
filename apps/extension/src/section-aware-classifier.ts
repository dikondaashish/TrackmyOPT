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
    | 'isCurrent'
    | 'description'
    | 'school'
    | 'degree'
    | 'fieldOfStudy'
    | 'skills';
}

const SECTION_PATTERNS: Array<[FormSectionKind, RegExp]> = [
  ['experience', /\b(work|employment|professional)\s+(experience|history)|experience\b/i],
  ['education', /\b(education|academic|school|university|college)\b/i],
  ['skills', /\b(technical\s+skills|core\s+skills|skills)\b/i],
  ['contact', /\b(contact|personal\s+information|basic\s+information)\b/i],
];

function normalize(value: string | null | undefined): string {
  return (value || '').replace(/\s+/g, ' ').trim();
}

function sectionFromText(text: string): FormSectionKind {
  const value = normalize(text);
  if (!value) return 'unknown';
  return SECTION_PATTERNS.find(([, pattern]) => pattern.test(value))?.[0] ?? 'unknown';
}

function ariaText(element: Element, root: ParentNode): string {
  const ids = ['aria-labelledby', 'aria-describedby']
    .flatMap((attribute) => (element.getAttribute(attribute) || '').split(/\s+/))
    .filter(Boolean);
  return ids.map((id) => root.querySelector(`#${CSS.escape(id)}`)?.textContent || '').join(' ');
}

function atsSectionText(element: Element): string {
  const attributes = [
    'data-automation-id', 'data-testid', 'data-test-id', 'data-section',
    'data-qa', 'data-fieldset', 'data-application-section',
  ];
  const values: string[] = [];
  let current: Element | null = element;
  while (current) {
    for (const attribute of attributes) values.push(current.getAttribute(attribute) || '');
    current = current.parentElement;
  }
  return values.join(' ');
}

function nearestHeadingText(element: Element, root: ParentNode): string {
  let current: Element | null = element;
  while (current && current !== root) {
    const direct = Array.from(current.children)
      .find((child) => /^(H[1-6]|LEGEND)$/.test(child.tagName));
    if (direct?.textContent) return direct.textContent;
    let sibling = current.previousElementSibling;
    while (sibling) {
      if (/^(H[1-6]|LEGEND)$/.test(sibling.tagName)) return sibling.textContent || '';
      sibling = sibling.previousElementSibling;
    }
    current = current.parentElement;
  }
  return '';
}

/** Resolve section context before attempting any history-field classification. */
export function detectFormSection(element: Element, root: ParentNode): FormSectionKind {
  const fieldset = element.closest('fieldset');
  const legend = fieldset?.querySelector(':scope > legend')?.textContent;
  for (const signal of [
    legend,
    ariaText(element, root),
    ...Array.from(element.parentElement?.closest('[aria-labelledby],[aria-describedby]') ?
      [ariaText(element.parentElement!.closest('[aria-labelledby],[aria-describedby]')!, root)] : []),
    atsSectionText(element),
    nearestHeadingText(element, root),
  ]) {
    const section = sectionFromText(signal || '');
    if (section !== 'unknown') return section;
  }
  return 'unknown';
}

function controlLabel(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string {
  const root = element.getRootNode() as Document | ShadowRoot;
  const labels = Array.from(element.labels || []).map((label) => label.textContent || '');
  const relationText = ariaText(element, root);
  return normalize([
    ...labels,
    element.getAttribute('aria-label'),
    element.getAttribute('name'),
    element.getAttribute('placeholder'),
    element.getAttribute('data-automation-id'),
    relationText,
  ].filter(Boolean).join(' ')).toLowerCase();
}

function classifyField(
  section: FormSectionKind,
  label: string,
): ClassifiedControl['field'] | null {
  if (section === 'experience') {
    if (/\b(company|employer|organization)\b/.test(label) && !/website|email|referr|manager/.test(label)) return 'company';
    if (/\b(job\s*title|position\s*title|role\s*title|title)\b/.test(label)) return 'title';
    if (/\b(location|city)\b/.test(label)) return 'location';
    if (/\b(start|from).*(month)\b|\bstartmonth\b/.test(label)) return 'startMonth';
    if (/\b(start|from).*(year)\b|\bstartyear\b/.test(label)) return 'startYear';
    if (/\b(end|to).*(month)\b|\bendmonth\b/.test(label)) return 'endMonth';
    if (/\b(end|to).*(year)\b|\bendyear\b/.test(label)) return 'endYear';
    if (/\b(current|currently).*(work|employ|role)|present\b/.test(label)) return 'isCurrent';
    if (/\b(description|responsibilit|achievement|duties)\b/.test(label)) return 'description';
  }
  if (section === 'education') {
    if (/\b(school|university|college|institution)\b/.test(label)) return 'school';
    if (/\bdegree|qualification\b/.test(label)) return 'degree';
    if (/\b(field|area)\s+of\s+study|major\b/.test(label)) return 'fieldOfStudy';
    if (/\b(start|from).*(month)\b|\bstartmonth\b/.test(label)) return 'startMonth';
    if (/\b(start|from).*(year)\b|\bstartyear\b/.test(label)) return 'startYear';
    if (/\b(end|graduation|to).*(month)\b|\bendmonth\b/.test(label)) return 'endMonth';
    if (/\b(end|graduation|to).*(year)\b|\bendyear\b/.test(label)) return 'endYear';
  }
  if (section === 'skills' && /\b(technical\s+skills|core\s+skills|skills)\b/.test(label)) return 'skills';
  return null;
}

export function classifySectionAwareControls(root: HTMLElement): ClassifiedControl[] {
  const controls = Array.from(root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    'input, textarea, select',
  ));
  const result: ClassifiedControl[] = [];
  for (const element of controls) {
    const section = detectFormSection(element, root);
    if (section === 'unknown' || section === 'contact') continue;
    const field = classifyField(section, controlLabel(element));
    if (field) result.push({ element, section, field });
  }
  return result;
}
